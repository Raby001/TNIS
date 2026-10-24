import api from './api'
import type {
  CreateSpliceClosureRequest,
  UpdateSpliceClosureRequest,
} from '@/types/splice-closure'

export const spliceClosureApi = {
  create(data: CreateSpliceClosureRequest) {
    return api.post('/splice-closures', data)
  },

  update(id: string, data: UpdateSpliceClosureRequest) {
    return api.patch(`/splice-closures/${id}`, data)
  },

  getById(id: string) {
    return api.get(`/splice-closures/${id}`)
  },
}