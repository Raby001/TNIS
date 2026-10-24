import type { CreateAssetRequest } from './asset'

export interface CustomerFormData {
    name: string
    phone: string
    email: string
    address: string
    description: string
}

export type OnuCustomerMode =
    | 'existing'
    | 'new'

export interface OnuFormData {
    macAddressONU: string
    macAddressRouter: string
    ponType: string

    downloadSpeedMbps: number | null
    uploadSpeedMbps: number | null
    dataAllowanceGb: number | null

    customerMode: OnuCustomerMode
    customerId: string | null
    customer: CustomerFormData
}

export interface CreateOnuRequest
    extends CreateAssetRequest {
    macAddressONU?: string
    macAddressRouter?: string
    ponType?: string

    downloadSpeedMbps?: number
    uploadSpeedMbps?: number
    dataAllowanceGb?: number

    customerId?: string
    customer?: CustomerFormData
}

export interface OnuAssetData {
    macAddressONU: string | null
    macAddressRouter: string | null
    ponType: string | null

    downloadSpeedMbps: number | null
    uploadSpeedMbps: number | null
    dataAllowanceGb: number | null

    customerId: string | null
    customerCode: string | null
    customerName: string | null
    customerPhone: string | null
}

export interface UpdateOnuRequest
    extends Partial<
        Omit<CreateAssetRequest, 'assetTypeId' | 'siteId'>
    > {
    macAddressONU?: string
    macAddressRouter?: string
    ponType?: string

    downloadSpeedMbps?: number
    uploadSpeedMbps?: number
    dataAllowanceGb?: number

    customerId?: string | null
}