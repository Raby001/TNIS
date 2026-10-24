export interface CableEndpoint {
  id: string
  fiber_cable_id: string
  endpoint_role: 'A' | 'B'
  site_name: string
}

export const mockCableEndpoints: Record<string, CableEndpoint[]> = {
  'ast-004': [
    { id: 'ce-1', fiber_cable_id: 'ast-004', endpoint_role: 'A', site_name: 'TC-Exchange Central' },
    { id: 'ce-2', fiber_cable_id: 'ast-004', endpoint_role: 'B', site_name: 'TC-Exchange CP-P5' },
  ],
}