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
        'asset.status',
        'status',
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
    // Status
    // ========================================================

    if (query.statusId) {
      qb.andWhere(
        'status.id = :statusId',
        {
          statusId: query.statusId,
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

        status: onu.asset.status?.name ?? null,

        statusId: onu.asset.status?.id ?? null,

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