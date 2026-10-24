import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CustomerCodeService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async generateCode(
    manager?: EntityManager,
  ): Promise<string> {
    const entityManager = manager ?? this.dataSource.manager;

    await entityManager.query(
      `SELECT pg_advisory_xact_lock(
        hashtext('customer-code-generation')
      )`,
    );

    const result = await entityManager.query(`
      SELECT COALESCE(
        MAX(
          CAST(
            SUBSTRING(customer_code FROM 'CUS-([0-9]+)')
            AS INTEGER
          )
        ),
        0
      ) + 1 AS next_number
      FROM customers
      WHERE customer_code LIKE 'CUS-%'
    `);

    const nextNumber = Number(result[0].next_number);

    return `CUS-${String(nextNumber).padStart(6, '0')}`;
  }
}