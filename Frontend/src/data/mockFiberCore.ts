export interface FiberCore {
  id: string
  fiber_cable_id: string
  core_number: number
  color: string
  status_id: string
  damage_reason?: string
}

export const CORE_STATUS_IDS = {
  spare: 'sta-101', // green
  inUse: 'sta-102', // blue
  damaged: 'sta-103', // red
}

const FIBER_COLORS: string[] = ['Blue', 'Orange', 'Green', 'Brown', 'Slate', 'White', 'Red', 'Black', 'Yellow', 'Violet', 'Rose', 'Aqua']

export const mockFiberCores: Record<string, FiberCore[]> = {
  'ast-004': Array.from({ length: 12 }, (_, i) => ({
    id: `core-${i + 1}`,
    fiber_cable_id: 'ast-004',
    core_number: i + 1,
    color: FIBER_COLORS[i] ?? 'Blue',
    status_id: i < 5 ? CORE_STATUS_IDS.inUse : i === 5 ? CORE_STATUS_IDS.damaged : CORE_STATUS_IDS.spare,
    damage_reason: i === 5 ? 'Nicked during nearby construction work; signal loss detected during inspection.' : undefined,
  })),
}