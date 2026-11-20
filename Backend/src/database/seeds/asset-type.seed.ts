import { DataSource } from 'typeorm';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { AssetCategory } from 'src/modules/assets/entities/asset-category.entity';
import { GeometryType } from 'src/common/types/geometry.type';

type AssetTypeSeed = {
  name: string;
  code: string;
  qualifier: string;
  categoryCode: string;
  description: string;
  geometryType: GeometryType;
  isContainer: boolean;
  supportsCustomGeometry: boolean;
  isActive: boolean;
};

const assetTypes: AssetTypeSeed[] = [
  // =========================================================
  // CIVIL INFRASTRUCTURE
  // =========================================================
  {
    name: 'Tower',
    code: 'TOWER',
    qualifier: 'TW',
    categoryCode: 'CIVIL_INFRASTRUCTURE',
    description: 'Telecommunication tower supporting antennas and network equipment.',
    geometryType: 'Point',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Pole',
    code: 'POLE',
    qualifier: 'PL',
    categoryCode: 'CIVIL_INFRASTRUCTURE',
    description: 'Telecommunication utility pole supporting aerial cables and equipment.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Manhole',
    code: 'MANHOLE',
    qualifier: 'MH',
    categoryCode: 'CIVIL_INFRASTRUCTURE',
    description: 'Underground access structure for telecommunication ducts and cables.',
    geometryType: 'Point',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Handhole',
    code: 'HANDHOLE',
    qualifier: 'HH',
    categoryCode: 'CIVIL_INFRASTRUCTURE',
    description: 'Small underground access structure for telecommunication cables.',
    geometryType: 'Point',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: true,
  },

  // =========================================================
  // BUILDINGS & CONTAINERS
  // =========================================================
  {
    name: 'Building',
    code: 'BUILDING',
    qualifier: 'BLD',
    categoryCode: 'BUILDINGS_CONTAINERS',
    description: 'Telecommunication building or equipment facility.',
    geometryType: 'Polygon',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'Rack',
    code: 'RACK',
    qualifier: 'RCK',
    categoryCode: 'BUILDINGS_CONTAINERS',
    description: 'Telecommunication equipment rack.',
    geometryType: 'Point',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Cabinet',
    code: 'CABINET',
    qualifier: 'CAB',
    categoryCode: 'BUILDINGS_CONTAINERS',
    description: 'Outdoor or indoor cabinet for housing network equipment.',
    geometryType: 'Point',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'Shelter',
    code: 'SHELTER',
    qualifier: 'SHL',
    categoryCode: 'BUILDINGS_CONTAINERS',
    description: 'Telecommunication shelter housing network equipment.',
    geometryType: 'Polygon',
    isContainer: true,
    supportsCustomGeometry: true,
    isActive: false,
  },

  // =========================================================
  // FIBER INFRASTRUCTURE
  // =========================================================
  {
    name: 'Fiber Cable',
    code: 'FIBER_CABLE',
    qualifier: 'FO',
    categoryCode: 'FIBER_INFRASTRUCTURE',
    description: 'Fiber optic cable containing individual optical fiber cores.',
    geometryType: 'LineString',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Duct',
    code: 'DUCT',
    qualifier: 'DCT',
    categoryCode: 'FIBER_INFRASTRUCTURE',
    description: 'Physical conduit used to protect and route telecommunication cables.',
    geometryType: 'LineString',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'Duct Segment',
    code: 'DUCT_SEGMENT',
    qualifier: 'DCS',
    categoryCode: 'FIBER_INFRASTRUCTURE',
    description: 'A section of a duct route between two infrastructure points.',
    geometryType: 'LineString',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'Duct Route',
    code: 'DUCT_ROUTE',
    qualifier: 'DCR',
    categoryCode: 'FIBER_INFRASTRUCTURE',
    description: 'A planned or surveyed route consisting of connected duct segments.',
    geometryType: 'LineString',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },

  // =========================================================
  // FIBER DISTRIBUTION
  // =========================================================
  {
    name: 'NAP',
    code: 'NAP',
    qualifier: 'NAP',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Network Access Point used to distribute fiber connections to subscribers.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'OCC',
    code: 'OCC',
    qualifier: 'OCC',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Optical cross-connect point used for fiber termination and cross-connection.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'LCP',
    code: 'LCP',
    qualifier: 'LCP',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Line Concentration Point used for fiber distribution and splitting.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Splice Closure',
    code: 'SPLICE_CLOSURE',
    qualifier: 'SC',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Enclosure protecting fiber splices and cable joints.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'ODF',
    code: 'ODF',
    qualifier: 'ODF',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Optical Distribution Frame used for fiber termination and cross-connection.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'ODB',
    code: 'ODB',
    qualifier: 'ODB',
    categoryCode: 'FIBER_DISTRIBUTION',
    description: 'Optical Distribution Box used for fiber distribution.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },

  // =========================================================
  // ACTIVE NETWORK EQUIPMENT
  // =========================================================
  {
    name: 'ONU',
    code: 'ONU',
    qualifier: 'ONU',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Optical Network Unit installed at a customer or access location.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Router',
    code: 'ROUTER',
    qualifier: 'RTR',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Network router used to direct and manage network traffic.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
  {
    name: 'Switch',
    code: 'SWITCH',
    qualifier: 'SWT',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Network switch used to connect devices within a network.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'OLT',
    code: 'OLT',
    qualifier: 'OLT',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Optical Line Terminal used in a passive optical network.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'DWDM',
    code: 'DWDM',
    qualifier: 'DWD',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Dense Wavelength Division Multiplexing transmission equipment.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'OTN',
    code: 'OTN',
    qualifier: 'OTN',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Optical Transport Network equipment.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },
  {
    name: 'SDH',
    code: 'SDH',
    qualifier: 'SDH',
    categoryCode: 'ACTIVE_EQUIPMENT',
    description: 'Synchronous Digital Hierarchy transmission equipment.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: false,
  },

  // =========================================================
  // OPTICAL COMPONENTS
  // =========================================================
  {
    name: 'Optical Splitter',
    code: 'OPTICAL_SPLITTER',
    qualifier: 'SPL',
    categoryCode: 'OPTICAL_COMPONENTS',
    description: 'Optical splitter used to divide an incoming optical signal into multiple outputs.',
    geometryType: 'Point',
    isContainer: false,
    supportsCustomGeometry: true,
    isActive: true,
  },
];

export async function seedAssetTypes(dataSource: DataSource): Promise<void> {
  const assetTypeRepository = dataSource.getRepository(AssetType);
  const categoryRepository = dataSource.getRepository(AssetCategory);

  for (const item of assetTypes) {
    const category = await categoryRepository.findOne({
      where: { code: item.categoryCode },
    });

    if (!category) {
      throw new Error(
        `Asset category "${item.categoryCode}" was not seeded before asset types.`,
      );
    }

    let existing = await assetTypeRepository.findOne({
      where: { qualifier: item.qualifier },
    });

    if (!existing) {
      existing = assetTypeRepository.create();
    }

    assetTypeRepository.merge(existing, {
      name: item.name,
      code: item.code,
      qualifier: item.qualifier,
      categoryId: category.id,
      category,
      description: item.description,
      geometryType: item.geometryType,
      isContainer: item.isContainer,
      supportsCustomGeometry: item.supportsCustomGeometry,
      isActive: item.isActive,
    });

    await assetTypeRepository.save(existing);
  }

  console.log(`Asset types seeded: ${assetTypes.length}`);
}
