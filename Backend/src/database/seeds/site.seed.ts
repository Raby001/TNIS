import { DataSource } from 'typeorm';
import { Site } from 'src/modules/sites/entities/site.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { HierarchyCodeSequence } from 'src/modules/hierarchy/entities/heirarchy-code-sequence.entity';

export async function seedSites(dataSource: DataSource): Promise<void> {

  const siteRepository = dataSource.getRepository(Site);

  const cityRepository = dataSource.getRepository(City);

  const sequenceRepository = dataSource.getRepository(HierarchyCodeSequence);

  // ========================================================
  // Site data
  // ========================================================

  const sites = [

    // ======================================================
    // Phnom Penh
    // ======================================================


    {
      cityCode: 'PP',
      name: 'Angkor (PP)',
      latitude: 11.556467,
      longitude: 104.919483,
      address: 'មហាវិថីព្រះសីហនុ កែងផ្លូវលេខ១០៥ សង្កាត់បឹងព្រលឹត ខណ្ឌ៧មករា រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'Banteay Srey (PP)',
      latitude: 11.564452,
      longitude: 104.898573,
      address: 'លេខ១៥០ សង្កាត់ទឹកល្អក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-NEAK POAN',
      latitude: 11.558560,
      longitude: 104.841560,
      address: 'ផ្លូវលេខ ១០៥K ភូមិក្បាលដំរី សង្កាត់កាកាប ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-CHOM CHAO',
      latitude: 11.537231,
      longitude: 104.814244,
      address: 'ផ្លូវលេខ ៣ សង្កាត់ចោមចៅ៣ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-VENG SRENG',
      latitude: 11.529010,
      longitude: 104.841390,
      address: 'មហាវិថីចោមចៅ សង្កាត់ចោមចៅ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-CBHBAR AMPOV',
      latitude: 11.533642,
      longitude: 104.942252,
      address: 'ផ្លូវលេខ ៦១២ សង្កាត់ច្បារអំពៅទី២ ខណ្ឌច្បារអំពៅ រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-PHSAR DAEM THKOV',
      latitude: 11.532300,
      longitude: 104.913770,
      address: 'ផ្លូវលេខ ៤៨៨ សង្កាត់ផ្សារដើមថ្កូវ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC-CHRANG CHAMREH',
      latitude: 11.634150,
      longitude: 104.895997,
      address: 'ផ្លូវជាតិលេខ៥ សង្កាត់ច្រាំងចំរេះ ខណ្ឌឬស្សីកែវ រាជធានីភ្នំពេញ',
    },

    {
      cityCode: 'PP',
      name: 'TC- TOUL SANGKE',
      latitude: 11.598610,
      longitude: 104.902040,
      address: 'ផ្លូវលេខ៥៦ សង្កាត់ទួលសង្កែ ខណ្ឌឬស្សីកែវ រាជធានីភ្នំពេញ',
    },

    // ======================================================
    // Stung Treng
    // ======================================================

    {
      cityCode: 'STG',
      name: 'Stung Treng',
      latitude: 13.526710,
      longitude: 105.969925,
      address: 'ភូមិព្រែក សង្កាត់ស្ទឹងត្រែង ក្រុងស្ទឹងត្រែង ខេត្តស្ទឹងត្រែង',
    },

    {
      cityCode: 'STG',
      name: 'Trapang Kreal',
      latitude: 13.919376,
      longitude: 106.032308,
      address: 'ភូមិត្រពាំងគ្រៀល ឃុំអូរស្វាយ ស្រុកបុរីអូរស្វាយសែនជ័យ ខេត្តស្ទឹងត្រែង',
    },

    // ======================================================
    // Kratie
    // ======================================================

    {
      cityCode: 'KRT',
      name: 'Kratie',
      latitude: 12.479280,
      longitude: 106.020833,
      address: 'ផ្លូវព្រះកុសុមៈ សង្កាត់ក្រចេះ ខណ្ឌក្រចេះ ក្រុងក្រចេះ ខេត្តក្រចេះ',
    },

    {
      cityCode: 'KRT',
      name: 'Snoul',
      latitude: 12.069415,
      longitude: 106.422214,
      address: 'ភូមិផ្សារស្នួល ឃុំស្នួល ស្រុកស្នួល ខេត្តក្រចេះ',
    },

    {
      cityCode: 'KRT', // Kratie
      name: 'Ou Krieng',
      latitude: 13.026040,
      longitude: 106.180600,
      address: 'ភូមិអូរគ្រៀង ឃុំអូរគ្រៀង ស្រុកអូរគ្រៀងសែនជ័យ ខេត្តក្រចេះ',
    },
    // ======================================================
    // Siem Reap
    // ======================================================

    {
      cityCode: 'SRP',
      name: 'Siemreap',
      latitude: 13.359941,
      longitude: 103.858941,
      address: 'មណ្ឌល២ ផ្លូវពោធិកំបោរ ឃុំស្វាយដង្គំ ក្រុងសៀមរាប ខេត្តសៀមរាប',
    },

    {
      cityCode: 'SRP',
      name: 'Kampong Kdei',
      latitude: 13.124622,
      longitude: 104.341170,
      address: 'ភូមិកំពង់ក្តី២ ឃុំកំពង់ក្តី ស្រុកជីក្រែង ខេត្តសៀមរាប',
    },

    {
      cityCode: 'SRP',
      name: 'Kralanh',
      latitude: 13.585941,
      longitude: 103.420869,
      address: 'ភូមិក្រឡាញ់ ឃុំក្រឡាញ់ ស្រុកក្រឡាញ់ ខេត្តសៀមរាប',
    },

    {
      cityCode: 'SRP',
      name: 'TC Damdek',
      latitude: 13.243784,
      longitude: 104.123720,
      address: 'ភូមិដំដែកថ្មី ឃុំដំដែក ស្រុកសូត្រនិគម ខេត្តសៀមរាប',
    },

    {
      cityCode: 'SRP',
      name: 'TC Puok',
      latitude: 13.440902,
      longitude: 103.728633,
      address: 'ភូមិគោកស្រុក ឃុំពួក ស្រុកពួក ខេត្តសៀមរាប',
    },

    // ======================================================
    // Koh Kong
    // ======================================================

    {
      cityCode: 'KKF',
      name: 'TC- Koh Kong',
      latitude: 11.616129,
      longitude: 102.982811,
      address: 'ភូមិ ១, សង្កាត់ ស្មាច់មានជ័យ, ក្រុង ខេមរៈភូមិន្ទ',
    },

    // ======================================================
    // Pursat
    // ======================================================

    {
      cityCode: 'PUR',
      name: 'TC-Pursat',
      latitude: 12.540567,
      longitude: 103.920217,
      address: 'ផ្លូវលេខ ១០១ ភូមិពាលញែក២, សង្កាត់ផ្ទះព្រៃ, ក្រុងពោធិ៍សាត់, ខេត្តពោធិ៍សាត់',
    },

    {
      cityCode: 'PUR',
      name: 'TC-Krakor',
      latitude: 12.532374,
      longitude: 104.209008,
      address: 'ភូមិផ្សារ ឃុំអន្លង់ត្នោត ស្រុកក្រគរ ខេត្តពោធិសាត់',
    },

    // ======================================================
    // Kep
    // ======================================================

    {
      cityCode: 'KEP',
      name: 'TC KEP',
      latitude: 10.480820,
      longitude: 104.315090,
      address: 'ភូមិកែប សង្កាត់កែប ក្រុងកែប ខេត្តកែប',
    },

    // ======================================================
    // Kampot
    // ======================================================

    {
      cityCode: 'KPT',
      name: 'TC KOMPOT',
      latitude: 10.606200,
      longitude: 104.180000,
      address: 'ភូម១ឧសភា សង្កាត់កំពង់កណ្តាល ក្រុងកំពត ខេត្តកំពត',
    },

    {
      cityCode: 'KPT',
      name: 'TC Kampong Trach',
      latitude: 10.558820,
      longitude: 104.467580,
      address: 'ផ្លូវលេខ៣៣ ភូមិកំពង់ត្រាច១ ឃុំកំពង់ត្រាចខាងកើត ស្រុកកំពង់ត្រាច ខេត្តកំពត',
    },

    {
      cityCode: 'KPT',
      name: 'TC Banteay Meas',
      latitude: 10.662630,
      longitude: 104.554860,
      address: 'ផ្លូវលេខ៣១ ភូមិទូកមាស ឃុំទូកមាស ស្រុកបន្ទាយមាស ខេត្តកំពត',
    },

    // ======================================================
    // Preah Sihanouk
    // ======================================================

    {
      cityCode: 'SHV',
      name: 'TC Sihanouk Ville',
      latitude: 10.629440,
      longitude: 103.506570,
      address: 'ផ្លូវឯករាជ្យ ភូមិ៣ សង្កាត់លេខ៣ ក្រុងព្រះសីហនុ ខេត្តព្រះសីហនុ',
    },

    {
      cityCode: 'SHV',
      name: 'TC Prey Nob',
      latitude: 10.707280,
      longitude: 103.817560,
      address: 'ផ្លូវជាតិលេខ៤ ភូមិបឹងវែង ឃុំវាលរេញ ស្រុកព្រៃនប់ ខេត្តព្រះសីហនុ',
    },

    // ======================================================
    // Takeo
    // ======================================================

    {
      cityCode: 'DKV',
      name: 'TC TAKEO',
      latitude: 10.990850,
      longitude: 104.782760,
      address: 'ភូមិ៣ ផ្លូវលេខ២៣ សង្កាត់រកាក្នុង ក្រុងដូនកែវ ខេត្តតាកែវ',
    },

    {
      cityCode: 'DKV',
      name: 'TC Ang Ta Som',
      latitude: 11.012410,
      longitude: 104.672860,
      address: 'ផ្លូវជាតិលេខ៣ ភូមិអង្គតាសោម ឃុំអង្គតាសោម ស្រុកត្រាំកក់ ខេត្តតាកែវ',
    },

    // ======================================================
    // Kandal
    // ======================================================

    {
      cityCode: 'TKM',
      name: 'TC Ta Khmao',
      latitude: 11.471420,
      longitude: 104.952420,
      address: 'ភូមិព្រែកសំរោង សង្កាត់តាខ្មៅ ក្រុងតាខ្មៅ ខេត្តកណ្តាល',
    },

    // ======================================================
    // Kampong Speu
    // ======================================================

    {
      cityCode: 'CBM',
      name: 'TC KOMPONG SPUE',
      latitude: 11.465880,
      longitude: 104.527070,
      address: 'ផ្លូវជាតិលេខ៤ ភូមិសំណង់ សង្កាត់រកាធំ ក្រុងច្បារមន ខេត្តកំពង់ស្ពឺ',
    },

    {
      cityCode: 'CBM',
      name: 'TC Oudong',
      latitude: 11.822710,
      longitude: 104.745150,
      address: 'ផ្លូវជាតិលេខ៥ ភូមិឧដុង្គ សង្កាត់វាំងចាស់ ក្រុងឧដុង្គម៉ែជ័យ ខេត្តកំពង់ស្ពឺ',
    },

    // ======================================================
    // Kampong Chhnang
    // ======================================================

    {
      cityCode: 'KCH',
      name: 'TC Kampong Chhnang',
      latitude: 12.254050,
      longitude: 104.667630,
      address: 'ផ្លូវជាតិលេខ៥ ភូមិ១ សង្កាត់ខ្សាម ក្រុងកំពង់ឆ្នាំង ខេត្តកំពង់ឆ្នាំង',
    },

    {
      cityCode: 'KCH',
      name: 'TC Kompong Tralach',
      latitude: 11.939850,
      longitude: 104.714740,
      address: 'ភូមិសាលាលេខ 5, ឃុំ ពាលនី, ស្រុក កំពង់ត្រឡាច',
    },

    // ======================================================
    // Battambang
    // ======================================================

    {
      cityCode: 'BTB',
      name: 'TC Battambang',
      latitude: 13.093680,
      longitude: 103.198070,
      address: 'ផ្លូវលេខ១២៧ ភូមិកម្មករ សង្កាត់ស្វាយប៉ោ ក្រុងបាត់ដំបង ខេត្តបាត់ដំបង',
    },

    {
      cityCode: 'BTB',
      name: 'TC Moung Russie',
      latitude: 12.777340,
      longitude: 103.446190,
      address: 'ផ្លូវជាតិលេខ ៥ ភូមិកន្សៃបន្ទាយ ឃុំមោង ស្រុកមោងឬស្សី ខេត្តបាត់ដំបង',
    },

    {
      cityCode: 'BTB',
      name: 'TC Thma Kol',
      latitude: 13.264730,
      longitude: 103.087900,
      address: 'ភូមិថ្មគោលត្បូង ឃុំតាពូង ស្រុកថ្មគោល ខេត្តបាត់ដំបង',
    },

    {
      cityCode: 'BTB', // Battambang
      name: 'Phnom Proek',
      latitude: 13.312870,
      longitude: 102.362990,
      address: 'ឃុំភ្នំព្រឹក ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង',
    },

    // ======================================================
    // Pailin
    // ======================================================

    {
      cityCode: 'PAI',
      name: 'TC PAILIN',
      latitude: 12.855220,
      longitude: 102.611560,
      address: 'ភូមិវត្ត សង្កាត់ប៉ៃលិន ក្រុងប៉ៃលិន ខេត្តប៉ៃលិន',
    },

    {
      cityCode: 'PAI', // Pailin
      name: 'Prum',
      latitude: 12.936670,
      longitude: 102.509850,
      address: 'ភូមិផ្សារព្រំជើង ឃុំស្ទឹងកាច់ ស្រុកសាលាក្រៅ ខេត្តប៉ៃលិន',
    },

    // ======================================================
    // Banteay Meanchey
    // ======================================================

    {
      cityCode: 'SRS',
      name: 'TC Banteay Mean Chey',
      latitude: 13.586370,
      longitude: 102.973870,
      address: 'ភូមិ 3, សង្កាត់ ព្រះពន្លារ, ក្រុង សេរីសោភ័ណ្ឌ ខេត្តបន្ទាយមានជ័យ',
    },

    {
      cityCode: 'SRS',
      name: 'TC Preah Neth Preah',
      latitude: 13.623710,
      longitude: 103.180310,
      address: 'ភូមិ ចក្រី, ឃុំ ជប់វ៉ារី, ស្រុក ព្រះនេត្រព្រះ ខេត្តបន្ទាយមានជ័យ',
    },

    {
      cityCode: 'SRS',
      name: 'TC Mongkol Borei',
      latitude: 13.538030,
      longitude: 103.022800,
      address: 'ភូមិ ឬស្សីស្រុក, ឃុំ ឬស្សីស្រុក, ស្រុក មង្គលបុរី ខេត្តបន្ទាយមានជ័យ',
    },

    {
      cityCode: 'SRS',
      name: 'TC Poipet',
      latitude: 13.643410,
      longitude: 102.576760,
      address: 'ភូមិ គីឡូលេខ 9, សង្កាត់ បាឡេឡៃ, ក្រុង ប៉ោយប៉ែត ខេត្តបន្ទាយមានជ័យ',
    },

    // ======================================================
    // Prey Veng
    // ======================================================

    {
      cityCode: 'PVG',
      name: 'TC PREY VENG',
      latitude: 11.483242,
      longitude: 105.324097,
      address: 'ផ្លូវ ជាតិលេខ 1, ភូមិ លេខ3, សង្កាត់ កំពង់លាវ, ក្រុង ព្រៃវែង ខេត្តព្រៃវែង',
    },

    {
      cityCode: 'PVG',
      name: 'TC Neak Loeung',
      latitude: 11.260220,
      longitude: 105.293610,
      address: 'ផ្លូវ ជាតិលេខ 1, ភូមិ 1, ឃុំ ព្រែកខ្សាយ ខ, ស្រុក ពាមរក៍ ខេត្តព្រៃវែង',
    },

    // ======================================================
    // Svay Rieng
    // ======================================================

    {
      cityCode: 'SVR',
      name: 'TC Svay Rieng',
      latitude: 11.081210,
      longitude: 105.804600,
      address: 'ផ្លូវលេខ៣១៤ ភូមិមេភ្លីង សង្កាត់ស្វាយរៀង ក្រុងស្វាយរៀង ខេត្តស្វាយរៀង',
    },

    {
      cityCode: 'SVR',
      name: 'TC BAVET',
      latitude: 11.071340,
      longitude: 106.158200,
      address: 'ផ្លូវជាតិលេខ១ ភូមិបាវិតកណ្តាល សង្កាត់បាវិត ក្រុងបាវិត ខេត្តស្វាយរៀង',
    },

    {
      cityCode: 'SVR', // Svay Rieng
      name: 'Romeas Hek',
      latitude: 11.411760,
      longitude: 105.795880,
      address: 'ឃុំកំពង់ត្រាច ស្រុករមាសហែក ខេត្តស្វាយរៀង',
    },
    
    // ======================================================
    // Kampong Thom
    // ======================================================

    {
      cityCode: 'STS',
      name: 'TC KOMPONG THOM',
      latitude: 12.710836,
      longitude: 104.888541,
      address: 'ភូមិកំពង់ធំ សង្កាត់កំពង់ធំ ក្រុងស្ទឹងសែន ខេត្តកំពង់ធំ',
    },

    {
      cityCode: 'STS',
      name: 'TC Kampong Thma',
      latitude: 12.501870,
      longitude: 105.123400,
      address: 'ផ្លូវជាតិលេខ៦ ភូមិកំពង់ថ្ម ឃុំកំពង់ថ្ម ស្រុកសន្ទុក ខេត្តកំពង់ធំ',
    },

    {
      cityCode: 'STS',
      name: 'TC Stourng',
      latitude: 12.948400,
      longitude: 104.564220,
      address: 'ភូមិត្នោត ឃុំកំពង់ចិនជើង ស្រុកស្ទោង ខេត្តកំពង់ធំ',
    },

    // ======================================================
    // Preah Vihear
    // ======================================================

    {
      cityCode: 'PVH',
      name: 'TC Preah Vihear',
      latitude: 13.813708,
      longitude: 104.980322,
      address: 'ផ្លូវម្លូព្រៃ ភូមិកណ្ដាល សង្កាត់កំពង់ប្រណាក ក្រុងព្រះវិហារ ខេត្តព្រះវិហារ',
    },

    // ======================================================
    // Kampong Cham
    // ======================================================

    {
      cityCode: 'KPC',
      name: 'TC KOMPONG CHAM',
      latitude: 11.995190,
      longitude: 105.462210,
      address: 'ភូមិ១៤ ផ្លូវខេមរភូមិន្ទ សង្កាត់កំពង់ចាម ក្រុងកំពង់ចាម',
    },

    {
      cityCode: 'KPC',
      name: 'TC Skun',
      latitude: 12.054104,
      longitude: 105.062516,
      address: 'ភូមិ តាសែន, ឃុំ សូទិព្វ, ស្រុក ជើងព្រៃ ខេត្តកំពង់ចាម',
    },

    {
      cityCode: 'KPC',
      name: 'TC Prey Totoeng',
      latitude: 12.057390,
      longitude: 105.254770,
      address: 'ភូមិព្រៃជេវៀន ឃុំព្រៃទទឹង ស្រុកព្រៃឈរ ខេត្តកំពង់ចាម',
    },

    // ======================================================
    // Tbong Khmum
    // ======================================================

    {
      cityCode: 'SNG',
      name: 'TC Suong',
      latitude: 11.905750,
      longitude: 105.657390,
      address: 'ភូមិសួងលិច សង្កាត់សួង ក្រុងសួង ខេត្តត្បូងឃ្មុំ',
    },

    {
      cityCode: 'SNG',
      name: 'Ponhea Kraek',
      latitude: 11.772883,
      longitude: 105.933138,
      address: 'ភូមិពើក, ឃុំក្រែក, ស្រុកពញាក្រែក, ខេត្តត្បូងឃ្មុំ',
    },

    {
      cityCode: 'SNG',
      name: 'TC Memot',
      latitude: 11.828290,
      longitude: 106.170460,
      address: 'ផ្លូវជាតិលេខ ៧ ឃុំមេមត់ ស្រុកមេមត់ ខេត្តត្បូងឃ្មុំ',
    },

    {
      cityCode: 'SNG', // Suong
      name: 'Trapeang Phlong',
      latitude: 11.674741,
      longitude: 105.964025,
      address: 'ភូមិតាប៉ាង,ឃុំត្រពាំងផ្លុង, ស្រុកពញាក្រែក , ខេត្តត្បូងឃ្មុំ',
    },

  ];

  // ========================================================
  // Seed sites
  // ========================================================

  for (const siteData of sites) {

    // =======================================================
    // 1. Find city
    // =======================================================

    const city = await cityRepository.findOne({
      where: {
        code: siteData.cityCode,
      },
      relations: {
        province: true,
      },
      select: {
        id: true,
        code: true,
        province: {
          id: true,
          code: true,
        },
      },
    });

    if (!city) {
      console.warn(
        `Skipping site "${siteData.name}". City with code "${siteData.cityCode}" not found.`,
      );

      continue;
    }

    // =======================================================
    // 2. Check existing site
    // =======================================================

    const existing = await siteRepository.findOne({
        where: {
          name: siteData.name,
        },
      });

    if (existing) {
      continue;
    }

    // =======================================================
    // 3. Generate hierarchy code
    // =======================================================

    const parentCode = `KH.${city.province.code}.${city.code}`;

    let sequence = await sequenceRepository.findOne({
        where: {
          parentCode,
          prefix: 'POP',
        },
      });

    if (!sequence) {
      sequence = sequenceRepository.create({
          parentCode,
          prefix: 'POP',
          lastNumber: 0,
        });
    }

    sequence.lastNumber += 1;

    await sequenceRepository.save(sequence);

    const number = sequence.lastNumber.toString().padStart(2, '0');

    const code = `${parentCode}.POP${number}`;

    // =======================================================
    // 4. Create Site
    // =======================================================

    const site = siteRepository.create({
        city,
        code,
        name: siteData.name,
        address: siteData.address,
        elevation: null,
        description: 'TC POP site.',
        geometry: {
          type: 'Point',
          coordinates: [
            siteData.longitude,
            siteData.latitude,
          ],
        },
      });

    await siteRepository.save(site);
  }

  console.log('Sites seeded.');
}