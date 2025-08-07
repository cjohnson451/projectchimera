import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }
  return value.toString()
}

export function getFinancialColor(value: number): string {
  if (value > 0) return 'text-bull-600'
  if (value < 0) return 'text-bear-600'
  return 'text-neutral-600'
}

export function getFinancialBgColor(value: number): string {
  if (value > 0) return 'bg-bull-50'
  if (value < 0) return 'bg-bear-50'
  return 'bg-neutral-50'
}

export function getRiskColor(risk: 'Low Risk' | 'Medium Risk' | 'High Risk'): string {
  switch (risk) {
    case 'Low Risk':
      return 'text-risk-low-600'
    case 'Medium Risk':
      return 'text-risk-medium-600'
    case 'High Risk':
      return 'text-risk-high-600'
    default:
      return 'text-gray-600'
  }
}

export function getRiskBadgeClass(risk: 'Low Risk' | 'Medium Risk' | 'High Risk'): string {
  switch (risk) {
    case 'Low Risk':
      return 'badge-risk-low'
    case 'Medium Risk':
      return 'badge-risk-medium'
    case 'High Risk':
      return 'badge-risk-high'
    default:
      return 'badge-neutral'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
