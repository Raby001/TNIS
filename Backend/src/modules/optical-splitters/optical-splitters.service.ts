import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { Lcp } from '../lcps/entities/lcp.entity';
import { SplitterRatio } from './entities/splitter-ratio.entity';
import { OpticalSplitter } from './entities/optical-splitter.entity';
import { OpticalSplitterPort, OpticalSplitterPortType } from './entities/optical-splitter-port.entity';
import { CreateOpticalSplitterDto } from './dto/create-optical-splitter.dto';
import { UpdateOpticalSplitterDto } from './dto/update-optical-splitter.dto';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class OpticalSplittersService {

  constructor(
    private readonly dataSource: DataSource,

    private readonly assetsService: AssetsService,
  ) {}

  // ========================================================
  // Validate Parent Asset
  // ========================================================

  private async validateParentAsset(
    parentAssetId: string,
    manager: EntityManager,
  ): Promise<Asset> {

    const assetRepo = manager.getRepository(Asset);

    const asset = await assetRepo.findOne({
        where: {
          id: parentAssetId,
        },

        relations: {
          assetType: true,
        },
      });

    if (!asset) {
      throw new NotFoundException(
        `Parent asset with ID ${parentAssetId} not found.`,
      );
    }

    const qualifier = asset.assetType?.qualifier
        ?.trim()
        .toUpperCase();

    if (
      qualifier !== 'LCP' &&
      qualifier !== 'NAP'
    ) {
      throw new BadRequestException(
        'Optical splitter can only belong to an LCP or NAP asset.',
      );
    }

    return asset;
  }

  // ========================================================
  // Validate LCP Splitter Capacity
  // ========================================================

  private async validateLcpSplitterCapacity(
    parentAssetId: string,
    manager: EntityManager,
    excludeSplitterId?: string,
  ): Promise<void> {

    // ------------------------------------------------------
    // Find Parent Asset
    // ------------------------------------------------------

    const assetRepo = manager.getRepository(Asset);

    const parentAsset = await assetRepo.findOne({
        where: {
          id: parentAssetId,
        },

        relations: {
          assetType: true,
        },
      });

    if (!parentAsset) {
      throw new NotFoundException(
        `Parent asset with ID ${parentAssetId} not found.`,
      );
    }

    const qualifier = parentAsset.assetType?.qualifier?.trim().toUpperCase();

    // ------------------------------------------------------
    // Only LCP has splitter capacity
    // ------------------------------------------------------

    if (qualifier !== 'LCP') {
      return;
    }

    // ------------------------------------------------------
    // Find LCP
    // ------------------------------------------------------

    const lcpRepo = manager.getRepository(Lcp);

    const lcp = await lcpRepo.findOne({
        where: {
          assetId: parentAssetId,
        },
      });

    if (!lcp) {
      throw new NotFoundException(
        `LCP with Asset ID ${parentAssetId} not found.`,
      );
    }

    // ------------------------------------------------------
    // Count Existing Splitters
    // ------------------------------------------------------

    const splitterRepo = manager.getRepository(OpticalSplitter);

    const queryBuilder = splitterRepo
        .createQueryBuilder('splitter')
        .where(
          'splitter.parent_asset_id = :parentAssetId',
          {
            parentAssetId,
          },
        );

    // When moving an existing splitter to this LCP,
    // exclude that splitter from the count.
    if (excludeSplitterId) {
      queryBuilder.andWhere(
        'splitter.id != :excludeSplitterId',
        {
          excludeSplitterId,
        },
      );
    }

    const currentSplitterCount =  await queryBuilder.getCount();

    // ------------------------------------------------------
    // Validate Capacity
    // ------------------------------------------------------

    if (
      currentSplitterCount >= lcp.splitterCapacity
    ) {
      throw new BadRequestException(
        `LCP splitter capacity has been reached. Capacity: ${lcp.splitterCapacity}, current splitters: ${currentSplitterCount}.`,
      );
    }
  }

  // ========================================================
  // Create
  // ========================================================

  async create(
    dto: CreateOpticalSplitterDto,
    userId: string,
  ): Promise<OpticalSplitter> {
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


  // ========================================================
  // Create Internal
  // ========================================================

  async createInternal(
    dto: CreateOpticalSplitterDto,
    userId: string,
    manager: EntityManager,
  ): Promise<OpticalSplitter> {
    const splitterRepository = manager.getRepository(OpticalSplitter);

    const ratioRepository = manager.getRepository(SplitterRatio);

    const portRepository = manager.getRepository(OpticalSplitterPort);

    // ========================================================
    // 1. Validate Parent Asset
    // ========================================================

    let parentAsset: Asset | null = null;

    if (dto.parentAssetId) {
      parentAsset = await this.validateParentAsset(
        dto.parentAssetId,
        manager,
      );

      // ======================================================
      // 2. Validate LCP Capacity
      // ======================================================

      await this.validateLcpSplitterCapacity(
        parentAsset.id,
        manager,
      );
    }

    // ========================================================
    // 3. Find Splitter Ratio
    // ========================================================

    const ratio = await ratioRepository.findOne({
        where: {
          id: dto.splitterRatioId,
        },
      });

    if (!ratio) {
      throw new NotFoundException(
        `Splitter ratio with ID ${dto.splitterRatioId} not found.`,
      );
    }

    // ========================================================
    // 4. Validate Ratio
    // ========================================================

    if (ratio.inputCount !== 1) {
      throw new BadRequestException(
        'Optical splitter must have exactly one input.',
      );
    }

    if (ratio.outputCount < 1) {
      throw new BadRequestException(
        'Optical splitter must have at least one output.',
      );
    }

    // ========================================================
    // 5. Create Common Asset
    // ========================================================

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

    // ========================================================
    // 6. Create Optical Splitter
    // ========================================================

    const splitter =
      splitterRepository.create({
        assetId: asset.id,
        asset,

        parentAssetId: parentAsset?.id ?? null,

        parentAsset,

        splitterRatioId: ratio.id,

        splitterRatio: ratio,
      });

    const savedSplitter = await splitterRepository.save(splitter);

    // ========================================================
    // 7. Create Input Port
    // ========================================================

    const inputPort =
      portRepository.create({
        opticalSplitterId: savedSplitter.assetId,

        opticalSplitter: savedSplitter,

        portType: OpticalSplitterPortType.INPUT,

        portNumber: 1,
      });

    await portRepository.save(inputPort);

    // ========================================================
    // 8. Create Output Ports
    // ========================================================

    const outputPorts = Array.from(
        {
          length: ratio.outputCount,
        },
        (_, index) =>
          portRepository.create({
            opticalSplitterId: savedSplitter.assetId,

            opticalSplitter: savedSplitter,

            portType: OpticalSplitterPortType.OUTPUT,

            portNumber: index + 1,
          }),
      );

    await portRepository.save(outputPorts);

    // ========================================================
    // 9. Return Saved Splitter
    // ========================================================

    const result =
      await splitterRepository.findOne({
        where: {
          assetId: savedSplitter.assetId,
        },

        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
          },

          parentAsset: {
            assetType: true,
            status: true,
            site: true,
          },

          splitterRatio: true,

          ports: true,
        },
      });

    if (!result) {
      throw new NotFoundException(
        `Optical splitter with Asset ID ${savedSplitter.assetId} not found after creation.`,
      );
    }

    return result;
  }

  // ========================================================
  // Find All
  // ========================================================

  async findAll(): Promise<OpticalSplitter[]> {
    return this.dataSource
      .getRepository(OpticalSplitter)
      .find({
        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
            createdBy: true,
          },

          parentAsset: {
            assetType: true,
            status: true,
            site: true,
          },

          splitterRatio: true,

          ports: true,
        },

        order: {
          asset: {
            createdAt: 'DESC',
          },
        },
      });
  }

  // ========================================================
  // Find One
  // ========================================================

  async findOne(
    id: string,
  ): Promise<OpticalSplitter> {
    const splitterRepository = this.dataSource.getRepository(OpticalSplitter);

    const splitter = await splitterRepository.findOne({
        where: {
          assetId: id,
        },

        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
            createdBy: true,
            updatedBy: true,
          },

          parentAsset: {
            assetType: true,
            status: true,
            site: true,
          },

          splitterRatio: true,

          ports: true,
        },
      });

    if (!splitter) {
      throw new NotFoundException(
        `Optical splitter with Asset ID ${id} not found.`,
      );
    }

    return splitter;
  }


  // ========================================================
  // Find By Parent Asset
  // ========================================================

  async findByParentAsset(
    parentAssetId: string,
  ): Promise<OpticalSplitter[]> {
    const manager = this.dataSource.manager;

    await this.validateParentAsset(
      parentAssetId,
      manager,
    );

    return this.dataSource
      .getRepository(OpticalSplitter)
      .find({
        where: {
          parentAssetId,
        },

        relations: {
          asset: {
            assetType: true,
            status: true,
            site: true,
          },

          parentAsset: {
            assetType: true,
            status: true,
            site: true,
          },

          splitterRatio: true,

          ports: true,
        },

        order: {
          asset: {
            createdAt: 'ASC',
          },
        },
      });
  }

  // ========================================================
  // Update
  // ========================================================

  async update(
    id: string,
    dto: UpdateOpticalSplitterDto,
    userId: string,
  ): Promise<OpticalSplitter> {
    return this.dataSource.transaction(
      async (manager) => {
        const splitterRepository = manager.getRepository(OpticalSplitter);

        const ratioRepository = manager.getRepository(SplitterRatio);

        // ==================================================
        // 1. Find Splitter
        // ==================================================

        const splitter = await splitterRepository.findOne({
            where: {
              assetId: id,
            },

            relations: {
              asset: true,
              parentAsset: {
                assetType: true,
              },
              splitterRatio: true,
              ports: true,
            },
          });

        if (!splitter) {
          throw new NotFoundException(
            `Optical splitter with Asset ID ${id} not found.`,
          );
        }

        // ==================================================
        // 2. Update Common Asset
        // ==================================================

        await this.assetsService.updateInternal(
          splitter.assetId,
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

        // ==================================================
        // 3. Parent Asset
        // ==================================================

        if (
          dto.parentAssetId !== undefined
        ) {
          // ----------------------------------------------
          // Detach parent
          // ----------------------------------------------

          if (dto.parentAssetId === null) {
            splitter.parentAssetId = null;
            splitter.parentAsset = null;
          }

          // ----------------------------------------------
          // Assign / Change parent
          // ----------------------------------------------

          else if (dto.parentAssetId !== splitter.parentAssetId) {
            const newParent = await this.validateParentAsset(
                dto.parentAssetId,
                manager,
              );

            // --------------------------------------------
            // Validate New Parent Capacity
            // --------------------------------------------

            await this.validateLcpSplitterCapacity(
              newParent.id,
              manager,
              splitter.assetId,
            );

            splitter.parentAssetId = newParent.id;

            splitter.parentAsset = newParent;
          }
        }

        // ==================================================
        // 4. Splitter Ratio
        // ==================================================

        if (
          dto.splitterRatioId !== undefined && dto.splitterRatioId !== splitter.splitterRatioId
        ) {
          const newRatio = await ratioRepository.findOne({
              where: {
                id: dto.splitterRatioId,
              },
            });

          if (!newRatio) {
            throw new NotFoundException(
              `Splitter ratio with ID ${dto.splitterRatioId} not found.`,
            );
          }

          // ----------------------------------------------
          // Validate Ratio
          // ----------------------------------------------

          if (newRatio.inputCount !== 1) {
            throw new BadRequestException(
              'Optical splitter must have exactly one input.',
            );
          }

          if (newRatio.outputCount < 1) {
            throw new BadRequestException(
              'Optical splitter must have at least one output.',
            );
          }

          // ----------------------------------------------
          // Do not change ratio when ports exist
          // ----------------------------------------------

          if (
            splitter.ports.length > 0
          ) {
            throw new BadRequestException(
              'Cannot change splitter ratio because splitter ports already exist.',
            );
          }

          splitter.splitterRatioId = newRatio.id;

          splitter.splitterRatio = newRatio;
        }

        // ==================================================
        // 5. Save Optical Splitter
        // ==================================================

        await splitterRepository.save(splitter);

        // ==================================================
        // 6. Return Updated Splitter
        // ==================================================

        const result = await splitterRepository.findOne({
            where: {
              assetId: id,
            },

            relations: {
              asset: {
                assetType: true,
                status: true,
                site: true,
              },

              parentAsset: {
                assetType: true,
                status: true,
                site: true,
              },

              splitterRatio: true,

              ports: true,
            },
          });

        if (!result) {
          throw new NotFoundException(
            `Optical splitter with Asset ID ${id} not found after update.`,
          );
        }

        return result;
      },
    );
  }


  // ========================================================
  // Delete
  // ========================================================


  async remove(id: string): Promise<{ message: string }> {
    const splitterRepository = this.dataSource.getRepository(OpticalSplitter);

    const splitter = await splitterRepository.findOne({
      where: { assetId: id },
    });

    if (!splitter) {
      throw new NotFoundException(
        `Optical splitter with Asset ID ${id} not found.`,
      );
    }

    await this.assetsService.remove(id);

    return {
      message: `Optical splitter with Asset ID ${id} deleted successfully.`,
    };
  }

}