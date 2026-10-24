import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, MoreThan } from 'typeorm';
import { FiberCable } from './entities/fiber-cable.entity';
import { FiberCore } from './entities/fiber-core.entity';
import { FiberCoreStatus } from './entities/fiber-core-status.entity';
import { CableType } from './entities/cable-type.entity';
import { CableCoreCount } from './entities/cable-core-count.entity';
import { InstallationMethod } from './entities/installation-method.entity';
import { FiberCableConnection, FiberCableConnectionRole, FiberCableConnectionTargetType} from '../fiber-cable-connections/entities/fiber-cable-connection.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetsService } from '../assets/assets.service';
import { CreateFiberCableDto } from './dto/create-fiber-cable.dto';
import { FiberSegmentType } from './entities/fiber-segment-type.entity';
import { NearbyAssetsQueryDto } from './entities/nearby-assets-query.dto';
import { UpdateFiberCableDto } from './dto/update-fiber-cable.dto';
import { UpdateAssetDto } from '../assets/dto/update-asset.dto';
import { FiberCableConnectionTargetDto } from '../fiber-cable-connections/dto/fiber-cable-connection-target.dto';
import { Site } from '../sites/entities/site.entity';
import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCableInstallationSegmentDto } from './dto/fiber-cable-installation-segment.dto';
import { FiberCableInstallationSegment } from './entities/fiber-cable-installation-segment.entity';
import { PointGeometry } from 'src/common/types/geometry.type';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreRouterPortConnection } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity'; 
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';

type ValidatedFiberCableTarget = {
  connectionRole: FiberCableConnectionRole;
  targetType: FiberCableConnectionTargetType;
  assetId: string | null;
  siteId: string | null;
  geometry: PointGeometry,
};


@Injectable()
export class FiberCablesService {
  constructor(
    private readonly assetService: AssetsService,
    private readonly dataSource: DataSource,
  ) {}

  // =============================================
  // Helper Method
  // =============================================

  private async validateConnectionTarget(
    manager: EntityManager,
    target: FiberCableConnectionTargetDto,
  ){
    if (target.targetType === FiberCableConnectionTargetType.ASSET) {
      if (!target.assetId) {
        throw new BadRequestException(
          'assetId is required when targetType is ASSET.',
        );
      }

      if (target.siteId) {
        throw new BadRequestException(
          'siteId must not be provided when targetType is ASSET.',
        );
      }

      const asset = await manager.getRepository(Asset).findOne({
        where: {
          id: target.assetId,
        },
        relations: {
          assetType: true,
        },
      });

      if (!asset) {
        throw new NotFoundException(
          `Asset with ID ${target.assetId} not found.`,
        );
      }

      if (!asset.geometry || asset.geometry.type !== 'Point') {
        throw new BadRequestException(
          `Asset "${asset.name}" must have Point geometry to be used as a fiber cable connection target.`,
        );
      }

      return {
        targetType: FiberCableConnectionTargetType.ASSET,
        assetId: asset.id,
        siteId: null,
        geometry: asset.geometry,
      };
    }

    if (target.targetType === FiberCableConnectionTargetType.SITE) {
      if (!target.siteId) {
        throw new BadRequestException(
          'siteId is required when targetType is SITE.',
        );
      }

      if (target.assetId) {
        throw new BadRequestException(
          'assetId must not be provided when targetType is SITE.',
        );
      }

      const site = await manager.getRepository(Site).findOne({
        where: {
          id: target.siteId,
        },
      });

      if (!site) {
        throw new NotFoundException(
          `Site with ID ${target.siteId} not found.`,
        );
      }

      if (!site.geometry || site.geometry.type !== 'Point') {
        throw new BadRequestException(
          `Site "${site.name}" must have Point geometry to be used as a fiber cable connection target.`,
        );
      }

      return {
        targetType: FiberCableConnectionTargetType.SITE,
        assetId: null,
        siteId: site.id,
        geometry: site.geometry,
      };
    }

    throw new BadRequestException(
      `Unsupported target type: ${target.targetType}.`,
    );
  }

  private async validateTargetsAgainstGeometry(
    manager: EntityManager,
    geometry: CreateFiberCableDto['geometry'],
    targets: ValidatedFiberCableTarget[],
  ): Promise<void> {

    const startTarget = targets[0];

    const endTarget = targets[targets.length - 1];

    // ==========================================
    // Validate START
    // ==========================================

    const startMatches = await manager.query(
      `
      SELECT ST_Equals(
        ST_StartPoint(ST_GeomFromGeoJSON($1)),
        ST_GeomFromGeoJSON($2)
      ) AS matches
      `,
      [
        JSON.stringify(geometry),
        JSON.stringify(startTarget.geometry),
      ],
    );

    if (!startMatches[0]?.matches) {
      throw new BadRequestException(
        'Fiber Cable START target geometry must match the first point of the LineString.',
      );
    }

    // ==========================================
    // Validate END
    // ==========================================

    const endMatches = await manager.query(
      `
      SELECT ST_Equals(
        ST_EndPoint(ST_GeomFromGeoJSON($1)),
        ST_GeomFromGeoJSON($2)
      ) AS matches
      `,
      [
        JSON.stringify(geometry),
        JSON.stringify(endTarget.geometry),
      ],
    );

    if (!endMatches[0]?.matches) {
      throw new BadRequestException(
        'Fiber Cable END target geometry must match the last point of the LineString.',
      );
    }

    // ==========================================
    // Validate MIDDLE targets
    // ==========================================

    const middleTargets = targets.filter(
      (target) =>
        target.connectionRole === FiberCableConnectionRole.MIDDLE,
    );

    if (middleTargets.length === 0) {
      return;
    }

    let previousVertexIndex = 1;

    for (const target of middleTargets) {
      const result = await manager.query(
        `
        SELECT MIN(points.path[1]) AS vertex_index
        FROM ST_DumpPoints(
          ST_GeomFromGeoJSON($1)
        ) AS points
        WHERE ST_Equals(
          points.geom,
          ST_GeomFromGeoJSON($2)
        )
        `,
        [
          JSON.stringify(geometry),
          JSON.stringify(target.geometry),
        ],
      );

      const vertexIndex = result[0]?.vertex_index;

      if (vertexIndex === null || vertexIndex === undefined) {
        throw new BadRequestException(
          `Fiber Cable MIDDLE target ${
            target.assetId
              ? `asset ${target.assetId}`
              : `site ${target.siteId}`
          } does not match any LineString vertex.`,
        );
      }

      if (
        Number(vertexIndex) <= previousVertexIndex || Number(vertexIndex) === geometry.coordinates.length
      ) {
        throw new BadRequestException(
          'Fiber Cable MIDDLE targets must appear in the same order as their sequence along the LineString.',
        );
      }

      previousVertexIndex = Number(vertexIndex);
    }
  }

  private async validateInstallationSegments(
    manager: EntityManager,
    fiberCableId: string,
    segments: FiberCableInstallationSegmentDto[],
  ): Promise<void> {
    if (segments.length === 0) {
      return;
    }

    const connectionRepository = manager.getRepository(FiberCableConnection);

    const installationMethodRepository = manager.getRepository(InstallationMethod);

    const connections = await connectionRepository.find({
      where: {
        fiberCableId,
      },
      order: {
        sequence: 'ASC',
      },
    });

    const methodIds = [
      ...new Set(
        segments.map(
          (segment) => segment.installationMethodId,
        ),
      ),
    ];

    const methods = await installationMethodRepository.find({
        where: methodIds.map((id) => ({
          id,
        })),
      });

    if (methods.length !== methodIds.length) {
      throw new NotFoundException(
        'One or more installation methods were not found.',
      );
    }

    const methodMap = new Map(
      methods.map((method) => [
        method.id,
        method,
      ]),
    );

    const occupiedIntervals: Array<{
      fromSequence: number;
      toSequence: number;
    }> = [];

    for (const segment of segments) {

      const fromConnection = this.findConnectionForTarget(connections, segment.fromTarget);

      const toConnection = this.findConnectionForTarget(connections, segment.toTarget);

      if (fromConnection.sequence === null || toConnection.sequence === null) {
        throw new BadRequestException(
          'Installation segment connections must have a sequence.',
        );
      }

      if (fromConnection.id === toConnection.id) {
        throw new BadRequestException(
          'Installation segment fromTarget and toTarget must be different.',
        );
      }

      if (fromConnection.sequence >= toConnection.sequence) {
        throw new BadRequestException(
          'Installation segment fromTarget must come before toTarget along the fiber cable.',
        );
      }

      if (fromConnection.connectionRole === FiberCableConnectionRole.END) {
        throw new BadRequestException(
          'An installation segment cannot start at the END connection.',
        );
      }

      if (toConnection.connectionRole === FiberCableConnectionRole.START) {
        throw new BadRequestException(
          'An installation segment cannot end at the START connection.',
        );
      }

      if (!methodMap.has(segment.installationMethodId)) {
        throw new NotFoundException(
          `Installation method ${segment.installationMethodId} not found.`,
        );
      }

      const currentInterval = {
        fromSequence: fromConnection.sequence,
        toSequence: toConnection.sequence,
      };

      for (const existing of occupiedIntervals) {
        const overlaps =  currentInterval.fromSequence < existing.toSequence && currentInterval.toSequence > existing.fromSequence;

        if (overlaps) {
          throw new BadRequestException(
            'Installation method segments cannot overlap.',
          );
        }
      }

      occupiedIntervals.push(
        currentInterval,
      );
    }
  }

  private findConnectionForTarget(
    connections: FiberCableConnection[],
    target: FiberCableConnectionTargetDto,
  ): FiberCableConnection {
    const connection = connections.find((connection) => {
      if (target.targetType === FiberCableConnectionTargetType.ASSET) {
        return (
          connection.targetType === FiberCableConnectionTargetType.ASSET &&
          connection.assetId === target.assetId
        );
      }

      return (
        connection.targetType === FiberCableConnectionTargetType.SITE &&
        connection.siteId === target.siteId
      );
    });

    if (!connection) {
      throw new BadRequestException(
        `Installation segment target was not found in the created fiber cable route.`,
      );
    }

    return connection;
  }

  private connectionToTargetDto(
    connection: FiberCableConnection,
  ): FiberCableConnectionTargetDto {
    if (
      connection.targetType ===
      FiberCableConnectionTargetType.ASSET
    ) {
      return {
        targetType:
          FiberCableConnectionTargetType.ASSET,
        assetId: connection.assetId!,
      };
    }

    return {
      targetType:
        FiberCableConnectionTargetType.SITE,
      siteId: connection.siteId!,
    };
  }

  private async updateBasicInfo(
    id: string,
    fiberCable: FiberCable,
    dto: UpdateFiberCableDto,
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const fiberCableRepository = manager.getRepository(FiberCable);

    // =============================================
    // Cable Type
    // =============================================

    if (dto.cableTypeId !== undefined) {
      const cableType = await manager
        .getRepository(CableType)
        .findOne({
          where: {
            id: dto.cableTypeId,
          },
        });

      if (!cableType) {
        throw new NotFoundException(
          `Cable type with ID ${dto.cableTypeId} not found.`,
        );
      }

      fiberCable.cableTypeId = cableType.id;
    }

    // =============================================
    // Installation Method
    // =============================================

    if (dto.installationMethodId !== undefined) {
      const installationMethod = await manager
        .getRepository(InstallationMethod)
        .findOne({
          where: {
            id: dto.installationMethodId,
          },
        });

      if (!installationMethod) {
        throw new NotFoundException(
          `Installation method with ID ${dto.installationMethodId} not found.`,
        );
      }

      fiberCable.installationMethodId =
        installationMethod.id;
    }

    // =============================================
    // Segment Type
    // =============================================

    if (dto.segmentTypeId !== undefined) {
      const segmentType = await manager
        .getRepository(FiberSegmentType)
        .findOne({
          where: {
            id: dto.segmentTypeId,
          },
        });

      if (!segmentType) {
        throw new NotFoundException(
          `Fiber segment type with ID ${dto.segmentTypeId} not found.`,
        );
      }

      fiberCable.segmentTypeId = segmentType.id;
    }

    await fiberCableRepository.save(fiberCable);

    // =============================================
    // Asset information
    // =============================================

    const assetUpdate: UpdateAssetDto = {
      name: dto.name,
      description: dto.description,
      assetTag: dto.assetTag,
      serialNumber: dto.serialNumber,
      purchaseDate: dto.purchaseDate,
      installationDate: dto.installationDate,
      warrantyStart: dto.warrantyStart,
      warrantyEnd: dto.warrantyEnd,
      statusId: dto.statusId,
    };

    await this.assetService.updateInternal(
      id,
      assetUpdate,
      userId,
      manager,
    );
  }

  private async updateCoreCount(
    fiberCableId: string,
    fiberCable: FiberCable,
    newCoreCountId: string,
    manager: EntityManager,
  ): Promise<void> {
    const coreCountRepository = manager.getRepository(CableCoreCount);

    const fiberCoreRepository = manager.getRepository(FiberCore);

    const fiberCoreStatusRepository = manager.getRepository(FiberCoreStatus);

    // =============================================
    // Find new core count
    // =============================================

    const newCoreCount = await coreCountRepository.findOne({
        where: {
          id: newCoreCountId,
        },
      });

    if (!newCoreCount) {
      throw new NotFoundException(
        `Cable core count with ID ${newCoreCountId} not found.`,
      );
    }

    // =============================================
    // No change
    // =============================================

    if (fiberCable.coreCountId === newCoreCount.id) {
      return;
    }

    // =============================================
    // Get current cores
    // =============================================

    const cores = await fiberCoreRepository.find({
      where: {
        fiberCableId: fiberCable.assetId,
      },
      order: {
        coreNumber: 'ASC',
      },
    });

    const oldCoreCount = cores.length;

    // =============================================
    // Check active topology connections
    // =============================================

    for (const core of cores) {
      const hasActiveConnection = await this.hasActiveCoreTopologyConnection(
          core.id,
          manager,
        );

      if (hasActiveConnection) {
        throw new BadRequestException(
          `Fiber core ${core.coreNumber} has an active topology connection. Core count cannot be changed.`,
        );
      }
    }

    // =============================================
    // Find AVAILABLE status
    // =============================================

    const availableStatus = await fiberCoreStatusRepository.findOne({
        where: {
          code: 'AVAILABLE',
        },
      });

    if (!availableStatus) {
      throw new NotFoundException(
        'Fiber Core status "AVAILABLE" not found.',
      );
    }

    // =============================================
    // Increase
    // =============================================

    if (newCoreCount.coreCount > oldCoreCount) {
      const newCores: FiberCore[] = [];

      for (let coreNumber = oldCoreCount + 1; coreNumber <= newCoreCount.coreCount; coreNumber++) {
        newCores.push(
          fiberCoreRepository.create({
            fiberCableId: fiberCable.assetId,
            fiberCable,
            coreNumber,
            statusId: availableStatus.id,
            status: availableStatus,
          }),
        );
      }

      if (newCores.length > 0) {
        await fiberCoreRepository.save(newCores);
      }
    }

    // =============================================
    // Decrease
    // =============================================

    if (newCoreCount.coreCount < oldCoreCount) {
      await fiberCoreRepository.delete({
        fiberCableId: fiberCable.assetId,
        coreNumber: MoreThan(
          newCoreCount.coreCount,
        ),
      });
    }

    // =============================================
    // Update cable reference
    // =============================================

    fiberCable.coreCountId = newCoreCount.id;

    await manager.getRepository(FiberCable).save(fiberCable);
  }

  private async hasActiveCoreTopologyConnection(
    coreId: string,
    manager: EntityManager,
  ): Promise<boolean> {
    // =============================================
    // Splitter
    // =============================================

    const splitterStatus = await manager
        .getRepository(FiberCoreSplitterConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (splitterStatus) {
      const connection = await manager
          .getRepository(FiberCoreSplitterConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: splitterStatus.id,
            },
          });

      if (connection) {
        return true;
      }
    }

    // =============================================
    // ONU
    // =============================================

    const onuStatus = await manager
        .getRepository(
          FiberCoreOnuConnectionStatus,
        )
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (onuStatus) {
      const connection = await manager
          .getRepository(FiberCoreOnuConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: onuStatus.id,
            },
          });

      if (connection) {
        return true;
      }
    }

    // =============================================
    // OCC
    // =============================================

    const occStatus =await manager
        .getRepository(FiberCoreOccPortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (occStatus) {
      const connection = await manager
          .getRepository(FiberCoreOccPortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: occStatus.id,
            },
          });

      if (connection) {
        return true;
      }
    }

    // =============================================
    // Splice Closure Port
    // =============================================

    const spliceClosureStatus = await manager
        .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (spliceClosureStatus) {
      const connection = await manager
          .getRepository(FiberCoreSpliceClosurePortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: spliceClosureStatus.id,
            },
          });

      if (connection) {
        return true;
      }
    }

    // =============================================
    // Router Port
    // =============================================

    const routerStatus = await manager
        .getRepository(FiberCoreRouterPortConnectionStatus)
        .findOne({
          where: {
            code: 'ACTIVE',
          },
        });

    if (routerStatus) {
      const connection = await manager
          .getRepository(FiberCoreRouterPortConnection)
          .findOne({
            where: {
              fiberCoreId: coreId,
              statusId: routerStatus.id,
            },
          });

      if (connection) {
        return true;
      }
    }

    return false;
  }

  private async updateFullRoute(
    fiberCableId: string,
    fiberCable: FiberCable,
    dto: UpdateFiberCableDto,
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const connectionRepository =
      manager.getRepository(FiberCableConnection);

    // =============================================
    // Geometry is required for full route update
    // =============================================

    if (!dto.geometry) {
      throw new BadRequestException(
        'geometry is required when updating the full Fiber Cable route.',
      );
    }

    if (dto.geometry.type !== 'LineString') {
      throw new BadRequestException(
        'Fiber Cable requires a LineString geometry.',
      );
    }

    if (
      !dto.geometry.coordinates ||
      dto.geometry.coordinates.length < 2
    ) {
      throw new BadRequestException(
        'Fiber Cable LineString must contain at least two coordinates.',
      );
    }

    // =============================================
    // Existing connections
    // =============================================

    const existingConnections =
      await connectionRepository.find({
        where: {
          fiberCableId,
        },
        order: {
          sequence: 'ASC',
        },
      });

    const existingStart =
      existingConnections.find(
        (connection) =>
          connection.connectionRole ===
          FiberCableConnectionRole.START,
      );

    const existingEnd =
      existingConnections.find(
        (connection) =>
          connection.connectionRole ===
          FiberCableConnectionRole.END,
      );

    if (!existingStart || !existingEnd) {
      throw new BadRequestException(
        'Fiber Cable must have START and END connections.',
      );
    }

    // =============================================
    // Determine route targets
    // =============================================

    const startTarget =
      dto.startTarget ??
      this.connectionToTargetDto(existingStart);

    const endTarget =
      dto.endTarget ??
      this.connectionToTargetDto(existingEnd);

    const middleTargets =
      dto.middleTargets !== undefined
        ? dto.middleTargets
        : existingConnections
            .filter(
              (connection) =>
                connection.connectionRole ===
                FiberCableConnectionRole.MIDDLE,
            )
            .map((connection) =>
              this.connectionToTargetDto(connection),
            );

    // =============================================
    // Build ordered route
    // =============================================

    const orderedTargets = [
      {
        target: startTarget,
        role: FiberCableConnectionRole.START,
      },

      ...middleTargets.map((target) => ({
        target,
        role: FiberCableConnectionRole.MIDDLE,
      })),

      {
        target: endTarget,
        role: FiberCableConnectionRole.END,
      },
    ];

    // =============================================
    // Validate targets
    // =============================================

    const validatedTargets: ValidatedFiberCableTarget[] = [];

    for (const routeTarget of orderedTargets) {
      const validated =
        await this.validateConnectionTarget(
          manager,
          routeTarget.target,
        );

      validatedTargets.push({
        connectionRole: routeTarget.role,
        targetType: validated.targetType,
        assetId: validated.assetId,
        siteId: validated.siteId,
        geometry: validated.geometry,
      });
    }

    // =============================================
    // Prevent duplicate targets
    // =============================================

    const targetKeys = new Set<string>();

    for (const target of validatedTargets) {
      const key =
        target.targetType ===
        FiberCableConnectionTargetType.ASSET
          ? `ASSET:${target.assetId}`
          : `SITE:${target.siteId}`;

      if (targetKeys.has(key)) {
        throw new BadRequestException(
          `Target ${key} is used more than once in this Fiber Cable route.`,
        );
      }

      targetKeys.add(key);
    }

    // =============================================
    // Validate target positions
    // =============================================

    await this.validateTargetsAgainstGeometry(
      manager,
      dto.geometry,
      validatedTargets,
    );

    // =============================================
    // Preserve existing START/END IDs
    // =============================================

    const newStart = validatedTargets[0];
    const newEnd =
      validatedTargets[validatedTargets.length - 1];

    existingStart.targetType =
      newStart.targetType;

    existingStart.assetId =
      newStart.assetId;

    existingStart.siteId =
      newStart.siteId;

    existingStart.connectionRole =
      FiberCableConnectionRole.START;

    existingEnd.targetType =
      newEnd.targetType;

    existingEnd.assetId =
      newEnd.assetId;

    existingEnd.siteId =
      newEnd.siteId;

    existingEnd.connectionRole =
      FiberCableConnectionRole.END;

    // =============================================
    // Remove old MIDDLE connections
    // =============================================

    const oldMiddleConnections =
      existingConnections.filter(
        (connection) =>
          connection.connectionRole ===
          FiberCableConnectionRole.MIDDLE,
      );

    if (oldMiddleConnections.length > 0) {
      await connectionRepository.remove(
        oldMiddleConnections,
      );
    }

    // =============================================
    // Temporarily move START/END
    // =============================================

    existingStart.sequence = -1;
    existingEnd.sequence = -2;

    await connectionRepository.save([
      existingStart,
      existingEnd,
    ]);

    // =============================================
    // Create new ordered connections
    // =============================================

    const newMiddleConnections =
      validatedTargets
        .slice(1, -1)
        .map((target, index) =>
          connectionRepository.create({
            fiberCableId,

            targetType:
              target.targetType,

            assetId:
              target.assetId,

            siteId:
              target.siteId,

            connectionRole:
              FiberCableConnectionRole.MIDDLE,

            sequence: index + 1,
          }),
        );

    // START = sequence 0
    existingStart.sequence = 0;

    // END after all middle targets
    existingEnd.sequence =
      validatedTargets.length - 1;

    if (newMiddleConnections.length > 0) {
      await connectionRepository.save(
        newMiddleConnections,
      );
    }

    await connectionRepository.save([
      existingStart,
      existingEnd,
    ]);

    // =============================================
    // Update geometry
    // =============================================

    await this.assetService.updateInternal(
      fiberCableId,
      {
        geometry: dto.geometry,
      },
      userId,
      manager,
    );
  }

  private async updateInstallationSegments(
    fiberCableId: string,
    segments: FiberCableInstallationSegmentDto[],
    manager: EntityManager,
  ): Promise<void> {
    await this.validateInstallationSegments(
      manager,
      fiberCableId,
      segments,
    );

    const repository = manager.getRepository(FiberCableInstallationSegment);

    // =============================================
    // Replace all installation segments
    // =============================================

    await repository.delete({
      fiberCableId,
    });

    if (segments.length === 0) {
      return;
    }

    const connections = await manager
        .getRepository(FiberCableConnection)
        .find({
          where: {
            fiberCableId,
          },
          order: {
            sequence: 'ASC',
          },
        });

    const entities = segments.map((segment) => {
        const fromConnection = this.findConnectionForTarget(
            connections,
            segment.fromTarget,
          );

        const toConnection = this.findConnectionForTarget(
            connections,
            segment.toTarget,
          );

        return repository.create({
          fiberCableId,

          fromConnectionId:
            fromConnection.id,

          toConnectionId:
            toConnection.id,

          installationMethodId:
            segment.installationMethodId,
        });
      });

    await repository.save(entities);
  }

  private async updateEndpointsInternal(
    id: string,
    dto: UpdateFiberCableDto,
    userId: string,
    manager: EntityManager,
  ){
      const fiberCableRepository = manager.getRepository(FiberCable);

      const connectionRepository = manager.getRepository(FiberCableConnection);

      // =============================================
      // Validate request
      // =============================================

      if (!dto.startTarget && !dto.endTarget) {
        throw new BadRequestException(
          'At least one of startTarget or endTarget must be provided.',
        );
      }

      // =============================================
      // Find Fiber Cable
      // =============================================

      const fiberCable = await fiberCableRepository.findOne({
          where: {
            assetId: id,
          },
          relations: {
            asset: true,
          },
        });

      if (!fiberCable) {
        throw new NotFoundException(
          `Fiber cable with ID ${id} not found.`,
        );
      }

      // =============================================
      // Find existing START / END connections
      // =============================================

      const existingConnections = await connectionRepository.find({
          where: {
            fiberCableId: id,
          },
          order: {
            sequence: 'ASC',
          },
        });

      const startConnection = existingConnections.find(
          (connection) => connection.connectionRole === FiberCableConnectionRole.START,
        );

      const endConnection = existingConnections.find(
          (connection) => connection.connectionRole === FiberCableConnectionRole.END,
        );

      if (!startConnection) {
        throw new BadRequestException(
          'Fiber Cable START connection was not found.',
        );
      }

      if (!endConnection) {
        throw new BadRequestException(
          'Fiber Cable END connection was not found.',
        );
      }

      // =============================================
      // Get current START target
      // =============================================

      const currentStartTarget = await this.validateConnectionTarget(manager, {
          targetType: startConnection.targetType,
          assetId: startConnection.assetId ?? undefined,
          siteId: startConnection.siteId ?? undefined,
        });

      // =============================================
      // Get current END target
      // =============================================

      const currentEndTarget = await this.validateConnectionTarget(manager, {
          targetType: endConnection.targetType,
          assetId: endConnection.assetId ?? undefined,
          siteId: endConnection.siteId ?? undefined,
        });

      // =============================================
      // Resolve new START target
      // =============================================

      const newStartTarget: ValidatedFiberCableTarget = dto.startTarget
          ? {
              connectionRole: FiberCableConnectionRole.START,
              ...(await this.validateConnectionTarget(
                manager,
                dto.startTarget,
              )),
            }
          : {
              connectionRole: FiberCableConnectionRole.START,
              ...currentStartTarget,
            };

      // =============================================
      // Resolve new END target
      // =============================================

      const newEndTarget: ValidatedFiberCableTarget = dto.endTarget
          ? {
              connectionRole: FiberCableConnectionRole.END,
              ...(await this.validateConnectionTarget(
                manager,
                dto.endTarget,
              )),
            }
          : {
              connectionRole: FiberCableConnectionRole.END,
              ...currentEndTarget,
            };

      // =============================================
      // Prevent START and END from being the same
      // =============================================

      const startKey = newStartTarget.targetType === FiberCableConnectionTargetType.ASSET
          ? `ASSET:${newStartTarget.assetId}`
          : `SITE:${newStartTarget.siteId}`;

      const endKey = newEndTarget.targetType === FiberCableConnectionTargetType.ASSET
          ? `ASSET:${newEndTarget.assetId}`
          : `SITE:${newEndTarget.siteId}`;

      if (startKey === endKey) {
        throw new BadRequestException(
          'Fiber Cable START and END targets must be different.',
        );
      }

      // =============================================
      // Get current Fiber Cable geometry
      // =============================================

      const geometry = fiberCable.asset.geometry;

      if (!geometry || geometry.type !== 'LineString') {
        throw new BadRequestException(
          'Fiber Cable geometry must be a LineString.',
        );
      }

      if (!geometry.coordinates || geometry.coordinates.length < 2) {
        throw new BadRequestException(
          'Fiber Cable LineString must contain at least two coordinates.',
        );
      }

      // =============================================
      // Update START coordinate
      // =============================================

      if (dto.startTarget) {
        geometry.coordinates[0] = newStartTarget.geometry.coordinates;
      }

      // =============================================
      // Update END coordinate
      // =============================================

      if (dto.endTarget) {
        geometry.coordinates[geometry.coordinates.length - 1] = newEndTarget.geometry.coordinates;
      }

      // =============================================
      // Update START connection
      // =============================================

      if (dto.startTarget) {
        startConnection.targetType = newStartTarget.targetType;

        startConnection.assetId = newStartTarget.assetId;

        startConnection.siteId = newStartTarget.siteId;

        startConnection.connectionRole = FiberCableConnectionRole.START;
      }

      // =============================================
      // Update END connection
      // =============================================

      if (dto.endTarget) {
        endConnection.targetType = newEndTarget.targetType;

        endConnection.assetId = newEndTarget.assetId;

        endConnection.siteId = newEndTarget.siteId;

        endConnection.connectionRole = FiberCableConnectionRole.END;
      }

      // =============================================
      // Save geometry
      // =============================================

      fiberCable.asset.geometry = geometry;

      await fiberCableRepository.save(fiberCable);

      // =============================================
      // Save connections
      // =============================================

      await connectionRepository.save([
        startConnection,
        endConnection,
      ]);

      // =============================================
      // Return updated Fiber Cable
      // =============================================

      return {
        message: 'Updated START/END Point successfully.',
      };

  }

  // =============================================
  // =================== Create
  // =============================================

  async create(
    dto: CreateFiberCableDto,
    userId: string,
  ){
    const result = await this.dataSource.transaction(
      async (manager) => {
        return this.createInternal(
          dto,
          userId,
          manager,
        );
      },
    );

    return this.findConnections(result.assetId);
  }

  async createInternal(
    dto: CreateFiberCableDto,
    userId: string,
    manager: EntityManager,
  ): Promise<FiberCable> {

        // ==========================================
        // Repositories
        // ==========================================

        const cableTypeRepository = manager.getRepository(CableType);
        const coreCountRepository = manager.getRepository(CableCoreCount);
        const installationMethodRepository = manager.getRepository(InstallationMethod);
        const fiberCoreStatusRepository = manager.getRepository(FiberCoreStatus);
        const fiberCableRepository = manager.getRepository(FiberCable);
        const fiberCoreRepository = manager.getRepository(FiberCore);
        const fiberCableConnectionRepository = manager.getRepository(FiberCableConnection);
        const installationSegmentRepository = manager.getRepository(FiberCableInstallationSegment);

        // ==========================================
        // Validate geometry
        // ==========================================

        if ( !dto.geometry || dto.geometry.type !== 'LineString') {
          throw new BadRequestException(
            'Invalid geometry type for Fiber Cable. Fiber Cable requires a LineString geometry.',
          );
        }

        if (!dto.geometry.coordinates || dto.geometry.coordinates.length < 2) {
          throw new BadRequestException(
            'Fiber Cable LineString must contain at least two coordinates.',
          );
        }

        // ==========================================
        // Find Cable Type
        // ==========================================

        const cableType = await cableTypeRepository.findOne({
            where: {
              id: dto.cableTypeId,
            },
          });

        if (!cableType) {
          throw new NotFoundException(
            `Cable type with ID ${dto.cableTypeId} not found.`,
          );
        }

        // ==========================================
        //  Find Core Segment type
        // ==========================================
        const segmentType = await manager.getRepository(FiberSegmentType)
          .findOne({
            where: {
              id: dto.segmentTypeId,
            }
          });

        if (!segmentType) {
          throw new NotFoundException(
            `Fiber segment type with ID ${dto.segmentTypeId} not found.`,
          );
        }

        // ==========================================
        // Find Core Count
        // ==========================================

        const coreCount = await coreCountRepository.findOne({
            where: {
              id: dto.coreCountId,
            },
          });

        if (!coreCount) {
          throw new NotFoundException(
            `Cable core count with ID ${dto.coreCountId} not found.`,
          );
        }


        // ==========================================
        // Find Installation Method
        // ==========================================

        const installationMethod = await installationMethodRepository.findOne({
            where: {
              id: dto.installationMethodId,
            },
          });

        if (!installationMethod) {
          throw new NotFoundException(
            `Installation method with ID ${dto.installationMethodId} not found.`,
          );
        }

        // ==========================================
        // Validate Fiber Cable Route
        // ==========================================

        const middleTargets = dto.middleTargets ?? [];

        const orderedTargets = [
          {
            target: dto.startTarget,
            connectionRole: FiberCableConnectionRole.START,
          },

          ...middleTargets.map((target) => ({
            target,
            connectionRole: FiberCableConnectionRole.MIDDLE,
          })),

          {
            target: dto.endTarget,
            connectionRole: FiberCableConnectionRole.END,
          },
        ];

        // ==========================================
        // Validate Each Target
        // ==========================================

        const validatedTargets: ValidatedFiberCableTarget[] = [];

        for (const routeTarget of orderedTargets) {
          const validatedTarget = await this.validateConnectionTarget(
            manager,
            routeTarget.target,
          );

          validatedTargets.push({
            connectionRole: routeTarget.connectionRole,

            targetType: validatedTarget.targetType,

            assetId: validatedTarget.assetId,

            siteId: validatedTarget.siteId,

            geometry: validatedTarget.geometry,
          });
        }

        // ==========================================
        // Prevent Duplicate Targets
        // ==========================================

        const targetKeys = new Set<string>();

        for (const target of validatedTargets) {
          const key = target.targetType === FiberCableConnectionTargetType.ASSET
              ? `ASSET:${target.assetId}`
              : `SITE:${target.siteId}`;

          if (targetKeys.has(key)) {
            throw new BadRequestException(
              `Target ${key} is used more than once in this fiber cable route.`,
            );
          }

          targetKeys.add(key);
        }

        // ==========================================
        // Validate Targets Against LineString
        // ==========================================

        await this.validateTargetsAgainstGeometry(
          manager,
          dto.geometry,
          validatedTargets,
        );

        // ==========================================
        // Create Fiber Cable Asset
        // ==========================================

        const asset = await this.assetService.createInternal(
          {
            name: dto.name,
            assetTypeId: dto.assetTypeId,
            statusId: dto.statusId,
            siteId: dto.siteId,
            description: dto.description,
            geometry: dto.geometry,

            assetTag: dto.assetTag,
            serialNumber: dto.serialNumber,

            purchaseDate: dto.purchaseDate,
            installationDate: dto.installationDate,
            warrantyStart: dto.warrantyStart,
            warrantyEnd: dto.warrantyEnd,

          },
          userId,
          manager,
        );


        // ==========================================
        // Create Fiber Cable
        // ==========================================

        const fiberCable = fiberCableRepository.create({
          assetId: asset.id,

          cableTypeId: cableType.id,
          cableType,

          segmentTypeId: segmentType.id,
          segmentType,

          coreCountId: coreCount.id,
          coreCount,

          installationMethodId: installationMethod.id,
          installationMethod,
        });

        const savedFiberCable = await fiberCableRepository.save(fiberCable);


        // ==========================================
        // Find AVAILABLE core status
        // ==========================================

        const availableStatus = await fiberCoreStatusRepository.findOne({
            where: {
              code: 'AVAILABLE',
            },
          });

        if (!availableStatus) {
          throw new NotFoundException(
            'Fiber Core status "AVAILABLE" not found.',
          );
        }


        // ==========================================
        // Create Fiber Cores
        // ==========================================

        const fiberCores = Array.from(
          {
            length: coreCount.coreCount,
          },
          (_, index) =>
            fiberCoreRepository.create({
              fiberCableId: savedFiberCable.assetId,

              fiberCable: savedFiberCable,

              coreNumber: index + 1,

              statusId: availableStatus.id,

              status: availableStatus,
            }),
          );

        await fiberCoreRepository.save(fiberCores);


        // ==========================================
        // Create Ordered Cable Connections
        // ==========================================

        const connections = validatedTargets.map(
          (target, index) =>
            fiberCableConnectionRepository.create({
              fiberCableId: savedFiberCable.assetId,

              targetType: target.targetType,

              assetId: target.assetId,

              siteId: target.siteId,

              connectionRole: target.connectionRole,

              sequence: index,
            }),
        );

        await fiberCableConnectionRepository.save(connections);


        // ==========================================
        // Create Installation Method Segments
        // ==========================================

        if (dto.installationSegments?.length) {
          const installationMethods = new Map<string, InstallationMethod>();

          const installationSegments =
            await Promise.all(
              dto.installationSegments.map(async (segment) => {
                const fromConnection = this.findConnectionForTarget(
                  connections,
                  segment.fromTarget,
                );

                const toConnection = this.findConnectionForTarget(
                  connections,
                  segment.toTarget,
                );

                if (fromConnection.id === toConnection.id) {
                  throw new BadRequestException(
                    'Installation segment fromTarget and toTarget must be different.',
                  );
                }

                if (
                  fromConnection.sequence === null ||
                  toConnection.sequence === null
                ) {
                  throw new BadRequestException(
                    'Installation segment targets must have valid route sequences.',
                  );
                }

                if (fromConnection.sequence >= toConnection.sequence) {
                  throw new BadRequestException(
                    'Installation segment fromTarget must appear before toTarget in the fiber cable route.',
                  );
                }

                let installationMethod: InstallationMethod | null = installationMethods.get(segment.installationMethodId) ?? null;

                if (!installationMethod) {
                  installationMethod =
                    await installationMethodRepository.findOne({
                      where: {
                        id: segment.installationMethodId,
                      },
                    });

                  if (!installationMethod) {
                    throw new NotFoundException(
                      `Installation method with ID ${segment.installationMethodId} not found.`,
                    );
                  }

                  installationMethods.set(
                    segment.installationMethodId,
                    installationMethod,
                  );
                }

                return installationSegmentRepository.create({
                  fiberCableId: savedFiberCable.assetId,

                  fromConnectionId: fromConnection.id,
                  fromConnection,

                  toConnectionId: toConnection.id,
                  toConnection,

                  installationMethodId: installationMethod.id,
                  installationMethod,
                });
              }),
            );

          await installationSegmentRepository.save(
            installationSegments,
          );
        }

        // ==========================================
        // 19. Return complete Fiber Cable
        // ==========================================

        const result = await fiberCableRepository.findOne({
            where: {
              assetId: savedFiberCable.assetId,
            },

            relations: {
              asset: true,
              cableType: true,
              coreCount: true,
              installationMethod: true,
              segmentType: true,
              fiberCores: {
                status: true,
              },
              installationSegments: {
                installationMethod: true,
                fromConnection: true,
                toConnection: true,
              },
            },
          });


        if (!result) {
          throw new NotFoundException(
            `Fiber Cable with asset ID ${savedFiberCable.assetId} not found after creation.`,
          );
        }

        return result;

  }

  // =============================================
  // =================== Find One
  // =============================================

  async findOne(
    id: string,
  ): Promise<FiberCable> {

    const fiberCableRepository = this.dataSource.getRepository(FiberCable);

    const fiberCable = await fiberCableRepository.findOne({
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
          cableType: true,
          coreCount: true,
          segmentType: true,
          installationMethod: true,
          installationSegments: {
            installationMethod: true,
            fromConnection: true,
            toConnection: true,
          },
        },
      });


    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber Cable with ID ${id} not found.`,
      );
    }

    return fiberCable;
  }

  // =============================================
  // Calculate Connection Distances
  // =============================================

  private async getConnectionDetails(
    fiberCableId: string,
  ) {
    const rows = await this.dataSource.query(
      `
      WITH connection_points AS (

        SELECT
          fcc.id,
          fcc.asset_id,
          fcc.site_id,
          fcc.target_type,
          fcc.connection_role,
          fcc.sequence,

          a.code AS asset_code,
          a.name AS asset_name,
          a.geometry AS asset_geometry,

          s.code AS site_code,
          s.name AS site_name,
          s.geometry AS site_geometry,

          COALESCE(
            a.geometry,
            s.geometry
          ) AS target_geometry,

          cableAsset.geometry AS cable_geometry,

          ST_LineLocatePoint(
            cableAsset.geometry,
            ST_ClosestPoint(
              cableAsset.geometry,
              COALESCE(
                a.geometry,
                s.geometry
              )
            )
          ) AS fraction

        FROM fiber_cable_connections fcc

        LEFT JOIN assets a
          ON a.id = fcc.asset_id

        LEFT JOIN sites s
          ON s.id = fcc.site_id

        INNER JOIN assets cableAsset
          ON cableAsset.id = fcc.fiber_cable_id

        WHERE fcc.fiber_cable_id = $1
      ),

      ordered_points AS (

        SELECT
          *,
          LAG(fraction) OVER (
            ORDER BY sequence
          ) AS previous_fraction

        FROM connection_points
      )

      SELECT
        id,
        asset_id,
        site_id,
        target_type,
        connection_role,
        sequence,

        asset_code,
        asset_name,
        site_code,
        site_name,

        ST_AsGeoJSON(target_geometry)::json AS geometry,

        CASE
          WHEN previous_fraction IS NULL THEN 0

          ELSE ST_Length(
            ST_LineSubstring(
              cable_geometry,
              LEAST(previous_fraction, fraction),
              GREATEST(previous_fraction, fraction)
            )::geography
          )
        END AS distance_from_previous_m,

        ST_Length(
          cable_geometry::geography
        ) AS total_distance_m

      FROM ordered_points

      ORDER BY sequence ASC
      `,
      [fiberCableId],
    );

    let cumulativeDistanceM = 0;

    const connections = rows.map((row) => {
      const distanceFromPreviousM =
        Number(row.distance_from_previous_m);

      cumulativeDistanceM += distanceFromPreviousM;

      const isAsset = row.target_type === FiberCableConnectionTargetType.ASSET;

      return {
        sequence: Number(row.sequence),

        connectionRole: row.connection_role,

        targetType: row.target_type,

        target: isAsset
          ? {
              asset: {
                id: row.asset_id,
                code: row.asset_code,
                name: row.asset_name,
                geometry: row.geometry,
              },
            }
          : {
              site: {
                id: row.site_id,
                code: row.site_code,
                name: row.site_name,
                geometry: row.geometry,
              },
            },

        distanceFromPreviousM,

        cumulativeDistanceM,
      };
    });

    const totalDistanceM = rows.length > 0
        ? Number(rows[0].total_distance_m)
        : 0;

    return {
      totalDistanceM,
      connections,
    };
  }

  // =============================================
  // =================== Find all
  // =============================================

  async findAll(): Promise<FiberCable[]> {

    const fiberCableRepo = this.dataSource.getRepository(FiberCable);

    return fiberCableRepo.find({
      relations: {
        asset: {
          assetType: true,
          status: true,
        },
        segmentType: true,
        cableType: true,
        coreCount: true,
        installationMethod: true,

        installationSegments: {
          installationMethod: true,
          fromConnection: true,
          toConnection: true,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // =============================================
  // =================== Find Cores
  // =============================================

  async findCores(id: string): Promise<FiberCore[]> {

    const fiberCableRepository = this.dataSource.getRepository(FiberCable);
    const fiberCoreRepository = this.dataSource.getRepository(FiberCore);

    // ==========================================
    // Find Fiber Cable
    // ==========================================

    const fiberCable = await fiberCableRepository.findOne({
        where: {
          assetId: id,
        },
      });


    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber Cable with ID ${id} not found.`,
      );
    }


    // ==========================================
    // Find Cores
    // ==========================================

    return fiberCoreRepository.find({

      where: {
        fiberCableId: id,
      },

      relations: {
        status: true,
      },

      order: {
        coreNumber: 'ASC',
      },
    });
  }

  // =============================================
  // Find all asset connected to cable
  // =============================================

  async findConnections(id: string) {

    const fiberCableRepository = this.dataSource.getRepository(FiberCable);
    const fiberCoreSpliceClosurePortConnectionRepository = this.dataSource.getRepository(FiberCoreSpliceClosurePortConnection);

    const fiberCable = await fiberCableRepository.findOne({
      where: {
        assetId: id,
      },
      relations: {
        asset: {
          assetType: true,
          status: true,
          site: true,
        },
        cableType: true,
        coreCount: true,
        installationMethod: true,
        segmentType: true,
        installationSegments: {
          installationMethod: true,
          fromConnection: true,
          toConnection: true,
        },
      },
    });

    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber cable with ID ${id} not found.`,
      );
    }

    // ==========================================
    // Fiber splices involving this cable
    // ==========================================

    const connections = await fiberCoreSpliceClosurePortConnectionRepository
        .createQueryBuilder('connection')
        .leftJoinAndSelect(
          'connection.fiberCore',
          'fiberCore',
        )
        .leftJoinAndSelect(
          'fiberCore.fiberCable',
          'fiberCoreCable',
        )
        .leftJoinAndSelect(
          'fiberCoreCable.asset',
          'fiberCoreCableAsset',
        )
        .leftJoinAndSelect(
          'connection.spliceClosurePort',
          'spliceClosurePort',
        )
        .leftJoinAndSelect(
          'spliceClosurePort.spliceClosure',
          'spliceClosure',
        )
        .leftJoinAndSelect(
          'spliceClosure.asset',
          'spliceClosureAsset',
        )
        .leftJoinAndSelect(
          'spliceClosurePort.splicesAsPortA',
          'splicesAsPortA',
        )
        .leftJoinAndSelect(
          'splicesAsPortA.spliceClosurePortB',
          'spliceAOtherPort',
        )
        .leftJoinAndSelect(
          'spliceClosurePort.splicesAsPortB',
          'splicesAsPortB',
        )
        .leftJoinAndSelect(
          'splicesAsPortB.spliceClosurePortA',
          'spliceBOtherPort',
        )
        .where('fiberCoreCable.asset_id = :id', { id })
        .getMany();

    const connectionDetails = await this.getConnectionDetails(id);
        
    // ==========================================
    // Start
    // ==========================================

    const start = connectionDetails.connections.find(
        (connection) =>
          connection.connectionRole === FiberCableConnectionRole.START,
      ) ?? null;

    // ==========================================
    // Middle points
    // ==========================================

    const middle = connectionDetails.connections.filter(
      (connection) => connection.connectionRole === FiberCableConnectionRole.MIDDLE,
    );

    // ==========================================
    // End
    // ==========================================

    const end = connectionDetails.connections.find(
        (connection) => connection.connectionRole === FiberCableConnectionRole.END,
      ) ?? null;

    // ==========================================
    // Splice points
    // ==========================================

    const spliceMap = new Map<string, {spliceClosure: any; connectedCables: any[]}>();

    for (const connection of connections) {

      const currentCore = connection.fiberCore;

      const currentPort = connection.spliceClosurePort;

      // A splice closure port must be connected to a FiberSplice
      const splice = currentPort.splicesAsPortA?.[0] ?? currentPort.splicesAsPortB?.[0];

      if (!splice) {
        continue;
      }

      // Determine the OTHER splice closure port
      const otherPort = splice.spliceClosurePortAId === currentPort.id
          ? splice.spliceClosurePortB
          : splice.spliceClosurePortA;

      if (!otherPort) {
        continue;
      }

      // Find the FiberCore connected to the OTHER port
      const otherCoreConnection = await fiberCoreSpliceClosurePortConnectionRepository.findOne({
          where: {
            spliceClosurePortId: otherPort.id,
          },
          relations: {
            fiberCore: {
              fiberCable: {
                asset: true,
              },
            },
          },
        });

      if (!otherCoreConnection) {
        continue;
      }

      const connectedCore = otherCoreConnection.fiberCore;
      const connectedCable = connectedCore.fiberCable;

      // Don't return the current cable as its own connected cable
      if (connectedCable.assetId === id) {
        continue;
      }

      const spliceClosure = currentPort.spliceClosure;

      if (!spliceClosure) {
        continue;
      }

      const spliceClosureId = spliceClosure.assetId;

      if (!spliceMap.has(spliceClosureId)) {
        spliceMap.set(spliceClosureId, {
          spliceClosure: {
            id: spliceClosure.assetId,
            assetId: spliceClosure.assetId,
            code: spliceClosure.asset.code,
            name: spliceClosure.asset.name,
          },
          connectedCables: [],
        });
      }

      const existing = spliceMap.get(spliceClosureId)!;

      // Prevent duplicate cable entries
      const alreadyExists = existing.connectedCables.some(
        (item) =>
          item.fiberCable.id === connectedCable.assetId,
      );

      if (!alreadyExists) {
        existing.connectedCables.push({
          fiberCable: {
            id: connectedCable.assetId,
            code: connectedCable.asset.code,
            name: connectedCable.asset.name,
          },

          sourceCore: {
            id: currentCore.id,
            number: currentCore.coreNumber,
          },

          destinationCore: {
            id: connectedCore.id,
            number: connectedCore.coreNumber,
          },

          spliceId: splice.id,
        });
      }
    }

    return {
      fiberCable: {
        // ==========================================
        // Asset information
        // ==========================================
        id: fiberCable.assetId,
        code: fiberCable.asset.code,
        name: fiberCable.asset.name,

        description: fiberCable.asset.description,

        assetTag: fiberCable.asset.assetTag,
        serialNumber: fiberCable.asset.serialNumber,

        purchaseDate: fiberCable.asset.purchaseDate,
        installationDate: fiberCable.asset.installationDate,

        warrantyStart: fiberCable.asset.warrantyStart,
        warrantyEnd: fiberCable.asset.warrantyEnd,

        geometry: fiberCable.asset.geometry,

        // ==========================================
        // Asset references
        // ==========================================
        assetType: fiberCable.asset.assetType
          ? {
              id: fiberCable.asset.assetType.id,
              name: fiberCable.asset.assetType.name,
              qualifier: fiberCable.asset.assetType.qualifier,
            }
          : null,

        status: fiberCable.asset.status
          ? {
              id: fiberCable.asset.status.id,
              name: fiberCable.asset.status.name,
            }
          : null,

        site: fiberCable.asset.site
          ? {
              id: fiberCable.asset.site.id,
              code: fiberCable.asset.site.code,
              name: fiberCable.asset.site.name,
            }
          : null,

        // ==========================================
        // Fiber Cable information
        // ==========================================
        cableType: fiberCable.cableType
          ? {
              id: fiberCable.cableType.id,
              name: fiberCable.cableType.name,
            }
          : null,

        coreCount: fiberCable.coreCount
          ? {
              id: fiberCable.coreCount.id,
              name: fiberCable.coreCount.displayCode,
            }
          : null,

        installationMethod: fiberCable.installationMethod
          ? {
              id: fiberCable.installationMethod.id,
              name: fiberCable.installationMethod.name,
            }
          : null,

        segmentType: fiberCable.segmentType
          ? {
              id: fiberCable.segmentType.id,
              name: fiberCable.segmentType.name,
            }
          : null,

        installationSegments: fiberCable.installationSegments.map(
          (segment) => ({
            id: segment.id,

            from: segment.fromConnection
              ? {
                  id: segment.fromConnection.id,
                  sequence: segment.fromConnection.sequence,
                  connectionRole:
                    segment.fromConnection.connectionRole,
                  assetId: segment.fromConnection.assetId,
                  siteId: segment.fromConnection.siteId,
                  targetType: segment.fromConnection.targetType,
                }
              : null,

            to: segment.toConnection
              ? {
                  id: segment.toConnection.id,
                  sequence: segment.toConnection.sequence,
                  connectionRole:
                    segment.toConnection.connectionRole,
                  assetId: segment.toConnection.assetId,
                  siteId: segment.toConnection.siteId,
                  targetType: segment.toConnection.targetType,
                }
              : null,

            installationMethod:
              segment.installationMethod
                ? {
                    id: segment.installationMethod.id,
                    name: segment.installationMethod.name,
                  }
                : null,

            createdAt: segment.createdAt,
            updatedAt: segment.updatedAt,
          }),
        ),

        installedLengthM: fiberCable.installedLengthM,

        createdAt: fiberCable.createdAt,
        updatedAt: fiberCable.updatedAt,
      },

      start,
      middle,
      end,

      splicePoints: Array.from(spliceMap.values()),
    };

  }

  // =============================================
  // Find Nearby Asset
  // =============================================


  async findNearbyAssets(query: NearbyAssetsQueryDto) {
    const {
      latitude,
      longitude,
      radius = 1000,
      limit,
      siteId,
    } = query;

    const assetRepository = this.dataSource.getRepository(Asset);

    const point = `
      ST_SetSRID(
        ST_MakePoint(:longitude, :latitude),
        4326
      )::geography
    `;

    const queryBuilder = assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.assetType', 'assetType')
      .leftJoinAndSelect('asset.status', 'status')
      .leftJoinAndSelect('asset.site', 'site')
      .where('asset.geometry IS NOT NULL')
      .andWhere(
        `ST_GeometryType(asset.geometry) = 'ST_Point'`,
      )
      .andWhere(
        `ST_DWithin(
          asset.geometry::geography,
          ${point},
          :radius
        )`,
        {
          latitude,
          longitude,
          radius,
        },
      )
      .addSelect(
        `
        ST_Distance(
          asset.geometry::geography,
          ${point}
        )
        `,
        'distance_m',
      )
      .orderBy('distance_m', 'ASC');


    if (limit) {
      queryBuilder.take(limit);
    }

    if (siteId) {
      queryBuilder.andWhere('asset.site_id = :siteId', {
        siteId,
      });
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    return {
      searchPoint: {
        latitude,
        longitude,
      },
      radiusM: radius,
      results: entities.map((asset, index) => ({
        asset: {
          id: asset.id,
          code: asset.code,
          name: asset.name,
          description: asset.description,
          assetTag: asset.assetTag,
          serialNumber: asset.serialNumber,
          assetType: asset.assetType?.name,
          status: asset.status?.name,
          site: asset.site
            ? {
                id: asset.site.id,
                code: asset.site.code,
                name: asset.site.name,
              }
            : null,
        },
        distanceM: Number(raw[index].distance_m),
      })),
    };
  }

  // ===============================================================
  // Update
  // ===============================================================

  async update(
    id: string,
    dto: UpdateFiberCableDto,
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const fiberCable = await manager
        .getRepository(FiberCable)
        .findOne({
          where: {
            assetId: id,
          },
          relations: {
            asset: true,
          },
        });

      if (!fiberCable) {
        throw new NotFoundException(
          `Fiber cable with ID ${id} not found.`,
        );
      }

      // =============================================
      // 1. Basic Fiber Cable / Asset information
      // =============================================

      await this.updateBasicInfo(
        id,
        fiberCable,
        dto,
        userId,
        manager,
      );

      // =============================================
      // 2. Fiber Core Count
      // =============================================

      if (dto.coreCountId !== undefined) {
        await this.updateCoreCount(
          id,
          fiberCable,
          dto.coreCountId,
          manager,
        );
      }

      // =============================================
      // 5. Full route
      // =============================================

      const hasRouteGeometry = dto.geometry !== undefined;

      const hasFullRouteTargets = dto.middleTargets !== undefined;

      const hasEndpointUpdate = dto.startTarget !== undefined || dto.endTarget !== undefined;

      if (hasRouteGeometry || hasFullRouteTargets) {
        await this.updateFullRoute(
          id,
          fiberCable,
          dto,
          userId,
          manager,
        );
      } else if (hasEndpointUpdate) {
        await this.updateEndpointsInternal(
          id,
          dto,
          userId,
          manager,
        );
      }

      // =============================================
      // 7. Installation segments
      // =============================================

      if (dto.installationSegments !== undefined) {
        await this.updateInstallationSegments(
          id,
          dto.installationSegments,
          manager,
        );
      }

      // =============================================
      // 8. Return fresh Fiber Cable
      // =============================================

      return manager
        .getRepository(FiberCable)
        .findOne({
          where: {
            assetId: id,
          },
          relations: {
            asset: {
              assetType: true,
              status: true,
              site: true,
            },
            cableType: true,
            coreCount: true,
            installationMethod: true,
            segmentType: true,
            fiberCores: {
              status: true,
            },
            installationSegments: {
              installationMethod: true,
              fromConnection: true,
              toConnection: true,
            },
          },
        });
    });
  }

  // ===============================================================
  // Delete
  // ===============================================================

  async remove(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const fiberCableRepo = manager.getRepository(FiberCable);
      const assetRepo = manager.getRepository(Asset);

      // =============================================
      // Find Fiber Cable
      // =============================================

      const fiberCable = await fiberCableRepo.findOne({
          where: {
            assetId: id,
          },
        });

      if (!fiberCable) {
        throw new NotFoundException(
          `Fiber cable with ID ${id} not found.`,
        );
      }

      await assetRepo.delete(id);

      return {
        message: 'Fiber cable deleted successfully.',
        id,
      };
    });
  }

}