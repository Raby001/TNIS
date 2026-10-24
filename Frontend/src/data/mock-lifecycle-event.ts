import type { LifecycleEventType } from '../utils/lifecycleEvents'

export interface LifecycleEvent {
  id: string
  type: LifecycleEventType
  description: string
  loggedBy: string
  date: string // ISO date
}

export const mockLifecycleEvents: Record<string, LifecycleEvent[]> = {
  'ast-001': [
    {
      id: 'evt-1',
      type: 'installed',
      description: 'Initial installation at TC Exchange Central.',
      loggedBy: 'Dara Kim',
      date: '2025-12-10',
    },
    {
      id: 'evt-2',
      type: 'inspection',
      description: 'Routine quarterly inspection — no issues found.',
      loggedBy: 'Dara Kim',
      date: '2026-03-15',
    },
  ],
  'ast-003': [
    {
      id: 'evt-3',
      type: 'installed',
      description: 'Installed as part of the 2017 metro ring build.',
      loggedBy: 'Bopha Sok',
      date: '2024-04-02',
    },
    {
      id: 'evt-4',
      type: 'fault_reported',
      description: 'Nearby construction work severed a feeder cable, damaging the shelf.',
      loggedBy: 'Dara Kim',
      date: '2026-08-10',
    },
  ],
}