export const MAP_FILTER_TYPES = [
    'SITE',
    'TOWER',
    'FIBER_CABLE',
    'CLOSURE',
    'NAP',
    'ONU',
    'MANHOLE',
    'HANDHOLE',
    'POLE',
    'OCC',
    'LCP'
] as const

export type MapFilterType =
    typeof MAP_FILTER_TYPES[number]

export type MapFilterField =
    | 'provinceId'
    | 'cityId'
    | 'siteId'
    | 'statusId'
    | 'coreCountId'
    | 'segmentTypeId'
    | 'cableTypeId'
    | 'installationMethodId'
    | 'customerId'

export interface FilterFieldConfig {
    key: MapFilterField
    label: string
}

export const GENERAL_FILTER_FIELDS: FilterFieldConfig[] = [
    {
        key: 'provinceId',
        label: 'Province',
    },
    {
        key: 'cityId',
        label: 'City',
    },
    {
        key: 'statusId',
        label: 'Status',
    },
]

export const SPECIFIC_FILTER_FIELDS: Record<
    MapFilterType,
    FilterFieldConfig[]
> = {
    SITE: [
        {
            key: 'siteId',
            label: 'Site',
        },
    ],

    TOWER: [],

    FIBER_CABLE: [
        {
            key: 'coreCountId',
            label: 'Core Count',
        },
        {
            key: 'segmentTypeId',
            label: 'Segment Type',
        },
        {
            key: 'cableTypeId',
            label: 'Cable Type',
        },
        {
            key: 'installationMethodId',
            label: 'Installation Method',
        },
    ],

    CLOSURE: [],

    NAP: [],

    ONU: [
        {
            key: 'customerId',
            label: 'Customer',
        },
    ],

    MANHOLE: [],

    HANDHOLE: [],

    POLE: [],

    OCC: [],
    LCP: []
}