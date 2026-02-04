'use client'

import * as React from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getPaginationRowModel,
    getFilteredRowModel,
    FilterFn,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageSize?: number
    searchableColumns?: string[]
    title?: string
    description?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageSize = 10,
    searchableColumns = [],
    title,
    description,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<any[]>([])
    const [globalFilter, setGlobalFilter] = React.useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    })

    React.useEffect(() => {
        table.setPageSize(pageSize)
    }, [pageSize, table])

    return (
        <div className="w-full">
            {(title || description) && (
                <div className="mb-6">
                    {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
                    {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
                </div>
            )}

            {searchableColumns.length > 0 && (
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Rechercher dans le tableau..."
                        value={globalFilter ?? ''}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-10 max-w-sm"
                    />
                </div>
            )}

            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={cn(
                                                'px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap',
                                                header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-slate-700'
                                            )}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <div className="flex items-center">
                                                        {header.column.getIsSorted() === 'desc' ? (
                                                            <ChevronDown className="h-4 w-4 text-attijari-orange" />
                                                        ) : header.column.getIsSorted() === 'asc' ? (
                                                            <ChevronUp className="h-4 w-4 text-attijari-orange" />
                                                        ) : (
                                                            <div className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'border-b border-gray-200 dark:border-slate-700 transition-colors',
                                            idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800',
                                            'hover:bg-orange-50 dark:hover:bg-orange-950/20'
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Aucun résultat trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} à{' '}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{' '}
                    sur {table.getFilteredRowModel().rows.length} résultats
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => {
                            const isActive = page === table.getState().pagination.pageIndex
                            const showPage =
                                page === 0 ||
                                page === table.getPageCount() - 1 ||
                                (page >= table.getState().pagination.pageIndex - 1 &&
                                    page <= table.getState().pagination.pageIndex + 1)

                            if (!showPage && page !== 0 && page !== table.getPageCount() - 1) {
                                return null
                            }

                            if (
                                page > 0 &&
                                page < table.getPageCount() - 1 &&
                                !showPage &&
                                page !== table.getState().pagination.pageIndex - 2
                            ) {
                                return <span key={page} className="px-2 text-gray-500 dark:text-gray-400">...</span>
                            }

                            return (
                                <Button
                                    key={page}
                                    variant={isActive ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => table.setPageIndex(page)}
                                    className="min-w-10"
                                >
                                    {page + 1}
                                </Button>
                            )
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
