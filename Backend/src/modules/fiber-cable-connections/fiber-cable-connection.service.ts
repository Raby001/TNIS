import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiberCable } from '../cables/entities/fiber-cable.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateFiberCableConnectionDto } from './dto/create-fiber-cable-connection.dto';
import { FiberCableConnection, FiberCableConnectionRole, FiberCableConnectionTargetType } from './entities/fiber-cable-connection.entity';
import { Site } from '../sites/entities/site.entity';

@Injectable()
export class FiberCableConnectionService {

  constructor(

    @InjectRepository(FiberCableConnection)
    private readonly connectionRepository: Repository<FiberCableConnection>,

    @InjectRepository(FiberCable)
    private readonly fiberCableRepository: Repository<FiberCable>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

  ) {}

  // ==========================================
  // Create Connection
  // ==========================================

  async create(
    dto: CreateFiberCableConnectionDto,
  ): Promise<FiberCableConnection> {

    // ==========================================
    // Find Fiber Cable
    // ==========================================

    const fiberCable = await this.fiberCableRepository.findOne({
      where: {
        assetId: dto.fiberCableId,
      },
    });

    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber Cable with ID ${dto.fiberCableId} not found.`,
      );
    }


    // ==========================================
    // Validate Target
    // ==========================================

    if (dto.targetType === FiberCableConnectionTargetType.ASSET) {

      // ------------------------------------------
      // Asset target requires assetId
      // ------------------------------------------

      if (!dto.assetId) {
        throw new BadRequestException(
          'assetId is required when targetType is ASSET.',
        );
      }

      // ------------------------------------------
      // Asset target cannot have siteId
      // ------------------------------------------

      if (dto.siteId) {
        throw new BadRequestException(
          'siteId must not be provided when targetType is ASSET.',
        );
      }

      // ------------------------------------------
      // Find Asset
      // ------------------------------------------

      const asset = await this.assetRepository.findOne({
        where: {
          id: dto.assetId,
        },
        relations: {
          assetType: true,
        },
      });

      if (!asset) {
        throw new NotFoundException(
          `Asset with ID ${dto.assetId} not found.`,
        );
      }

      if (!asset.geometry || asset.geometry.type !== 'Point') {
        throw new BadRequestException(
          `Asset "${asset.name}" must have Point geometry to be used as a fiber cable connection target.`,
        );
      }      

    } else if (
      dto.targetType === FiberCableConnectionTargetType.SITE
    ) {

      // ------------------------------------------
      // Site target requires siteId
      // ------------------------------------------

      if (!dto.siteId) {
        throw new BadRequestException(
          'siteId is required when targetType is SITE.',
        );
      }

      // ------------------------------------------
      // Site target cannot have assetId
      // ------------------------------------------

      if (dto.assetId) {
        throw new BadRequestException(
          'assetId must not be provided when targetType is SITE.',
        );
      }

      // ------------------------------------------
      // Find Site
      // ------------------------------------------

      const site = await this.siteRepository.findOne({
        where: {
          id: dto.siteId,
        },
      });

      if (!site) {
        throw new NotFoundException(
          `Site with ID ${dto.siteId} not found.`,
        );
      }

      if (!site.geometry || site.geometry.type !== 'Point') {
        throw new BadRequestException(
          `Site "${site.name}" must have Point geometry to be used as a fiber cable connection target.`,
        );
      }

    } else {
      throw new BadRequestException(
        `Unsupported target type: ${dto.targetType}.`,
      );
    }


    // ==========================================
    // Validate START
    // ==========================================

    if (
      dto.connectionRole === FiberCableConnectionRole.START
    ) {

      const existingStart = await this.connectionRepository.findOne({
          where: {
            fiberCableId: dto.fiberCableId,
            connectionRole: FiberCableConnectionRole.START,
          },
        });

      if (existingStart) {
        throw new BadRequestException(
          'Fiber Cable already has a START connection.',
        );
      }
    }


    // ==========================================
    // Validate END
    // ==========================================

    if (
      dto.connectionRole === FiberCableConnectionRole.END
    ) {

      const existingEnd = await this.connectionRepository.findOne({
          where: {
            fiberCableId: dto.fiberCableId,
            connectionRole: FiberCableConnectionRole.END,
          },
        });

      if (existingEnd) {
        throw new BadRequestException(
          'Fiber Cable already has an END connection.',
        );
      }
    }


    // ==========================================
    // Prevent duplicate target connection
    // ==========================================

    if (dto.targetType === FiberCableConnectionTargetType.ASSET) {

      const existingAssetConnection =
        await this.connectionRepository.findOne({
          where: {
            fiberCableId: dto.fiberCableId,
            assetId: dto.assetId,
          },
        });

      if (existingAssetConnection) {
        throw new BadRequestException(
          `Asset with ID ${dto.assetId} is already connected to this Fiber Cable.`,
        );
      }

    } else {

      const existingSiteConnection = await this.connectionRepository.findOne({
          where: {
            fiberCableId: dto.fiberCableId,
            siteId: dto.siteId,
          },
        });

      if (existingSiteConnection) {
        throw new BadRequestException(
          `Site with ID ${dto.siteId} is already connected to this Fiber Cable.`,
        );
      }
    }

    // ==========================================
    // Determine Sequence
    // ==========================================

    const existingConnections = await this.connectionRepository.find({
        where: {
          fiberCableId: dto.fiberCableId,
        },
        order: {
          sequence: 'ASC',
        },
      });

    // START must always be the first connection
    if (dto.connectionRole === FiberCableConnectionRole.START) {
      if (existingConnections.length > 0) {
        throw new BadRequestException(
          'START connection must be the first connection of the Fiber Cable.',
        );
      }
    }

    // MIDDLE is inserted before END
    if (dto.connectionRole === FiberCableConnectionRole.MIDDLE) {
      const existingEnd = existingConnections.find(
        (connection) =>
          connection.connectionRole === FiberCableConnectionRole.END,
      );

      if (existingEnd) {
        // Move END one position forward.
        existingEnd.sequence = existingEnd.sequence! + 1;

        await this.connectionRepository.save(existingEnd);

        // New MIDDLE takes END's old position.
        const sequence = existingEnd.sequence! - 1;

        // ==========================================
        // Create Connection
        // ==========================================

        const connection = this.connectionRepository.create({
            fiberCableId: dto.fiberCableId,

            targetType: dto.targetType,

            assetId:
              dto.targetType === FiberCableConnectionTargetType.ASSET
                ? dto.assetId!
                : null,

            siteId:
              dto.targetType === FiberCableConnectionTargetType.SITE
                ? dto.siteId!
                : null,

            connectionRole: dto.connectionRole,

            sequence,
          });

        return this.connectionRepository.save(connection);
      }
    }

    // END or MIDDLE without existing END
    const sequence = existingConnections.length > 0
        ? Math.max(
            ...existingConnections.map(
              (connection) => connection.sequence ?? -1,
            ),
          ) + 1
        : 0;

    // ==========================================
    // Create Connection
    // ==========================================

    const connection = this.connectionRepository.create({
        fiberCableId: dto.fiberCableId,

        targetType: dto.targetType,

        assetId: dto.targetType === FiberCableConnectionTargetType.ASSET ? dto.assetId! : null,

        siteId: dto.targetType === FiberCableConnectionTargetType.SITE ? dto.siteId! : null,

        connectionRole: dto.connectionRole,

        sequence,
      });

    return this.connectionRepository.save(connection);
  }

  // ==========================================
  // Find Cable Connections
  // ==========================================

  async findByFiberCable(
    fiberCableId: string,
  ): Promise<FiberCableConnection[]> {

    const fiberCable = await this.fiberCableRepository.findOne({
        where: {
          assetId: fiberCableId,
        },
      });

    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber Cable with ID ${fiberCableId} not found.`,
      );
    }

    return this.connectionRepository.find({
      where: {
        fiberCableId,
      },

      relations: {
        asset: {
          assetType: true,
        },
        site: true,
      },

      order: {
        sequence: 'ASC',
      },
    });
  }

}