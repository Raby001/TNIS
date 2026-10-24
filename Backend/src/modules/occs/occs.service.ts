import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AssetsService } from 'src/modules/assets/assets.service';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { Occ } from './entities/occ.entity';
import { CreateOccDto } from './dto/create-occ.dto';
import { UpdateOccDto } from './dto/update-occ.dto';
import { OccPort } from '../fiber-core-occ-port-connection/entities/occ-port.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';

@Injectable()
export class OccsService {
 constructor(
    @InjectRepository(Occ)
    private readonly occRepository: Repository<Occ>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    private readonly assetsService: AssetsService,

    private readonly dataSource: DataSource,
  ) {}

  // =======================================================
  // Create
  // =======================================================
  async create(
    dto: CreateOccDto,
    userId: string,
  ): Promise<Occ> {
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
    dto: CreateOccDto,
    userId: string,
    manager: EntityManager,
  ): Promise<Occ> {

        const assetTypeRepository = manager.getRepository(AssetType);

        const occRepository = manager.getRepository(Occ);

        // ==============================================
        // Validate Asset Type
        // ==============================================

        const assetType = await assetTypeRepository.findOne({
            where: {
              id: dto.assetTypeId,
            },
          });

        if (!assetType) {
          throw new NotFoundException(
            `Asset type with ID ${dto.assetTypeId} not found.`,
          );
        }

        if (assetType.name !== 'OCC') {
          throw new BadRequestException(
            'The selected asset type must be OCC.',
          );
        }

        // ==============================================
        // Create common Asset
        // ==============================================

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

        // ==============================================
        // Create OCC
        // ==============================================

        const occ = occRepository.create({
          assetId: asset.id,
          portCount: dto.portCount ?? null,
          usedPortCount: 0,
        });

        const savedOcc = await occRepository.save(occ);

        // ==============================================
        // Create OCC Ports
        // ==============================================

        const occPortCount = dto.portCount ?? 0;

        if (occPortCount > 0) {

          const occPortRepository = manager.getRepository(OccPort);

          const ports = Array.from(
            { length: occPortCount },
            (_, index) =>
              occPortRepository.create({
                occAssetId: savedOcc.assetId,
                portNumber: index + 1,
              }),
          );

          await occPortRepository.save(ports);
        }

        return savedOcc;

  }

  // =======================================================
  // Find All
  // =======================================================

  async findAll(): Promise<Occ[]> {

    return this.occRepository.find({
      relations: {
        asset: {
          assetType: true,
          status: true,
          site: true,
        },
        ports: true,
      },
    });
  }

  // =======================================================
  // Find One
  // =======================================================

  async findOne(
    assetId: string,
  ): Promise<any> {

    const occ =
      await this.occRepository.findOne({
        where: {
          assetId,
        },

        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
            createdBy: true,
            updatedBy: true,
          },
          ports: true,
        },
      });

    if (!occ) {
      throw new NotFoundException(
        `OCC with Asset ID ${assetId} not found.`,
      );
    }

    // =======================================================
    // Find active connections for all OCC ports
    // =======================================================

    const connectionRepository = this.dataSource.getRepository(FiberCoreOccPortConnection);

    const connections = await connectionRepository.find({
        where: {
          occPort: {
            occAssetId: assetId,
          },
          status: {
            code: 'ACTIVE',
          },
        },

        relations: {
          status: true,

          fiberCore: {
            fiberCable: true,
            status: true,
          },

          occPort: true,
        },
      });

    // =======================================================
    // Map connections by OCC port ID
    // =======================================================

    const connectionByPortId = new Map(
        connections.map(
          (connection) => [
            connection.occPortId,
            connection,
          ],
        ),
      );

    // =======================================================
    // Build port response
    // =======================================================

    const ports = occ.ports.map((port) => {

      const connection = connectionByPortId.get(port.id);

      if (!connection) {
        return {
          id: port.id,
          occAssetId: port.occAssetId,
          portNumber: port.portNumber,
          status: 'AVAILABLE',
          connection: null,
        };
      }

      return {
        id: port.id,
        occAssetId: port.occAssetId,
        portNumber: port.portNumber,
        status: 'USED',

        connection: {
          id: connection.id,

          fiberCoreId: connection.fiberCoreId,

          fiberCoreSide: connection.fiberCoreSide,

          status: connection.status.code,

          fiberCableId: connection.fiberCore.fiberCableId,

          coreNumber: connection.fiberCore.coreNumber,

          fiberCoreStatus: connection.fiberCore.status,
        },
      };
    });

    // =======================================================
    // Return OCC with enriched ports
    // =======================================================

    return {
      ...occ,

      ports,

      portCount: occ.portCount ?? ports.length,

      usedPortCount:
        ports.filter(
          (port) => port.status === 'USED',
        ).length,

      availablePortCount:
        ports.filter(
          (port) => port.status === 'AVAILABLE',
        ).length,
    };
  }

  // =======================================================
  // Update
  // =======================================================

  async update(
    assetId: string,
    dto: UpdateOccDto,
    userId: string,
  ): Promise<Occ> {

    return this.dataSource.transaction(
      async (manager) => {

        const occRepository = manager.getRepository(Occ);

        const occ = await occRepository.findOne({
            where: {
              assetId,
            },
          });

        if (!occ) {
          throw new NotFoundException(
            `OCC with Asset ID ${assetId} not found.`,
          );
        }

        // ==============================================
        // Update common Asset
        // ==============================================

        await this.assetsService.updateInternal(
          occ.assetId,
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

        // ==============================================
        // Update OCC-specific information
        // ==============================================

        if (dto.portCount !== undefined) {

          if (dto.portCount < occ.usedPortCount) {
            throw new BadRequestException(
              `Cannot reduce OCC port count to ${dto.portCount}. ` +
              `The OCC currently has ${occ.usedPortCount} ports in use.`,
            );
          }

          const currentPortCount = occ.portCount ?? 0;
          const newPortCount = dto.portCount;

          const occPortRepository = manager.getRepository(OccPort);

          // ==============================================
          // Increase port count
          // ==============================================

          if (newPortCount > currentPortCount) {

            const ports = Array.from(
              {
                length: newPortCount - currentPortCount,
              },
              (_, index) =>
                occPortRepository.create({
                  occAssetId: occ.assetId,
                  portNumber: currentPortCount + index + 1,
                }),
            );

            await occPortRepository.save(ports);
          }

          // ==============================================
          // Decrease port count
          // ==============================================

          else if (newPortCount < currentPortCount) {

            await occPortRepository
              .createQueryBuilder()
              .delete()
              .from(OccPort)
              .where('occ_asset_id = :occAssetId', {
                occAssetId: occ.assetId,
              })
              .andWhere('port_number > :newPortCount', {
                newPortCount,
              })
              .execute();
          }

          occ.portCount = newPortCount;
        }
        return occRepository.save(occ);
      },
    );
  }

  // =======================================================
  // Remove
  // =======================================================

  async remove(
    assetId: string,
  ): Promise<{message: string}> {

    const occ = await this.occRepository.findOne({
        where: {
          assetId,
        },
      });

    if (!occ) {
      throw new NotFoundException(
        `OCC with Asset ID ${assetId} not found.`,
      );
    }

    await this.assetsService.remove(assetId);

    return {
      message: `Occ with Asset ID ${assetId} deleted successfully.`,
    }
  }
}