import { randomBytes, randomUUID } from 'node:crypto';
import { Controller, INestApplication, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { TransactionStartEvent } from 'typeorm';
import { AuditActorInterceptor, AuditActorSubscriber } from '../src/modules/audit-logs/audit-actor';
import { AuditAdminGuard } from '../src/modules/audit-logs/audit-admin.guard';
import { AuditLogsController } from '../src/modules/audit-logs/audit-logs.controller';
import { AuditLogsService } from '../src/modules/audit-logs/audit-logs.service';
import { AuditLog } from '../src/modules/audit-logs/entities/audit-log.entity';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt-strategy';
import { UsersService } from '../src/modules/users/users.service';

const subscriber = new AuditActorSubscriber();
@Controller('test-actor')
class ProbeController {
  @Post()
  @UseGuards(JwtAuthGuard)
  async probe() {
    await new Promise(resolve => setImmediate(resolve));
    const query = jest.fn();
    await subscriber.afterTransactionStart({ queryRunner: { query } } as unknown as TransactionStartEvent);
    return query.mock.calls;
  }
}

describe('audit HTTP contract and transaction context', () => {
  let app: INestApplication;
  const admin = { id: randomUUID(), username: 'test-admin', role: { name: 'ADMIN' }, isActive: true };
  const viewer = { id: randomUUID(), username: 'test-viewer', role: { name: 'VIEWER' }, isActive: true };
  const secret = randomBytes(32).toString('hex');
  const jwt = new JwtService({ secret });
  const auth = (id: string) => 'Bearer ' + jwt.sign({ sub: id });
  const row = { id: randomUUID(), action: 'UPDATE', entityType: 'sites' };
  const qb = {
    andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(), getManyAndCount: jest.fn().mockResolvedValue([[row], 3]),
  };
  const repo = { createQueryBuilder: jest.fn(() => qb), findOneBy: jest.fn() };
  const path = '/api/v2/audit-logs';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuditLogsController, ProbeController],
      providers: [AuditLogsService, AuditAdminGuard, JwtStrategy,
        { provide: ConfigService, useValue: new ConfigService({ jwt: { secret } }) },
        { provide: UsersService, useValue: { findById: async (id: string) =>
          [admin, viewer].find(user => user.id === id) } },
        { provide: getRepositoryToken(AuditLog), useValue: repo },
        { provide: APP_INTERCEPTOR, useClass: AuditActorInterceptor }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => jest.clearAllMocks());

  it.each(['', '/' + row.id])('enforces authentication and admin role on %s', async suffix => {
    const url = path + suffix;
    await request(app.getHttpServer()).get(url).expect(401);
    await request(app.getHttpServer()).get(url).set('Authorization', auth(viewer.id)).expect(403);
    expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    expect(repo.findOneBy).not.toHaveBeenCalled();
  });

  it('filters, paginates and applies stable sorting after validation', async () => {
    const filters = { userId: admin.id, username: admin.username, action: 'UPDATE', entityType: 'sites', entityId: randomUUID() };
    const from = '2026-01-01T00:00:00Z', to = '2026-02-01T00:00:00Z';
    await request(app.getHttpServer()).get(path).set('Authorization', auth(admin.id))
      .query({ ...filters, from, to, page: 2, limit: 1, sortBy: 'entityType', sortOrder: 'ASC' })
      .expect(200, { data: [row], meta: { page: 2, limit: 1, total: 3, totalPages: 3 } });
    for (const [field, value] of Object.entries(filters)) {
      expect(qb.andWhere).toHaveBeenCalledWith(`log.${field} = :${field}`, { [field]: value });
    }
    expect(qb.andWhere).toHaveBeenCalledWith('log.createdAt >= :from', { from });
    expect(qb.andWhere).toHaveBeenCalledWith('log.createdAt < :to', { to });
    expect(qb.orderBy).toHaveBeenCalledWith('log.entityType', 'ASC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('log.id', 'ASC');
    expect(qb.skip).toHaveBeenCalledWith(1);
    expect(qb.take).toHaveBeenCalledWith(1);
  });
  it.each([{ page: 0 }, { limit: 101 }, { sortBy: 'description' }, { action: 'SAVE' },
    { entityId: 'abc' }, { unknown: 1 }, { from: '2026-02-30' },
    { from: '2026-02-01T00:00:00Z', to: '2026-01-01T00:00:00Z' },
  ])('rejects invalid query %j', async query => {
    await request(app.getHttpServer()).get(path).set('Authorization', auth(admin.id)).query(query).expect(400);
    expect(qb.getManyAndCount).not.toHaveBeenCalled();
  });
  it('returns detail, missing-record and malformed-ID responses', async () => {
    repo.findOneBy.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    const get = (id: string) => request(app.getHttpServer()).get(path + '/' + id).set('Authorization', auth(admin.id));
    await get(row.id).expect(200, row);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: row.id });
    await get(randomUUID()).expect(404);
    await get('invalid').expect(400);
  });
  it('exposes no mutation routes', async () => {
    const server = app.getHttpServer();
    await request(server).post(path).set('Authorization', auth(admin.id)).expect(404);
    await request(server).patch(path + '/' + row.id).set('Authorization', auth(admin.id)).expect(404);
    await request(server).delete(path + '/' + row.id).set('Authorization', auth(admin.id)).expect(404);
  });
  it('isolates concurrent authenticated requests and leaves background transactions untagged', async () => {
    await Promise.all([admin, viewer].map(async user => {
      const res = await request(app.getHttpServer()).post('/api/v2/test-actor')
        .set('Authorization', auth(user.id)).send({ username: 'untrusted' }).expect(201);
      expect(res.body).toEqual([[expect.stringContaining("set_config('tnis.actor_id', $1, true)"),
        [user.id, user.username]]]);
    }));
    const query = jest.fn();
    await subscriber.afterTransactionStart({ queryRunner: { query } } as unknown as TransactionStartEvent);
    expect(query).not.toHaveBeenCalled();
  });
});
