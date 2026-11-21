import type {
    CableDetailResponse,
    CreateFiberCableRequest,
    FiberCable,
    FiberCableConnection,
    CreateFiberCableConnectionRequest,
    UpdateFiberCableRequest,
} from '@/types/cable'
import { api } from './api'

export const fiberCableApi = {
    create(data: CreateFiberCableRequest) {
        const { statusId, ...payload } = data
        return api.post<FiberCable>(
            '/fiber-cables',
            {
                ...payload,
                lifecycleStatusId: statusId,
            },
        )
    },

    update(id: string, data: UpdateFiberCableRequest) {
        const { statusId, ...payload } = data
        return api.patch(`/fiber-cables/${id}`, {
            ...payload,
            ...(statusId ? { lifecycleStatusId: statusId } : {}),
        })
    },

    async delete(id: string) {
        return api.delete(`/fiber-cables/${id}`)
    },

    async getDetail(
        id: string,
    ): Promise<CableDetailResponse> {
        const response = await api.get<CableDetailResponse>(
            `/fiber-cables/${id}/connections`,
        )
        return response.data
    },

    listConnections(fiberCableId: string) {
        return api.get<FiberCableConnection[]>(
            `/fiber-cable-connections/fiber-cable/${fiberCableId}`,
        )
    },

    createConnection(data: CreateFiberCableConnectionRequest) {
        return api.post('/fiber-cable-connections', data)
    },

    disconnectConnection(id: string) {
        return api.patch(`/fiber-cable-connections/${id}/disconnect`)
    },
}