import { CORE_STATUS_IDS } from './mockFiberCore'

export interface DevicePort {
  id: string
  device_id: string 
  name: string 
  slotLabel: string 
  cardLabel: string 
  port_type: string
  speed: string
  status_id: string
  connected_to?: string
  damage_reason?: string 
}

export const mockDevicePorts: Record<string, DevicePort[]> = {
  'ast-001': Array.from({ length: 8 }, (_, i) => ({
    id: `port-${i + 1}`,
    device_id: 'ast-001',
    name: `GE0/${i + 1}`,
    slotLabel: `Slot ${Math.floor(i / 4) + 1}`,
    cardLabel: '10GE Card',
    port_type: 'Ethernet',
    speed: '10G',
    status_id: i === 6 ? CORE_STATUS_IDS.damaged : i < 5 ? CORE_STATUS_IDS.inUse : CORE_STATUS_IDS.spare,
    connected_to: i < 5 ? 'Trunk Fiber - Central to CP-P5' : i === 6 ? 'DWDM Unit - CP-P5 Exchange' : undefined,
    damage_reason: i === 6 ? 'Port stopped negotiating link speed after a power fluctuation.' : undefined,
  })),
}