
import { DataSource } from 'typeorm';
import { AssetCapability } from 'src/modules/assets/entities/asset-capability.entity';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { AssetTypeCapability } from 'src/modules/assets/entities/asset-type-capability.entity';

type CapabilitySeed = {
  code: string;
  name: string;
  description: string;
};

const capabilities: CapabilitySeed[] = [
  {
    code: 'FIBER_CABLE_ROUTE_TARGET',
    name: 'Fiber Cable Route Target',
    description: 'Can be used as a physical target along a fiber cable route.',
  },
  {
    code: 'FIBER_TERMINATION',
    name: 'Fiber Termination',
    description: 'Supports fiber termination or connection points.',
  },
  {
    code: 'FIBER_SPLICE_LOCATION',
    name: 'Fiber Splice Location',
    description: 'Can be used as a physical location for fiber splicing.',
  },
  {
    code: 'FIBER_CORE_MANAGEMENT',
    name: 'Fiber Core Management',
    description: 'Manages or exposes individual fiber cores.',
  },
  {
    code: 'HAS_PORTS',
    name: 'Has Ports',
    description: 'Has independently managed connection ports.',
  },
  {
    code: 'CONTAINS_ASSETS',
    name: 'Contains Assets',
    description: 'Can physically contain or house other assets.',
  },
];

type CapabilityAssignmentSeed = {
  assetTypeCode: string;
  capabilities: string[];
};

const assignments: CapabilityAssignmentSeed[] = [
  // Civil infrastructure
  {
    assetTypeCode: 'TOWER',
    capabilities: ['FIBER_CABLE_ROUTE_TARGET', 'CONTAINS_ASSETS'],
  },
  {
    assetTypeCode: 'POLE',
    capabilities: ['FIBER_CABLE_ROUTE_TARGET'],
  },
  {
    assetTypeCode: 'MANHOLE',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_SPLICE_LOCATION',
      'CONTAINS_ASSETS',
    ],
  },
  {
    assetTypeCode: 'HANDHOLE',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_SPLICE_LOCATION',
      'CONTAINS_ASSETS',
    ],
  },

  // Buildings and containers
  {
    assetTypeCode: 'BUILDING',
    capabilities: ['CONTAINS_ASSETS'],
  },
  {
    assetTypeCode: 'RACK',
    capabilities: ['CONTAINS_ASSETS'],
  },
  {
    assetTypeCode: 'CABINET',
    capabilities: ['CONTAINS_ASSETS'],
  },
  {
    assetTypeCode: 'SHELTER',
    capabilities: ['CONTAINS_ASSETS'],
  },

  // Fiber infrastructure
  {
    assetTypeCode: 'FIBER_CABLE',
    capabilities: ['FIBER_CORE_MANAGEMENT'],
  },
  {
    assetTypeCode: 'DUCT',
    capabilities: [],
  },
  {
    assetTypeCode: 'DUCT_SEGMENT',
    capabilities: [],
  },
  {
    assetTypeCode: 'DUCT_ROUTE',
    capabilities: [],
  },

  // Fiber distribution
  {
    assetTypeCode: 'NAP',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_TERMINATION',
      'HAS_PORTS',
    ],
  },
  {
    assetTypeCode: 'OCC',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_TERMINATION',
      'FIBER_CORE_MANAGEMENT',
      'HAS_PORTS',
    ],
  },
  {
    assetTypeCode: 'LCP',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_TERMINATION',
      'HAS_PORTS',
    ],
  },
  {
    assetTypeCode: 'SPLICE_CLOSURE',
    capabilities: [
      'FIBER_CABLE_ROUTE_TARGET',
      'FIBER_SPLICE_LOCATION',
      'FIBER_CORE_MANAGEMENT',
    ],
  },
  {
    assetTypeCode: 'ODF',
    capabilities: ['FIBER_TERMINATION', 'FIBER_CORE_MANAGEMENT', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'ODB',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },

  // Active network equipment
  {
    assetTypeCode: 'ONU',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'ROUTER',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'SWITCH',
    capabilities: ['HAS_PORTS'],
  },
  {
    assetTypeCode: 'OLT',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'DWDM',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'OTN',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
  {
    assetTypeCode: 'SDH',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },

  // Optical components
  {
    assetTypeCode: 'OPTICAL_SPLITTER',
    capabilities: ['FIBER_TERMINATION', 'HAS_PORTS'],
  },
];

export async function seedAssetCapabilities(
  dataSource: DataSource,
): Promise<void> {
  const capabilityRepository = dataSource.getRepository(AssetCapability);
  const assetTypeRepository = dataSource.getRepository(AssetType);
  const assignmentRepository = dataSource.getRepository(AssetTypeCapability);

  const capabilityByCode = new Map<string, AssetCapability>();

  // 1. Create or update capabilities.
  for (const item of capabilities) {
    let capability = await capabilityRepository.findOne({
      where: { code: item.code },
    });

    if (!capability) {
      capability = capabilityRepository.create(item);
    } else {
      capabilityRepository.merge(capability, {
        ...item,
        isActive: true,
      });
    }

    capability = await capabilityRepository.save(capability);
    capabilityByCode.set(item.code, capability);
  }

  // 2. Assign capabilities to Asset Types.
  for (const assignment of assignments) {
    const assetType = await assetTypeRepository.findOne({
      where: { code: assignment.assetTypeCode },
    });

    if (!assetType) {
      throw new Error(
        `Cannot assign capabilities: Asset Type "${assignment.assetTypeCode}" was not found.`,
      );
    }

    for (const capabilityCode of assignment.capabilities) {
      const capability = capabilityByCode.get(capabilityCode);

      if (!capability) {
        throw new Error(
          `Capability "${capabilityCode}" was not seeded.`,
        );
      }

      const exists = await assignmentRepository.findOne({
        where: {
          assetTypeId: assetType.id,
          capabilityId: capability.id,
        },
      });

      if (!exists) {
        await assignmentRepository.save(
          assignmentRepository.create({
            assetTypeId: assetType.id,
            capabilityId: capability.id,
          }),
        );
      }
    }
  }

  console.log(
    `Asset capabilities seeded: ${capabilities.length} capabilities, ${assignments.length} Asset Type assignments.`,
  );
}
