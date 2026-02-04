'use client'

import React, { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Card } from './card'
import { Search, X, Filter } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  value: string
}

interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, string[]>) => void
  filters: {
    name: string
    options: FilterOption[]
  }[]
  searchPlaceholder?: string
}

export function AdvancedFilter({
  onFilterChange,
  filters,
  searchPlaceholder = 'Search...',
}: AdvancedFilterProps) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [showMore, setShowMore] = useState(false)

  const handleFilterToggle = (filterName: string, value: string) => {
    const current = activeFilters[filterName] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    const newFilters = {
      ...activeFilters,
      [filterName]: updated,
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearAll = () => {
    setActiveFilters({})
    setSearch('')
    onFilterChange({})
  }

  const activeFilterCount = Object.values(activeFilters).flat().length

  return (
    <Card className="p-6 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Pills */}
        {filters.length > 0 && (
          <div className="space-y-3">
            {filters.slice(0, showMore ? filters.length : 2).map((filter) => (
              <div key={filter.name}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{filter.name}</p>
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option) => {
                    const isActive = (activeFilters[filter.name] || []).includes(option.value)
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleFilterToggle(filter.name, option.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                          isActive
                            ? 'bg-attijari-orange text-white'
                            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {filters.length > 2 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-sm text-attijari-orange font-medium hover:underline"
              >
                {showMore ? 'Show Less' : 'Show More Filters'}
              </button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-300 dark:border-slate-600">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active filters: <span className="font-semibold">{activeFilterCount}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="ml-auto text-attijari-orange hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  trend?: string
}

export function StatCard({ title, value, icon, bgColor, textColor, trend }: StatCardProps) {
  return (
    <Card className={`p-6 ${bgColor} dark:bg-slate-800 border-gray-200 dark:border-slate-700`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          {trend && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bgColor === 'bg-orange-50' ? 'bg-orange-100 dark:bg-orange-950/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
