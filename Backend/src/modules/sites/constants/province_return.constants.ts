export const SITE_WITH_LOCATION_SELECT = {
  id: true,
  name: true,
  code: true,
  geometry: true,
  city: {
    id: true,
    name: true,
    code: true,
    province: {
      id: true,
      name: true,
      code: true,
    },
  },
};


export const CITY_WITH_PROVINCE_SELECT = {
  id: true,
  name: true,
  code: true,
  province: {
    id: true,
    name: true,
    code: true,
  },
};