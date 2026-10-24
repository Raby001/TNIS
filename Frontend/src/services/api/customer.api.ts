import api from './api'

import type {
    Customer,
    CreateCustomerRequest,
} from '@/types/customer'

export const customerApi = {
    async searchCustomers(
        search: string,
    ): Promise<Customer[]> {
        const { data } = await api.get<Customer[]>(
            '/customers/search',
            {
                params: {
                    search,
                },
            },
        )

        return data ?? []
    },

    async createCustomer(
        data: CreateCustomerRequest,
    ): Promise<Customer> {
        const response =
            await api.post<Customer>(
                '/customers',
                data,
            )

        return response.data
    },
}