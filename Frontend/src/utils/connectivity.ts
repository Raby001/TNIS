export type ConnectivityKind = 'ports' | 'cores' | null
 
const PORT_BASED_TYPES = ['Router', 'Switch', 'OLT', 'DWDM']
const CORE_BASED_TYPES = ['Fiber Cable']
 
export function getConnectivityKind(assetTypeName: string | undefined): ConnectivityKind {
  if (!assetTypeName) return null
  if (PORT_BASED_TYPES.includes(assetTypeName)) return 'ports'
  if (CORE_BASED_TYPES.includes(assetTypeName)) return 'cores'
  return null
}