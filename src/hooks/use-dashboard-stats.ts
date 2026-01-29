import useSWR from 'swr'

export interface DashboardStatsResponse {
  counts: {
    products: number
    customers: number
    transactions: number
  }
  stats: {
    totalOrder: number
    totalReturn: number
    totalBilled: number
    totalReturned: number
  }
}

export function useDashboardStats() {
  return useSWR<DashboardStatsResponse>('/api/dashboard/stats')
}

export const DASHBOARD_STATS_KEY = '/api/dashboard/stats'
