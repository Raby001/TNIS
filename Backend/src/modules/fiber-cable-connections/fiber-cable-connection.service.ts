import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FiberCable } from '../cables/entities/fiber-cable.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateFiberCableConnectionDto } from './dto/create-fiber-cable-connection.dto';
import { FiberCableConnection, FiberCableConnectionRole, FiberCableConnectionTargetType } from './entities/fiber-cable-connection.entity';
import { Site } from '../sites/entities/site.entity';
import { LineStringGeometryDto } from 'src/common/dto/line-string-geometry.dto';
import { FiberCableConnectionTargetDto } from './dto/fiber-cable-connection-target.dto';
import { ValidatedFiberCableTarget } from './types/fiber-cable-connection.types';


@Injectable()
export class FiberCableConnectionService {

  constructor(

    @InjectRepository(FiberCableConnection)
    private readonly connectionRepository: Repository<FiberCableConnection>,

    @InjectRepository(FiberCable)
    private readonly fiberCableRepository: Repository<FiberCable>,
  ) {}


  // ==========================================
  // Create Cable Route Connections
  // ==========================================

  async createCableRouteConnections(
    fiberCableId: string,
    geometry: LineStringGeometryDto,
    startTarget: FiberCableConnectionTargetDto,
    middleTargets: FiberCableConnectionTargetDto[],
    endTarget: FiberCableConnectionTargetDto,
    manager: EntityManager,
  ): Promise<FiberCableConnection[]> {

    const connectionRepository = manager.getRepository(FiberCableConnection);

    const fiberCableRepository = manager.getRepository(FiberCable);

    // ==========================================
    // Verify Fiber Cable
    // ==========================================

    const fiberCable = await fiberCableRepository.findOne({
      where: {
        assetId: fiberCableId,
      },
      relations: {
        asset: true,
      }
    });

    if (!fiberCable) {
      throw new NotFoundException(
        `Fiber Cable with ID ${fiberCableId} not found.`,
      );
    }

    // ==========================================
    // Build Ordered Targets
    // ==========================================

    const orderedTargets = [
      {
        target: startTarget,
        connectionRole: FiberCableConnectionRole.START,
      },
      ...middleTargets.map((target) => ({
        target,
        connectionRole: FiberCableConnectionRole.MIDDLE,
      })),
      {
        target: endTarget,
        connectionRole: FiberCableConnectionRole.END,
      },
    ];


    // ==========================================
    // Validate Each Target
    // ==========================================

    const validatedTargets: ValidatedFiberCableTarget[] =
      await Promise.all(
        orderedTargets.map(async (routeTarget) => {
          const validatedTarget =
            await this.validateConnectionTarget(
              manager,
              routeTarget.target,
            );

          return {
            ...validatedTarget,
            connectionRole: routeTarget.connectionRole,
          };
        }),
      );

    
    // ==========================================
    // Prevent Duplicate Targets
    // ==========================================

    this.validateUniqueTargets(validatedTargets);

    // ==========================================
    // Validate Targets Against LineString
    // ==========================================

    await this.validateTargetsAgainstGeometry(
      manager,
      geometry,
      validatedTargets,
    );




    // ==========================================
    // Save Connections
    // ==========================================

    const connections = validatedTargets.map((target, index) =>
      connectionRepository.create({
        fiberCableId,

        targetType: target.targetType,

        assetId: target.assetId,

        siteId: target.siteId,

        connectionRole: target.connectionRole,

        sequence: index,
      }),
    );

    return connectionRepository.save(connections);
  }

  // ==========================================
  // Validate Connection Target
  // ==========================================

  async validateConnectionTarget(
    manager: EntityManager,
    target: FiberCableConnectionTargetDto,
  ): Promise<Omit<ValidatedFiberCableTarget, 'connectionRole'>> {

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
        where: { id: target.assetId },
        relations: { assetType: true },
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
        where: { id: target.siteId },
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


  // ==========================================
  // Validate Unique Targets
  // ==========================================

  validateUniqueTargets(
    targets: Array<
      Pick<
        ValidatedFiberCableTarget,
        'targetType' | 'assetId' | 'siteId'
      >
    >,
  ): void {
    const targetKeys = new Set<string>();

    for (const target of targets) {
      const key =
        target.targetType === FiberCableConnectionTargetType.ASSET
          ? `ASSET:${target.assetId}`
          : `SITE:${target.siteId}`;

      if (targetKeys.has(key)) {
        throw new BadRequestException(
          `Target ${key} is used more than once in this fiber cable route.`,
        );
      }

      targetKeys.add(key);
    }
  }  

  // ==========================================
  // Validate Targets Against Cable Geometry
  // ==========================================

  async validateTargetsAgainstGeometry(
    manager: EntityManager,
    geometry: LineStringGeometryDto,
    targets: ValidatedFiberCableTarget[],
  ): Promise<void> {

    if (targets.length < 2) {
      throw new BadRequestException(
        'A Fiber Cable route must have at least START and END targets.',
      );
    }

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
        Number(vertexIndex) <= previousVertexIndex ||
        Number(vertexIndex) === geometry.coordinates.length
      ) {
        throw new BadRequestException(
          'Fiber Cable MIDDLE targets must appear in the same order as their sequence along the LineString.',
        );
      }

      previousVertexIndex = Number(vertexIndex);
    }
  }


  // ==========================================
  // Create Connection
  // ==========================================

  async create(
    dto: CreateFiberCableConnectionDto,
  ): Promise<FiberCableConnection> {
    return this.connectionRepository.manager.transaction(
      async (manager) => {
        return this.createInternal(dto, manager);
      },
    );
  }

  // ==========================================
  // Create Connection Internal
  // ==========================================

  private async createInternal(
    dto: CreateFiberCableConnectionDto,
    manager: EntityManager,
  ): Promise<FiberCableConnection> {
    const fiberCableRepository = manager.getRepository(FiberCable);

    const connectionRepository =
      manager.getRepository(FiberCableConnection);

    // ==========================================
    // Find Fiber Cable
    // ==========================================

    const fiberCable = await fiberCableRepository.findOne({
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

    await this.validateConnectionTarget(manager, dto);

    // ==========================================
    // Find Existing Connections
    // ==========================================

    const existingConnections = await connectionRepository.find({
      where: {
        fiberCableId: dto.fiberCableId,
      },
      order: {
        sequence: 'ASC',
      },
    });

    // ==========================================
    // Validate START
    // ==========================================

    if (dto.connectionRole === FiberCableConnectionRole.START) {
      const existingStart = existingConnections.find(
        (connection) =>
          connection.connectionRole === FiberCableConnectionRole.START,
      );

      if (existingStart) {
        throw new BadRequestException(
          'Fiber Cable already has a START connection.',
        );
      }

      if (existingConnections.length > 0) {
        throw new BadRequestException(
          'START connection must be the first connection of the Fiber Cable.',
        );
      }
    }

    // ==========================================
    // Validate END
    // ==========================================

    if (dto.connectionRole === FiberCableConnectionRole.END) {
      const existingEnd = existingConnections.find(
        (connection) =>
          connection.connectionRole === FiberCableConnectionRole.END,
      );

      if (existingEnd) {
        throw new BadRequestException(
          'Fiber Cable already has an END connection.',
        );
      }
    }

    // ==========================================
    // Prevent Duplicate Target Connection
    // ==========================================

    const duplicateTarget = existingConnections.find(
      (connection) =>
        dto.targetType === FiberCableConnectionTargetType.ASSET
          ? connection.targetType === FiberCableConnectionTargetType.ASSET &&
            connection.assetId === dto.assetId
          : connection.targetType === FiberCableConnectionTargetType.SITE &&
            connection.siteId === dto.siteId,
    );

    if (duplicateTarget) {
      throw new BadRequestException(
        dto.targetType === FiberCableConnectionTargetType.ASSET
          ? `Asset with ID ${dto.assetId} is already connected to this Fiber Cable.`
          : `Site with ID ${dto.siteId} is already connected to this Fiber Cable.`,
      );
    }

    // ==========================================
    // Determine Sequence
    // ==========================================

    let sequence: number;

    // MIDDLE is inserted before END
    if (dto.connectionRole === FiberCableConnectionRole.MIDDLE) {
      const existingEnd = existingConnections.find(
        (connection) =>
          connection.connectionRole === FiberCableConnectionRole.END,
      );

      if (existingEnd) {
        sequence = existingEnd.sequence!;

        // Move END one position forward
        existingEnd.sequence = existingEnd.sequence! + 1;

        await connectionRepository.save(existingEnd);
      } else {
        sequence =
          existingConnections.length > 0
            ? Math.max(
                ...existingConnections.map(
                  (connection) => connection.sequence ?? -1,
                ),
              ) + 1
            : 0;
      }
    } else {
      // START or END
      sequence =
        existingConnections.length > 0
          ? Math.max(
              ...existingConnections.map(
                (connection) => connection.sequence ?? -1,
              ),
            ) + 1
          : 0;
    }

    // ==========================================
    // Create Connection
    // ==========================================

    const connection = connectionRepository.create({
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

    return connectionRepository.save(connection);
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