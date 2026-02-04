'use client'

import React from 'react'
import { Card } from './card'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './advanced-table'

interface ActivityItem {
  id: string
  type: 'upload' | 'impute' | 'partial' | 'update'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'error'
}

const activityTypeColors = {
  upload: 'bg-orange-100 text-orange-800',
  impute: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  update: 'bg-purple-100 text-purple-800',
}

const statusColors = {
  success: 'text-green-600',
  pending: 'text-yellow-600',
  error: 'text-red-600',
}

const statusIcons = {
  success: '✓',
  pending: '⏳',
  error: '✕',
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No recent activity</p>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              {idx < items.length - 1 && (
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      item.status === 'success'
                        ? 'bg-green-600'
                        : item.status === 'error'
                        ? 'bg-red-600'
                        : 'bg-yellow-600'
                    }`}
                  >
                    {statusIcons[item.status]}
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200 dark:bg-slate-700 mt-2" />
                </div>
              )}
              {idx === items.length - 1 && (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    item.status === 'success'
                      ? 'bg-green-600'
                      : item.status === 'error'
                      ? 'bg-red-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {statusIcons[item.status]}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${activityTypeColors[item.type]}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-2">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

interface MetricsGridItem {
  id: string
  title: string
  value: string | number
  unit?: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const metricsColorClasses = {
  blue: 'border-l-4 border-attijari-orange bg-orange-50 dark:bg-orange-950/30 dark:border-orange-600',
  green: 'border-l-4 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/30',
  yellow: 'border-l-4 border-yellow-600 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  red: 'border-l-4 border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/30',
  purple: 'border-l-4 border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/30',
}

export function MetricsGrid({ items }: { items: MetricsGridItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.id} className={`p-6 ${metricsColorClasses[item.color]}`}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
            {item.unit && <span className="text-sm text-gray-600 dark:text-gray-400">{item.unit}</span>}
          </div>
        </Card>
      ))}
    </div>
  )
}
