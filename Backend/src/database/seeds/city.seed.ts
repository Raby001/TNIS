import { City } from "src/modules/locations/entities/city.entity";
import { Province } from "src/modules/locations/entities/province.entity";
import { DataSource } from "typeorm";

export async function seedCities(dataSource: DataSource): Promise<void> {
  const cityRepository = dataSource.getRepository(City);
  const provinceRepository = dataSource.getRepository(Province);

  const cities = [
    // Phnom Penh
    {
      name: 'Phnom Penh',
      code: 'PP',
      provinceCode: 'PP',
    },

    // Banteay Meanchey
    {
      name: 'Serei Saophoan',
      code: 'SRS',
      provinceCode: 'BMC',
    },
    {
      name: 'Poipet',
      code: 'PPT',
      provinceCode: 'BMC',
    },

    // Battambang
    {
      name: 'Battambang',
      code: 'BTB',
      provinceCode: 'BTB',
    },

    // Kampong Cham
    {
      name: 'Kampong Cham',
      code: 'KPC',
      provinceCode: 'KPC',
    },

    // Kampong Chhnang
    {
      name: 'Kampong Chhnang',
      code: 'KCH',
      provinceCode: 'KCH',
    },

    // Kampong Speu
    {
      name: 'Chbar Mon',
      code: 'CBM',
      provinceCode: 'KPS',
    },
    {
      name: 'Oudong Me Chey',
      code: 'ODM',
      provinceCode: 'KPS',
    },

    // Kampong Thom
    {
      name: 'Stueng Saen',
      code: 'STS',
      provinceCode: 'KTH',
    },

    // Kampot
    {
      name: 'Kampot',
      code: 'KPT',
      provinceCode: 'KPT',
    },

    // Kandal
    {
      name: 'Ta Khmau',
      code: 'TKM',
      provinceCode: 'KDL',
    },
    {
      name: 'Sampov Poun',
      code: 'SPP',
      provinceCode: 'KDL',
    },
    {
      name: 'Akreiy Ksatr',
      code: 'AKS',
      provinceCode: 'KDL',
    },

    // Kep
    {
      name: 'Kep',
      code: 'KEP',
      provinceCode: 'KEP',
    },

    // Koh Kong
    {
      name: 'Khemara Phoumin',
      code: 'KKF',
      provinceCode: 'KKG',
    },

    // Kratie
    {
      name: 'Kratie',
      code: 'KRT',
      provinceCode: 'KRT',
    },

    // Mondulkiri
    {
      name: 'Sen Monorom',
      code: 'SMR',
      provinceCode: 'MDK',
    },

    // Oddar Meanchey
    {
      name: 'Samraong',
      code: 'SRG',
      provinceCode: 'ODM',
    },

    // Pailin
    {
      name: 'Pailin',
      code: 'PAI',
      provinceCode: 'PAI',
    },

    // Preah Sihanouk
    {
      name: 'Preah Sihanouk',
      code: 'SHV',
      provinceCode: 'SHV',
    },
    {
      name: 'Kaoh Rung',
      code: 'KRG',
      provinceCode: 'SHV',
    },
    {
      name: 'Kampong Soam',
      code: 'KPS',
      provinceCode: 'SHV',
    },

    // Preah Vihear
    {
      name: 'Preah Vihear',
      code: 'PVH',
      provinceCode: 'PVH',
    },

    // Prey Veng
    {
      name: 'Prey Veng',
      code: 'PVG',
      provinceCode: 'PVG',
    },

    // Pursat
    {
      name: 'Pursat',
      code: 'PUR',
      provinceCode: 'PUR',
    },

    // Ratanakiri
    {
      name: 'Banlung',
      code: 'BLG',
      provinceCode: 'RAT',
    },

    // Siem Reap
    {
      name: 'Siem Reap',
      code: 'SRP',
      provinceCode: 'SRP',
    },

    // Stung Treng
    {
      name: 'Stung Treng',
      code: 'STG',
      provinceCode: 'STG',
    },

    // Svay Rieng
    {
      name: 'Svay Rieng',
      code: 'SVR',
      provinceCode: 'SVR',
    },
    {
      name: 'Bavet',
      code: 'BVT',
      provinceCode: 'SVR',
    },

    // Takeo
    {
      name: 'Doun Kaev',
      code: 'DKV',
      provinceCode: 'TKO',
    },

    // Tboung Khmum
    {
      name: 'Suong',
      code: 'SNG',
      provinceCode: 'TBK',
    },
  ];

  for (const cityData of cities){
    const province = await provinceRepository.findOne({
      where:{
        code: cityData.provinceCode,
      }
    })

    if(!province){
      throw new Error(
        `Province with code ${cityData.provinceCode} is not Founded.`,
      )
    }

    const existing = await cityRepository.findOne({
      where: {
        code: cityData.code,
      }
    })

    if(existing){
      continue;
    }

    const city = cityRepository.create({
      name: cityData.name,
      code: cityData.code,
      province, 
    })

    await cityRepository.save(city);
  }

  console.log('Cities are seeded.')


}