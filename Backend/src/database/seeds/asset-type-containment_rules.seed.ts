
import { DataSource } from 'typeorm';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { AssetTypeContainmentRule } from 'src/modules/assets/entities/asset-type-containment-rules.entity';

type ContainmentRuleSeed = {
  parentCode: string;
  childCode: string;
  description: string;
};

const containmentRules: ContainmentRuleSeed[] = [
  // Building contains equipment containers
  {
    parentCode: 'BUILDING',
    childCode: 'RACK',
    description: 'A building can contain equipment racks.',
  },
  {
    parentCode: 'BUILDING',
    childCode: 'CABINET',
    description: 'A building can contain equipment cabinets.',
  },

  // Rack contains network equipment
  {
    parentCode: 'RACK',
    childCode: 'ROUTER',
    description: 'A rack can contain routers.',
  },
  {
    parentCode: 'RACK',
    childCode: 'SWITCH',
    description: 'A rack can contain network switches.',
  },
  {
    parentCode: 'RACK',
    childCode: 'OLT',
    description: 'A rack can contain optical line terminals.',
  },
  {
    parentCode: 'RACK',
    childCode: 'DWDM',
    description: 'A rack can contain DWDM equipment.',
  },
  {
    parentCode: 'RACK',
    childCode: 'OTN',
    description: 'A rack can contain OTN equipment.',
  },
  {
    parentCode: 'RACK',
    childCode: 'SDH',
    description: 'A rack can contain SDH equipment.',
  },
  {
    parentCode: 'RACK',
    childCode: 'ODF',
    description: 'A rack can contain optical distribution frames.',
  },

  // Cabinet contains fiber distribution equipment
  {
    parentCode: 'CABINET',
    childCode: 'NAP',
    description: 'A cabinet can house network access points.',
  },
  {
    parentCode: 'CABINET',
    childCode: 'OCC',
    description: 'A cabinet can house optical cross-connect equipment.',
  },
  {
    parentCode: 'CABINET',
    childCode: 'LCP',
    description: 'A cabinet can house line concentration points.',
  },
  {
    parentCode: 'CABINET',
    childCode: 'ODB',
    description: 'A cabinet can house optical distribution boxes.',
  },

  // Underground access structures contain splice closures
  {
    parentCode: 'MANHOLE',
    childCode: 'SPLICE_CLOSURE',
    description: 'A manhole can contain fiber splice closures.',
  },
  {
    parentCode: 'HANDHOLE',
    childCode: 'SPLICE_CLOSURE',
    description: 'A handhole can contain fiber splice closures.',
  },
];

export async function seedAssetTypeContainmentRules(
  dataSource: DataSource,
): Promise<void> {
  const assetTypeRepository = dataSource.getRepository(AssetType);
  const ruleRepository = dataSource.getRepository(AssetTypeContainmentRule);

  for (const item of containmentRules) {
    const parent = await assetTypeRepository.findOne({
      where: { code: item.parentCode },
    });

    const child = await assetTypeRepository.findOne({
      where: { code: item.childCode },
    });

    if (!parent) {
      throw new Error(
        `Parent Asset Type "${item.parentCode}" not found.`,
      );
    }

    if (!child) {
      throw new Error(
        `Child Asset Type "${item.childCode}" not found.`,
      );
    }

    if (!parent.isContainer) {
      throw new Error(
        `Asset Type "${item.parentCode}" cannot contain assets because isContainer is false.`,
      );
    }

    let rule = await ruleRepository.findOne({
      where: {
        parentAssetTypeId: parent.id,
        childAssetTypeId: child.id,
      },
    });

    if (!rule) {
      rule = ruleRepository.create({
        parentAssetTypeId: parent.id,
        childAssetTypeId: child.id,
        description: item.description,
        isActive: true,
      });
    } else {
      rule.description = item.description;
      rule.isActive = true;
    }

    await ruleRepository.save(rule);
  }

  console.log(
    `Asset Type containment rules seeded: ${containmentRules.length}`,
  );
}
