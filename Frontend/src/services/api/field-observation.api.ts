import api from './api'
import type {
    ConvertFieldObservationPayload,
    CreateFieldObservationPayload
} from '@/types/field-observation'


export const fieldObservationApi = {
    create(
        payload: CreateFieldObservationPayload,
    ) {
        return api.post(
            '/field-observations',
            payload,
        )
    },

    convert(
        id: string,
        payload: ConvertFieldObservationPayload,
    ) {
        return api.post(
            `/field-observations/${id}/convert`,
            payload,
        )
    },

    cancel(id: string) {
        return api.post(
            `/field-observations/${id}/cancel`,
        )
    },
}