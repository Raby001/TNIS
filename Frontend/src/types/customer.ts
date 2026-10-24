export interface Customer {
    id: string
    customerCode: string
    name: string
    phone: string
    email: string
    address: string
    description?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface CustomerFormData {
    name: string
    phone: string
    email: string
    address: string
    description: string
}

export interface CreateCustomerRequest {
    name: string
    phone: string
    email: string
    address: string
    description?: string
}