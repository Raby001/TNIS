import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FieldObservation, FieldObservationStatus } from '../entities/field-observation.entity';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { TowersService } from 'src/modules/towers/towers.service';
import { PolesService } from 'src/modules/poles/poles.service';
import { ManholesService } from 'src/modules/manholes/manholes.service';
import { HandholesService } from 'src/modules/handholes/handholes.service';
import { NapsService } from 'src/modules/naps/naps.service';
import { OnusService } from 'src/modules/onus/onus.service';
import { LcpsService } from 'src/modules/lcps/lcps.service';
import { OccsService } from 'src/modules/occs/occs.service';
import { RacksService } from 'src/modules/racks/racks.service';
import { RoutersService } from 'src/modules/routers/routers.service';
import { SpliceClosuresService } from 'src/modules/splice-closures/splice-closures.service';
import { ConvertFieldObservationDto } from '../dto/convert-field-observation.dto';
import { CreateTowerDto } from 'src/modules/towers/dto/create-tower.dto';
import { CreatePoleDto } from 'src/modules/poles/dto/create-pole.dto';
import { CreateManholeDto } from 'src/modules/manholes/dto/create-manhole.dto';
import { CreateHandholeDto } from 'src/modules/handholes/dto/create-handhole.dto';
import { CreateNapDto } from 'src/modules/naps/dto/create-nap.dto';
import { CreateOnuDto } from 'src/modules/onus/dto/create-onu.dto';
import { CreateLcpDto } from 'src/modules/lcps/dto/create-lcp.dto';
import { CreateOccDto } from 'src/modules/occs/dto/create-occ.dto';
import { CreateRackDto } from 'src/modules/racks/dto/create-rack.dto';
import { CreateRouterDto } from 'src/modules/routers/dto/create-router.dto';
import { CreateSpliceClosureDto } from 'src/modules/splice-closures/dto/create-splice-closure.dto';

@Injectable()
export class FieldObservationConversionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly towersService: TowersService,
    private readonly polesService: PolesService,
    private readonly manholesService: ManholesService,
    private readonly handholesService: HandholesService,
    private readonly napsService: NapsService,
    private readonly onusService: OnusService,
    private readonly lcpsService: LcpsService,
    private readonly occsService: OccsService,
    private readonly racksService: RacksService,
    private readonly routersService: RoutersService,
    private readonly spliceClosuresService: SpliceClosuresService,
  ) {}

  async convert(
    observationId: string,
    dto: ConvertFieldObservationDto,
    userId: string,
  ): Promise<FieldObservation> {
    return this.dataSource.transaction(
      async (manager) => {
        // ==========================================
        // 1. Find observation inside transaction
        // ==========================================

        const observationRepository = manager.getRepository(FieldObservation);

        const observation = await observationRepository.findOne({
            where: {
              id: observationId,
            },
          });

        if (!observation) {
          throw new NotFoundException(
            `Field observation with ID "${observationId}" not found.`,
          );
        }

        if (
          observation.status === FieldObservationStatus.CONVERTED
        ) {
          throw new ConflictException(
            'Field observation has already been converted.',
          );
        }

        if (
          observation.status === FieldObservationStatus.CANCELLED
        ) {
          throw new ConflictException(
            'A cancelled field observation cannot be converted.',
          );
        }

        // ==========================================
        // 2. Find selected Asset Type
        // ==========================================

        const assetTypeRepository = manager.getRepository(AssetType);

        const assetType = await assetTypeRepository.findOne({
            where: {
              id: dto.assetTypeId,
            },
          });

        if (!assetType) {
          throw new NotFoundException(
            `Asset type with ID "${dto.assetTypeId}" not found.`,
          );
        }

        // ==========================================
        // 3. Field Observation can only become Point
        // ==========================================

        if (assetType.geometryType !== 'Point') {
          throw new BadRequestException(
            `Asset type "${assetType.name}" cannot be converted from a Field Observation because it requires ${assetType.geometryType} geometry.`,
          );
        }

        // ==========================================
        // 4. Build complete target DTO data
        // ==========================================

        const conversionDto = {
          ...dto.details,

          assetTypeId: assetType.id,

          geometry: observation.geometry,
        };

        // ==========================================
        // 5. Validate target-specific details
        // ==========================================

        const validatedDto = await this.validateDetails(
          assetType.qualifier,
          conversionDto,
        );

        // ==========================================
        // 6. Create specialized asset
        // ==========================================

        const asset = await this.createSpecializedAsset(
            assetType.qualifier,
            validatedDto,
            userId,
            manager,
          );

        // ==========================================
        // 7. Link observation
        // ==========================================

        observation.convertedAssetId = asset.id;
        observation.status = FieldObservationStatus.CONVERTED;
        observation.updatedById = userId;

        await observationRepository.save(
          observation,
        );

        // ==========================================
        // 8. Return converted observation
        // ==========================================

        return observation;
      },
    );
  }

  private async validateDetails(
    qualifier: string,
    details: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const dtoClass = this.getDtoClass(qualifier);

    if (!dtoClass) {
      throw new BadRequestException(
        `Asset type "${qualifier}" is not supported for Field Observation conversion.`,
      );
    }

    const instance = plainToInstance(dtoClass, details);

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Invalid fields for the selected Asset Type.',
        errors,
      });
    }

    return instance as Record<string, unknown>;
  }

  private getDtoClass(
    qualifier: string,
  ): new () => object {
    switch (
      qualifier.trim().toUpperCase()
    ) {
      case 'TW':
        return CreateTowerDto;

      case 'PL':
        return CreatePoleDto;

      case 'MH':
        return CreateManholeDto;

      case 'HH':
        return CreateHandholeDto;

      case 'NAP':
        return CreateNapDto;

      case 'ONU':
        return CreateOnuDto;

      case 'LCP':
        return CreateLcpDto;

      case 'OCC':
        return CreateOccDto;

      case 'RCK':
        return CreateRackDto;

      case 'RTR':
        return CreateRouterDto;

      case 'SC':
        return CreateSpliceClosureDto;

      default:
        throw new BadRequestException(
          `Asset type "${qualifier}" is not supported for Field Observation conversion.`,
        );
    }
  }

  private async createSpecializedAsset(
    qualifier: string,
    dto: Record<string, unknown>,
    userId: string,
    manager: EntityManager,
  ): Promise<Asset> {
    let result: {
      assetId: string;
    };

    switch (
      qualifier.trim().toUpperCase()
    ) {
      case 'TW':
        result = await this.towersService.createInternal(
            dto as unknown as CreateTowerDto,
            userId,
            manager,
          );
        break;

      case 'PL':
        result = await this.polesService.createInternal(
            dto as unknown as CreatePoleDto,
            userId,
            manager,
          );
        break;

      case 'MH':
        result = await this.manholesService.createInternal(
            dto as unknown as CreateManholeDto,
            userId,
            manager,
          );
        break;

      case 'HH':
        result = await this.handholesService.createInternal(
            dto as unknown as CreateHandholeDto,
            userId,
            manager,
          );
        break;

      case 'NAP':
        result = await this.napsService.createInternal(
            dto as unknown as CreateNapDto,
            userId,
            manager,
          );
        break;

      case 'ONU':
        result = await this.onusService.createInternal(
            dto as unknown as CreateOnuDto,
            userId,
            manager,
          );
        break;

      case 'LCP':
        result = await this.lcpsService.createInternal(
            dto as unknown as CreateLcpDto,
            userId,
            manager,
          );
        break;

      case 'OCC':
        result = await this.occsService.createInternal(
            dto as unknown as CreateOccDto,
            userId,
            manager,
          );
        break;

      case 'RCK':
        result = await this.racksService.createInternal(
            dto as unknown as CreateRackDto,
            userId,
            manager,
          );
        break;

      case 'RTR':
        result = await this.routersService.createInternal(
            dto as unknown as CreateRouterDto,
            userId,
            manager,
          );
        break;

      case 'SC':
        result = await this.spliceClosuresService.createInternal(
            dto as unknown as CreateSpliceClosureDto,
            userId,
            manager,
          );
        break;

      default:
        throw new BadRequestException(
          `Asset type "${qualifier}" is not supported for Field Observation conversion.`,
        );
    }

    const asset = await manager
      .getRepository(Asset)
      .findOne({
        where: {
          id: result.assetId,
        },
      });

    if (!asset) {
      throw new NotFoundException(
        `Converted Asset with ID "${result.assetId}" was not found.`,
      );
    }

    return asset;
  }
}