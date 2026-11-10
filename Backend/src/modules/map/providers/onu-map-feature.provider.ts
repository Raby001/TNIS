import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Onu } from 'src/modules/onus/entities/onu.entity';
import { MapFeatureProvider } from '../interfaces/map-feature-provider.interface';
import { MapQueryDto } from '../dto/map-query.dto';

@Injectable()
export class OnuMapFeatureProvider implements MapFeatureProvider {

  constructor(
    @InjectRepository(Onu)
    private readonly onuRepository: Repository<Onu>,
  ) {}

  getType(): string {
    return 'ONU';
  }

  async getFeatures(
    query: MapQueryDto,
  ): Promise<any[]> {

    const qb = this.onuRepository
      .createQueryBuilder('onu')

      .innerJoinAndSelect(
        'onu.asset',
        'asset',
      )

      .leftJoinAndSelect(
        'onu.customer',
        'customer',
      )

      .leftJoinAndSelect(
        'asset.assetType',
        'assetType',
      )

      .leftJoinAndSelect(
        'asset.lifecycleStatus',
        'lifecycleStatus',
      )

      .leftJoinAndSelect(
        'asset.condition',
        'condition',
      )

      .leftJoinAndSelect(
        'asset.site',
        'site',
      )

      .leftJoinAndSelect(
        'site.city',
        'city',
      )

      .leftJoinAndSelect(
        'city.province',
        'province',
      )

      .where('asset.geometry IS NOT NULL');

    // ========================================================
    // Search
    // ========================================================

    if (query.search) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        `(
          asset.name ILIKE :search
          OR asset.code ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
          OR customer.customer_code ILIKE :search
          OR customer.name ILIKE :search
          OR customer.phone ILIKE :search
        )`,
        { search },
      );
    }

    // ========================================================
    // Province
    // ========================================================

    if (query.provinceId) {
      qb.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    // ========================================================
    // City
    // ========================================================

    if (query.cityId) {
      qb.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    // ========================================================
    // Site
    // ========================================================

    if (query.siteId) {
      qb.andWhere(
        'site.id = :siteId',
        {
          siteId: query.siteId,
        },
      );
    }

    // ========================================================
    // Lifecycle Status
    // ========================================================

    if (query.lifecycleStatusId) {
      qb.andWhere(
        'lifecycleStatus.id = :lifecycleStatusId',
        {
          lifecycleStatusId: query.lifecycleStatusId,
        },
      );
    }


    // ========================================================
    // Asset Condition
    // ========================================================

    if (query.conditionId) {
      qb.andWhere(
        'condition.id = :conditionId',
        {
          conditionId: query.conditionId,
        },
      );
    }

    // ========================================================
    // ONU Filters
    // ========================================================

    if (query.customerId) {
      qb.andWhere(
        'customer.id = :customerId',
        {
          customerId: query.customerId,
        },
      );
    }

    // ========================================================
    // Limit
    // ========================================================

    if (query.limit) {
      qb.take(query.limit);
    }

    const onus = await qb.getMany();

    // ========================================================
    // Convert to GeoJSON
    // ========================================================

    return onus.map((onu) => ({
      type: 'Feature',

      geometry:
        onu.asset.geometry,

      properties: {
        // ----------------------------------------------------
        // ONU
        // ----------------------------------------------------

        assetId: onu.assetId,

        type: 'ONU',

        name: onu.asset.name,

        code: onu.asset.code,

        assetTag: onu.asset.assetTag,

        serialNumber: onu.asset.serialNumber,

        description: onu.asset.description,

        lifecycleStatusId: onu.asset.lifecycleStatus?.id ?? null, 
        lifecycleStatus: onu.asset.lifecycleStatus?.name ?? null,

        condition: onu.asset.condition?.name ?? null,
        conditionId: onu.asset.condition?.id ?? null,

        manufacturer: onu.asset.manufacturer,
        model: onu.asset.model,

        installationDate: onu.asset.installationDate ?? null,

        macAddressONU: onu.macAddressONU ?? null,

        macAddressRouter: onu.macAddressRouter ?? null,

        ponType: onu.ponType ?? null,

        downloadSpeedMbps: onu.downloadSpeedMbps ?? null,

        uploadSpeedMbps: onu.uploadSpeedMbps ?? null,

        dataAllowanceGb: onu.dataAllowanceGb ?? null, 
        // ----------------------------------------------------
        // Customer
        // ----------------------------------------------------

        customerId: onu.customerId ?? null,

        customerCode: onu.customer?.customerCode ?? null,

        customerName: onu.customer?.name ?? null,

        customerPhone: onu.customer?.phone ?? null,

        customerAddress: onu.customer?.address ?? null,

        // ----------------------------------------------------
        // Location
        // ----------------------------------------------------

        siteId: onu.asset.siteId,

        site: onu.asset.site?.name ?? null,

        city: onu.asset.site?.city?.name ?? null,

        province: onu.asset.site?.city?.province?.name ?? null,
      },
    }));
  }
}