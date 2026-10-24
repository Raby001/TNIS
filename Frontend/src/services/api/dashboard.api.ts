import api from './api'
import type { ActivityEntry, HealthRow, Metric, SystemHealthItem } from '@/types/dashboard'

export interface DashboardOverview {
  metrics: Metric[]
  activity: ActivityEntry[]
  healthRows: HealthRow[]
  systemHealth: SystemHealthItem[]
}

export const dashboardApi = {
  /** When backend is ready */
  getOverview() {
    return api.get<DashboardOverview>('/dashboard/overview')
  },
}