import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassThrough } from 'stream';
import { ZipArchive } from 'archiver';
import { Asset } from '../assets/entities/asset.entity';
import { Site } from '../sites/entities/site.entity';
import { ExportKmzQueryDto } from './dto/export-kmz-query.dto';

interface KmlFeature {
  id: string;
  name: string;
  description: string | null;
  geometryType: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  folder: string;
}

@Injectable()
export class GisService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  // =========================================================
  // KMZ EXPORT
  // =========================================================

  async exportKmz(query: ExportKmzQueryDto): Promise<Buffer> {
    const [assets, sites] = await Promise.all([
      this.getAssetsForExport(query),
      this.getSitesForExport(query),
    ]);

    const kml = this.buildKml(assets, sites);

    return this.createKmz(kml);
  }

  // =========================================================
  // GET ASSETS
  // =========================================================

  private async getAssetsForExport(
    query: ExportKmzQueryDto,
  ): Promise<KmlFeature[]> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.assetType', 'assetType')
      .leftJoin('asset.status', 'status')
      .leftJoin('asset.site', 'site')
      .leftJoin('site.city', 'city')
      .leftJoin('city.province', 'province')
      .where('asset.geometry IS NOT NULL');

    // =======================================================
    // Filters
    // =======================================================

    if (query.assetTypeId) {
      queryBuilder.andWhere(
        'asset.asset_type_id = :assetTypeId',
        {
          assetTypeId: query.assetTypeId,
        },
      );
    }

    if (query.statusId) {
      queryBuilder.andWhere(
        'asset.status_id = :statusId',
        {
          statusId: query.statusId,
        },
      );
    }

    if (query.siteId) {
      queryBuilder.andWhere(
        'asset.site_id = :siteId',
        {
          siteId: query.siteId,
        },
      );
    }

    if (query.cityId) {
      queryBuilder.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    if (query.provinceId) {
      queryBuilder.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    if (query.search) {
      queryBuilder.andWhere(
        `(
          asset.code ILIKE :search
          OR asset.name ILIKE :search
          OR asset.asset_tag ILIKE :search
          OR asset.serial_number ILIKE :search
        )`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    // =======================================================
    // Select
    // =======================================================

    queryBuilder
      .select('asset.id', 'id')
      .addSelect('asset.code', 'code')
      .addSelect('asset.name', 'name')
      .addSelect('asset.description', 'description')
      .addSelect('asset.asset_tag', 'assetTag')
      .addSelect('asset.serial_number', 'serialNumber')
      .addSelect('asset.asset_type_id', 'assetTypeId')
      .addSelect('asset.status_id', 'statusId')
      .addSelect('asset.site_id', 'siteId')
      .addSelect('assetType.name', 'assetTypeName')
      .addSelect('assetType.qualifier', 'assetTypeQualifier')
      .addSelect('assetType.geometry_type', 'geometryType')
      .addSelect('status.name', 'statusName')
      .addSelect('site.code', 'siteCode')
      .addSelect('site.name', 'siteName')
      .addSelect(
        'ST_AsGeoJSON(asset.geometry)',
        'geometry',
      )
      .orderBy('assetType.name', 'ASC')
      .addOrderBy('asset.code', 'ASC');

    const rows = await queryBuilder.getRawMany();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: this.buildAssetDescription(row),
      geometryType: row.geometryType,
      geometry: JSON.parse(row.geometry),
      folder: row.assetTypeName,
    }));
  }

  // =========================================================
  // GET SITES
  // =========================================================

  private async getSitesForExport(
    query: ExportKmzQueryDto,
  ): Promise<KmlFeature[]> {
    const queryBuilder = this.siteRepository
      .createQueryBuilder('site')
      .leftJoin('site.city', 'city')
      .leftJoin('city.province', 'province')
      .where('site.geometry IS NOT NULL');

    // =======================================================
    // Filters
    // =======================================================

    if (query.siteId) {
      queryBuilder.andWhere(
        'site.id = :siteId',
        {
          siteId: query.siteId,
        },
      );
    }

    if (query.cityId) {
      queryBuilder.andWhere(
        'city.id = :cityId',
        {
          cityId: query.cityId,
        },
      );
    }

    if (query.provinceId) {
      queryBuilder.andWhere(
        'province.id = :provinceId',
        {
          provinceId: query.provinceId,
        },
      );
    }

    if (query.search) {
      queryBuilder.andWhere(
        `(
          site.code ILIKE :search
          OR site.name ILIKE :search
          OR site.address ILIKE :search
        )`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    // =======================================================
    // Select
    // =======================================================

    queryBuilder
      .select('site.id', 'id')
      .addSelect('site.code', 'code')
      .addSelect('site.name', 'name')
      .addSelect('site.description', 'description')
      .addSelect('site.address', 'address')
      .addSelect('site.elevation', 'elevation')
      .addSelect(
        'ST_AsGeoJSON(site.geometry)',
        'geometry',
      )
      .orderBy('site.code', 'ASC');

    const rows = await queryBuilder.getRawMany();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: this.buildSiteDescription(row),
      geometryType: 'Point',
      geometry: JSON.parse(row.geometry),
      folder: 'Sites',
    }));
  }

  // =========================================================
  // DESCRIPTION
  // =========================================================

  private buildAssetDescription(row: any): string {
    const fields = [
      `Code: ${row.code ?? '-'}`,
      `Asset Type: ${row.assetTypeName ?? '-'}`,
      `Status: ${row.statusName ?? '-'}`,
      `Site: ${row.siteName ?? '-'}`,
      `Site Code: ${row.siteCode ?? '-'}`,
      `Asset Tag: ${row.assetTag ?? '-'}`,
      `Serial Number: ${row.serialNumber ?? '-'}`,
      row.description
        ? `Description: ${row.description}`
        : null,
    ];

    return fields
      .filter(Boolean)
      .join('\n');
  }

  private buildSiteDescription(row: any): string {
    const fields = [
      `Code: ${row.code ?? '-'}`,
      `Address: ${row.address ?? '-'}`,
      `Elevation: ${row.elevation ?? '-'}`,
      row.description
        ? `Description: ${row.description}`
        : null,
    ];

    return fields
      .filter(Boolean)
      .join('\n');
  }

  // =========================================================
  // BUILD KML
  // =========================================================

  private buildKml(
    assets: KmlFeature[],
    sites: KmlFeature[],
  ): string {
    const folders = new Map<string, KmlFeature[]>();

    // Sites
    if (sites.length > 0) {
      folders.set('Sites', sites);
    }

    // Assets
    for (const asset of assets) {
      const existing = folders.get(asset.folder) ?? [];

      existing.push(asset);

      folders.set(asset.folder, existing);
    }

    const folderXml = Array.from(folders.entries())
      .map(([folderName, features]) =>
        this.buildFolder(folderName, features),
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
              <Document>
                <name>Telecom Network Inventory</name>

                ${folderXml}

              </Document>
            </kml>`;
  }

  // =========================================================
  // BUILD FOLDER
  // =========================================================

  private buildFolder(
    folderName: string,
    features: KmlFeature[],
  ): string {
    const placemarks = features
      .map((feature) => this.buildPlacemark(feature))
      .join('\n');

    return `
    <Folder>
      <name>${this.escapeXml(folderName)}</name>

      ${placemarks}

    </Folder>`;
  }

  // =========================================================
  // BUILD PLACEMARK
  // =========================================================

  private buildPlacemark(feature: KmlFeature): string {
    const geometryXml = this.buildGeometry(
      feature.geometry,
    );

    return `
      <Placemark>
        <name>${this.escapeXml(feature.name)}</name>

        <description>
        <![CDATA[
          ${this.escapeCdata(feature.description ?? '')}
        ]]>
        </description>

        ${geometryXml}

      </Placemark>`;
  }

  // =========================================================
  // BUILD GEOMETRY
  // =========================================================

  private buildGeometry(
    geometry: {
      type: string;
      coordinates: any;
    },
  ): string {
    switch (geometry.type) {
      case 'Point':
        return this.buildPoint(geometry.coordinates);

      case 'LineString':
        return this.buildLineString(
          geometry.coordinates,
        );

      default:
        throw new Error(
          `Unsupported geometry type for KMZ export: ${geometry.type}`,
        );
    }
  }

  // =========================================================
  // POINT
  // =========================================================

  private buildPoint(
    coordinates: number[],
  ): string {
    const [longitude, latitude, altitude] =
      coordinates;

    const coordinate = altitude !== undefined
      ? `${longitude},${latitude},${altitude}`
      : `${longitude},${latitude}`;

    return `
        <Point>
          <coordinates>${coordinate}</coordinates>
        </Point>`;
  }

  // =========================================================
  // LINE STRING
  // =========================================================

  private buildLineString(
    coordinates: number[][],
  ): string {
    const coordinateString = coordinates
      .map(([longitude, latitude, altitude]) => {
        if (altitude !== undefined) {
          return `${longitude},${latitude},${altitude}`;
        }

        return `${longitude},${latitude}`;
      })
      .join(' ');

    return `
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            ${coordinateString}
          </coordinates>
        </LineString>`;
  }

  // =========================================================
  // CREATE KMZ
  // =========================================================

  private async createKmz(
    kml: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = new ZipArchive({
        zlib: {
          level: 9,
        },
      });

      const output = new PassThrough();
      const chunks: Buffer[] = [];

      output.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      output.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      output.on('error', reject);

      archive.on('error', reject);

      archive.pipe(output);

      archive.append(kml, {
        name: 'doc.kml',
      });

      archive.finalize();
    });
  }

  // =========================================================
  // XML HELPERS
  // =========================================================

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private escapeCdata(value: string): string {
    return value.replace(/\]\]>/g, ']]]]><![CDATA[>');
  }
}