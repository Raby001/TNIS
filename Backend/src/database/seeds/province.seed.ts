import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Province } from 'src/modules/locations/entities/province.entity';


function normalizeProvinceName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export async function seedProvinces( dataSource: DataSource ): Promise<void> {
  
  const repository = dataSource.getRepository(Province);

  const provinces: {
    name: string;
    code: string;
  }[] = [
    {
      name: 'Banteay Meanchey',
      code: 'BMC',
    },
    {
      name: 'Battambang',
      code: 'BTB',
    },
    {
      name: 'Kampong Cham',
      code: 'KPC',
    },
    {
      name: 'Kampong Chhnang',
      code: 'KCH',
    },
    {
      name: 'Kampong Speu',
      code: 'KPS',
    },
    {
      name: 'Kampong Thom',
      code: 'KTH',
    },
    {
      name: 'Kampot',
      code: 'KPT',
    },
    {
      name: 'Kandal',
      code: 'KDL',
    },
    {
      name: 'Kep',
      code: 'KEP',
    },
    {
      name: 'Koh Kong',
      code: 'KKG',
    },
    {
      name: 'Kratie',
      code: 'KRT',
    },
    {
      name: 'Mondul Kiri',
      code: 'MDK',
    },
    {
      name: 'Oddar Meanchey',
      code: 'ODM',
    },
    {
      name: 'Pailin',
      code: 'PAI',
    },
    {
      name: 'Phnom Penh',
      code: 'PP',
    },
    {
      name: 'Preah Sihanouk',
      code: 'SHV',
    },
    {
      name: 'Preah Vihear',
      code: 'PVH',
    },
    {
      name: 'Prey Veng',
      code: 'PVG',
    },
    {
      name: 'Pursat',
      code: 'PUR',
    },
    {
      name: 'Ratanak Kiri',
      code: 'RAT',
    },
    {
      name: 'Siemreap',
      code: 'SRP',
    },
    {
      name: 'Stung Treng',
      code: 'STG',
    },
    {
      name: 'Svay Rieng',
      code: 'SVR',
    },
    {
      name: 'Takeo',
      code: 'TKO',
    },
    {
      name: 'Tboung Khmum',
      code: 'TBK',
    },
  ];
  
  const geoJsonPath = path.join(
    process.cwd(),
    'src',
    'database',
    'data',
    'CambodiaProvinceBoundaries.geojson',
  );

  const geoJsonContent = fs.readFileSync(
    geoJsonPath,
    'utf-8',
  );

  const geoJson = JSON.parse(geoJsonContent);

  for (const province of provinces) {
    const geoJsonFeature = geoJson.features.find(
      (feature: any) => {
        const geoJsonName = feature.properties?.ADM1_EN;

        if (!geoJsonName) {
          return false;
        }

        return (
          normalizeProvinceName(geoJsonName) ===
          normalizeProvinceName(province.name)
        );
      },
    );

    if (!geoJsonFeature) {
      throw new Error(
        `Province boundary not found in GeoJSON for "${province.name}".`,
      );
    }

    const sourceGeometry = geoJsonFeature.geometry;

    if (
      !sourceGeometry ||
      (sourceGeometry.type !== 'Polygon' &&
        sourceGeometry.type !== 'MultiPolygon')
    ) {
      throw new Error(
        `Invalid boundary geometry for province "${province.name}". Expected Polygon or MultiPolygon.`,
      );
    }

    const geometry =
      sourceGeometry.type === 'Polygon'
        ? {
            type: 'MultiPolygon' as const,
            coordinates: [sourceGeometry.coordinates],
          }
        : sourceGeometry;
    
    const existing = await repository.findOne({
      where: {
        code: province.code,
      },
    });

    if (existing) {
      existing.name = province.name;
      existing.geometry = geometry;

      await repository.save(existing);
      continue;
    }

    await repository.save(
      repository.create({
        ...province,
        geometry,
      }),
    );
  }

  console.log("Province Seed Successfully.")
}