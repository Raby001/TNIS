import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@Injectable()
export class AuditLogsService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}

  async findAll(query: AuditLogQueryDto) {
    const { page, limit, sortBy, sortOrder, from, to } = query;
    if (from && to && Date.parse(from) >= Date.parse(to)) {
      throw new BadRequestException('from must precede to');
    }
    const rows = this.logs.createQueryBuilder('log');
    for (const field of ['userId', 'username', 'action', 'entityType', 'entityId'] as const) {
      if (query[field] !== undefined) {
        rows.andWhere(`log.${field} = :${field}`, { [field]: query[field] });
      }
    }
    if (from) rows.andWhere('log.createdAt >= :from', { from });
    if (to) rows.andWhere('log.createdAt < :to', { to });
    const [data, total] = await rows.orderBy(`log.${sortBy}`, sortOrder)
      .addOrderBy('log.id', sortOrder).skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const log = await this.logs.findOneBy({ id });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }
}
