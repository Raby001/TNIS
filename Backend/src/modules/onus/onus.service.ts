import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AssetsService } from 'src/modules/assets/assets.service';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { CreateOnuDto } from './dto/create-onu.dto';
import { UpdateOnuDto } from './dto/update-onu.dto';
import { Onu } from './entities/onu.entity';
import { CustomerCodeService } from '../customers/providers/customer-code.service';
import { DataSource } from 'typeorm';
@Injectable()
export class OnusService {
  constructor(
    @InjectRepository(Onu)
    private readonly onuRepository: Repository<Onu>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    private readonly assetsService: AssetsService,

    private readonly customerCodeService: CustomerCodeService,
    
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateOnuDto,
    userId: string,
  ): Promise<Onu> {
    const result = await this.dataSource.transaction(
      async (manager) => {
        return this.createInternal(
          dto,
          userId,
          manager,
        );
      },
    );

    return this.findOne(result.assetId);
  }

  async createInternal(
    dto: CreateOnuDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Onu> {

        const customerRepository = manager.getRepository(Customer);

        let customerId: string;

        // =================================================
        //  1. Use an existing customer
        // =================================================
        
        if (dto.customerId) {
          const existingCustomer =
            await customerRepository.findOne({
              where: {
                id: dto.customerId,
              },
            });

          if (!existingCustomer) {
            throw new NotFoundException(
              `Customer with ID ${dto.customerId} not found.`,
            );
          }

          customerId = existingCustomer.id;
        }

        // =================================================
        //  2. Create a new customer
        // =================================================
        else if (dto.customer) {
          const customerCode = await this.customerCodeService.generateCode(manager);

          const newCustomer = customerRepository.create({
              customerCode,
              name: dto.customer.name,
              phone: dto.customer.phone ?? null,
              email: dto.customer.email ?? null,
              address: dto.customer.address ?? null,
              description: dto.customer.description ?? null,
            });

          const savedCustomer = await customerRepository.save(newCustomer);

          customerId = savedCustomer.id;
        }

        // =================================================
        // 3. Neither customerId nor customer was provided
        // =================================================

        else {
          throw new BadRequestException(
            'Either customerId or customer must be provided.',
          );
        }

        // =================================================
        // 4. Create the common Asset
        // =================================================

        const asset = await this.assetsService.createInternal(
            {
              name: dto.name,
              description: dto.description,
              assetTypeId: dto.assetTypeId,
              statusId: dto.statusId,
              siteId: dto.siteId,
              assetTag: dto.assetTag,
              serialNumber: dto.serialNumber,
              purchaseDate: dto.purchaseDate,
              installationDate: dto.installationDate,
              warrantyStart: dto.warrantyStart,
              warrantyEnd: dto.warrantyEnd,
              geometry: dto.geometry,
            },
            userId,
            manager,
          );

        // =================================================
        // 5. Create the ONU
        // =================================================

        const onuRepository =
          manager.getRepository(Onu);

        const onu = onuRepository.create({
          assetId: asset.id,
          customerId,
          macAddressONU: dto.macAddressONU ?? null,
          macAddressRouter: dto.macAddressRouter ?? null,
          ponType: dto.ponType ?? null,
          dataAllowanceGb: dto.dataAllowanceGb ?? null,
          downloadSpeedMbps: dto.downloadSpeedMbps ?? null,
          uploadSpeedMbps: dto.uploadSpeedMbps ?? null,
        });

        return onuRepository.save(onu);
  }

  async findAll(): Promise<Onu[]> {
    return this.onuRepository.find({
      relations: {
        asset: {
          assetType: true,
          status: true,
          site: true,
        },
        customer: true,
      },
    });
  }

  async findOne(id: string): Promise<Onu> {
    const onu = await this.onuRepository.findOne({
      where: { assetId: id },
      relations: {
        asset: {
          assetType: true,
          status: true,
          site: true,
          createdBy: true,
          updatedBy: true,
        },
        customer: true,
      },
    });

    if (!onu) {
      throw new NotFoundException(
        `ONu with ID ${id} not found.`,
      );
    }

    return onu;
  }

  async update(
    id: string,
    dto: UpdateOnuDto,
    userId: string,
  ): Promise<Onu> {
    return this.onuRepository.manager.transaction(
      async (manager) => {
        const onuRepository = manager.getRepository(Onu);

        const customerRepository = manager.getRepository(Customer);

        const onu = await onuRepository.findOne({
          where: { assetId: id },
        });

        if (!onu) {
          throw new NotFoundException(
            `ONU with ID ${id} not found.`,
          );
        }

        if (dto.customerId !== undefined) {
          const customer =
            await customerRepository.findOne({
              where: {
                id: dto.customerId,
              },
            });

          if (!customer) {
            throw new NotFoundException(
              `Customer with ID ${dto.customerId} not found.`,
            );
          }

          onu.customerId = dto.customerId;
        }

        await this.assetsService.updateInternal(
          onu.assetId,
          {
            name: dto.name,
            description: dto.description,
            statusId: dto.statusId,
            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,
            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,
            geometry: dto.geometry,
          },
          userId,
          manager,
        );

        if (dto.macAddressONU !== undefined) {
          onu.macAddressONU = dto.macAddressONU;
        }

        if (dto.macAddressRouter !== undefined) {
          onu.macAddressRouter = dto.macAddressRouter;
        }

        if (dto.ponType !== undefined) {
          onu.ponType = dto.ponType;
        }

        if (dto.downloadSpeedMbps !== undefined) {
          onu.downloadSpeedMbps = dto.downloadSpeedMbps;
        }

        if (dto.uploadSpeedMbps !== undefined) {
          onu.uploadSpeedMbps = dto.uploadSpeedMbps;
        }

        if (dto.dataAllowanceGb !== undefined) {
          onu.dataAllowanceGb = dto.dataAllowanceGb;
        }

        return onuRepository.save(onu);
      },
    );
  }

  async remove(id: string): Promise<{ message: string }> {
    const onu = await this.onuRepository.findOne({
      where: { assetId: id },
    });

    if (!onu) {
      throw new NotFoundException(
        `ONU with Asset ID ${id} not found.`,
      );
    }

    await this.assetsService.remove(id);

    return {
      message: `ONU with Asset ID ${id} deleted successfully.`,
    };
  }
}