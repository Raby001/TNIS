
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberCoreSide } from '../cables/enums/fiber-core-side.enum';

import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';

import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';

import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';

import { FiberCoreRouterPortConnection } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity';

import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';

@Injectable()
export class FiberCoreConnectionService {
  /**
   * Check whether a specific side of a fiber core is already
   * connected to any asset port.
   *
   * The supplied EntityManager ensures that all checks run
   * inside the caller's transaction.
   */
  async validateCoreSideAvailable(
    fiberCoreId: string,
    fiberCoreSide: FiberCoreSide,
    manager: EntityManager,
  ): Promise<void> {
    // OCC port connection
    const occStatus = await manager
      .getRepository(FiberCoreOccPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      occStatus &&
      await manager.getRepository(FiberCoreOccPortConnection).findOne({
        where: {
          fiberCoreId,
          fiberCoreSide,
          statusId: occStatus.id,
        },
      })
    ) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an OCC port.`,
      );
    }

    // Optical splitter connection
    const splitterStatus = await manager
      .getRepository(FiberCoreSplitterConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      splitterStatus &&
      await manager.getRepository(FiberCoreSplitterConnection).findOne({
        where: {
          fiberCoreId,
          fiberCoreSide,
          statusId: splitterStatus.id,
        },
      })
    ) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an optical splitter port.`,
      );
    }

    // ONU connection
    const onuStatus = await manager
      .getRepository(FiberCoreOnuConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      onuStatus &&
      await manager.getRepository(FiberCoreOnuConnection).findOne({
        where: {
          fiberCoreId,
          fiberCoreSide,
          statusId: onuStatus.id,
        },
      })
    ) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to an ONU.`,
      );
    }

    // Router port connection
    const routerStatus = await manager
      .getRepository(FiberCoreRouterPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      routerStatus &&
      await manager.getRepository(FiberCoreRouterPortConnection).findOne({
        where: {
          fiberCoreId,
          fiberCoreSide,
          statusId: routerStatus.id,
        },
      })
    ) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to a router port.`,
      );
    }

    // Splice closure port connection
    const spliceClosureStatus = await manager
      .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      spliceClosureStatus &&
      await manager
        .getRepository(FiberCoreSpliceClosurePortConnection)
        .findOne({
          where: {
            fiberCoreId,
            fiberCoreSide,
            statusId: spliceClosureStatus.id,
          },
        })
    ) {
      throw new BadRequestException(
        `Fiber core ${fiberCoreId} side ${fiberCoreSide} is already connected to a splice closure port.`,
      );
    }
  }

  /**
   * Recalculate the aggregate status of a fiber core.
   *
   * IN_USE: at least one active core-to-port connection exists.
   * AVAILABLE: no active core-to-port connection exists.
   */
  async updateCoreStatus(
    fiberCoreId: string,
    manager: EntityManager,
  ): Promise<void> {
    const fiberCoreRepository = manager.getRepository(FiberCore);

    const fiberCore = await fiberCoreRepository.findOne({
      where: { id: fiberCoreId },
    });

    if (!fiberCore) {
      throw new NotFoundException(
        `Fiber core "${fiberCoreId}" not found.`,
      );
    }

    const hasActiveConnection =
      await this.hasActiveConnection(fiberCoreId, manager);

    const targetStatusCode = hasActiveConnection
      ? 'IN_USE'
      : 'AVAILABLE';

    const targetStatus = await manager
      .getRepository(FiberCoreStatus)
      .findOne({
        where: { code: targetStatusCode },
      });

    if (!targetStatus) {
      throw new NotFoundException(
        `Fiber Core status "${targetStatusCode}" not found.`,
      );
    }

    await fiberCoreRepository.update(fiberCoreId, {
      statusId: targetStatus.id,
    });
  }

  /**
   * Check all supported core-to-port connection tables.
   */
  private async hasActiveConnection(
    fiberCoreId: string,
    manager: EntityManager,
  ): Promise<boolean> {
    // OCC port
    const occStatus = await manager
      .getRepository(FiberCoreOccPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      occStatus &&
      await manager.getRepository(FiberCoreOccPortConnection).findOne({
        where: {
          fiberCoreId,
          statusId: occStatus.id,
        },
      })
    ) {
      return true;
    }

    // Optical splitter
    const splitterStatus = await manager
      .getRepository(FiberCoreSplitterConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      splitterStatus &&
      await manager.getRepository(FiberCoreSplitterConnection).findOne({
        where: {
          fiberCoreId,
          statusId: splitterStatus.id,
        },
      })
    ) {
      return true;
    }

    // ONU
    const onuStatus = await manager
      .getRepository(FiberCoreOnuConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      onuStatus &&
      await manager.getRepository(FiberCoreOnuConnection).findOne({
        where: {
          fiberCoreId,
          statusId: onuStatus.id,
        },
      })
    ) {
      return true;
    }

    // Router port
    const routerStatus = await manager
      .getRepository(FiberCoreRouterPortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      routerStatus &&
      await manager.getRepository(FiberCoreRouterPortConnection).findOne({
        where: {
          fiberCoreId,
          statusId: routerStatus.id,
        },
      })
    ) {
      return true;
    }

    // Splice closure port
    const spliceClosureStatus = await manager
      .getRepository(FiberCoreSpliceClosurePortConnectionStatus)
      .findOne({
        where: { code: 'ACTIVE' },
      });

    if (
      spliceClosureStatus &&
      await manager
        .getRepository(FiberCoreSpliceClosurePortConnection)
        .findOne({
          where: {
            fiberCoreId,
            statusId: spliceClosureStatus.id,
          },
        })
    ) {
      return true;
    }

    return false;
  }
}
