'use client'

import React from 'react'
import { Card } from './card'

interface AdvancedStatProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  subtext?: string
}

const colorClasses = {
  blue: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/30',
  green: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/30',
  yellow: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/30',
  red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30',
  purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30',
}

const iconColorClasses = {
  blue: 'text-attijari-orange dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
  green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50',
  yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50',
  red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50',
}

const trendColorClasses = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  stable: 'text-gray-600 dark:text-gray-400',
}

export function AdvancedStat({
  label,
  value,
  icon,
  color = 'blue',
  trend,
  subtext,
}: AdvancedStatProps) {
  return (
    <Card className={`p-6 border ${colorClasses[color]}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              {trend && (
                <span className={`text-sm font-semibold ${trendColorClasses[trend.direction]}`}>
                  {trend.direction === 'up' && '↑'} {trend.direction === 'down' && '↓'}{' '}
                  {trend.percentage}%
                </span>
              )}
            </div>
          </div>

          {icon && (
            <div className={`p-3 rounded-lg ${iconColorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>

        {subtext && <p className="text-xs text-gray-600 dark:text-gray-400">{subtext}</p>}
      </div>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  items: Array<{
    label: string
    value: number
    max: number
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }>
}

const barColorClasses = {
  blue: 'bg-attijari-orange',
  green: 'bg-green-600',
  yellow: 'bg-yellow-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
}

export function ProgressCard({ title, items }: ProgressCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>
      <div className="space-y-6">
        {items.map((item) => {
          const percentage = (item.value / item.max) * 100
          const color = item.color || 'blue'
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.value} / {item.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`${barColorClasses[color]} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
