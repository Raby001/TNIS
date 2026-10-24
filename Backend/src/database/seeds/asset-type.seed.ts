import { DataSource } from 'typeorm';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';
import { GeometryType } from 'src/common/types/geometry.type';
import { AssetTopologyMode } from 'src/modules/assets/enums/asset-topology-mode.enum';

export async function seedAssetTypes(dataSource: DataSource): Promise<void> {
  const assetTypeRepository = dataSource.getRepository(AssetType);

  const assetTypes: {
    name: string;
    qualifier: string;
    description: string;
    geometryType: GeometryType;
    topologyMode: AssetTopologyMode;
  }[] = [
    {
      name: 'Tower',
      qualifier: 'TW',
      description: 'Telecommunication tower.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'Pole',
      qualifier: 'PL',
      description: 'Telecommunication utility pole.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'Manhole',
      qualifier: 'MH',
      description: 'Underground access manhole.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'Handhole',
      qualifier: 'HH',
      description: 'Small underground access handhole.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'Fiber Cable',
      qualifier: 'FO',
      description: 'Fiber optic cable.',
      geometryType: 'LineString',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'ONU',
      qualifier: 'ONU',
      description: 'Optical Network Unit located at the customer premises, such as an ONT or ONU.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },

    {
      name: 'NAP',
      qualifier: 'NAP',
      description: 'Network Access Point.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },

    {
      name: 'Rack',
      qualifier: 'RCK',
      description: 'Telecommunication equipment rack.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.PHYSICAL,
    },

    {
      name: 'Router',
      qualifier: 'RTR',
      description: 'Network router used to direct and manage network traffic.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },

    {
      name: 'Closure',
      qualifier: 'SC',
      description: 'Fiber splice closure.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },
    
    {
      name: 'OCC',
      qualifier: 'OCC',
      description: 'Optical cross-connect point used as a fiber connection point in the telecom network.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },

    {
      name: 'LCP',
      qualifier: 'LCP',
      description: 'Fiber distribution point that splits an incoming fiber core into multiple outputs for connection to NAPs.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },
    {
      name: 'Optical Splitter',
      qualifier: 'SPL',
      description: 'Optical splitter used to divide an incoming fiber signal into multiple output fibers.',
      geometryType: 'Point',
      topologyMode: AssetTopologyMode.LOGICAL,
    },
  ];

  for (const assetType of assetTypes) {
    const existing = await assetTypeRepository.findOne({
      where: {
        qualifier: assetType.qualifier,
      },
    });

    if (existing) {
      existing.qualifier = assetType.qualifier;
      existing.description = assetType.description;
      existing.geometryType = assetType.geometryType;
      existing.topologyMode = assetType.topologyMode;

      await assetTypeRepository.save(existing);
      continue;
    }

    await assetTypeRepository.save(
      assetTypeRepository.create(assetType),
    );
  }

  console.log('Asset types seeded.');
}