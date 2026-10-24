import { Injectable, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerCodeService } from './providers/customer-code.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly customerCodeService: CustomerCodeService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateCustomerDto,
  ): Promise<Customer> {

    return this.dataSource.transaction(
      async (manager) => {

        const code = await this.customerCodeService.generateCode(manager);

        const customer =  manager.getRepository(Customer).create({
          customerCode: code,
          name: dto.name,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          address: dto.address ?? null,
          description: dto.description ?? null,
        });

        return manager
          .getRepository(Customer)
          .save(customer);
      },
    );
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      relations: {
        onus: true,
      },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
        where: { id },
        relations: {
          onus: true,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${id} not found.`,
      );
    }

    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {

    const customer = await this.customerRepository.findOne({
        where: { id },
      });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${id} not found.`,
      );
    }

    if (dto.name !== undefined) {
      customer.name = dto.name;
    }

    if (dto.phone !== undefined) {
      customer.phone = dto.phone;
    }

    if (dto.email !== undefined) {
      customer.email = dto.email;
    }

    if (dto.address !== undefined) {
      customer.address = dto.address;
    }

    if (dto.description !== undefined) {
      customer.description = dto.description;
    }

    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {

    const customer = await this.customerRepository.findOne({
        where: { id },
      });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${id} not found.`,
      );
    }

    await this.customerRepository.delete(id);
  }


  async search(search?: string): Promise<Customer[]> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .orderBy('customer.name', 'ASC')
      .take(50);

    if (search?.trim()) {
      queryBuilder.andWhere(
        `(
          customer.name ILIKE :search
          OR customer.customerCode ILIKE :search
          OR customer.phone ILIKE :search
          OR customer.email ILIKE :search
        )`,
        {
          search: `%${search.trim()}%`,
        },
      );
    }

    return queryBuilder.getMany();
  }

}