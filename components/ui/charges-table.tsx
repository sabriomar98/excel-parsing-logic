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
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { Card } from './card'
import { cn } from '@/lib/utils'

interface ChargesTableProps<TData> {
    data: TData[]
    collaborators?: any[]
    selectedCollaborators?: Set<string>
    onSelectedChange?: (selected: Set<string>) => void
    onImputationChange?: (collaboratorId: string, phaseKey: string, value: number) => void
    title?: string
    description?: string
    showSelectAll?: boolean
    editable?: boolean
}

export function ChargesTable<TData extends Record<string, any>>({
    data,
    collaborators = [],
    selectedCollaborators = new Set(),
    onSelectedChange,
    onImputationChange,
    title = 'Chiffrage Prévisionnel',
    description,
    showSelectAll = true,
    editable = false,
}: ChargesTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [localSelected, setLocalSelected] = React.useState<Set<string>>(selectedCollaborators)

    // Phase columns configuration
    const phases = [
        { key: 'instr', label: 'Instr' },
        { key: 'cadr', label: 'Cadr' },
        { key: 'conc', label: 'Conc' },
        { key: 'admin', label: 'Admin' },
        { key: 'tech', label: 'Tech' },
        { key: 'dev', label: 'Dev' },
        { key: 'testU', label: 'Test U' },
        { key: 'testI', label: 'Test I' },
        { key: 'assistR', label: 'Assist R' },
        { key: 'deploy', label: 'Deploy' },
        { key: 'assistP', label: 'Assist P' },
    ]

    // Define columns
    const columns: ColumnDef<TData>[] = [
        // Checkbox column
        {
            id: 'select',
            header: () => (
                showSelectAll ? (
                    <input
                        type="checkbox"
                        onChange={(e) => {
                            if (e.target.checked) {
                                const allIds = new Set<string>(
                                    collaborators.map((c: any) => c.id as string)
                                )
                                setLocalSelected(allIds)
                                onSelectedChange?.(allIds)
                            } else {
                                const empty = new Set<string>()
                                setLocalSelected(empty)
                                onSelectedChange?.(empty)
                            }
                        }}
                        checked={localSelected.size === collaborators.length && collaborators.length > 0}
                        className="cursor-pointer"
                    />
                ) : null
            ),
            cell: ({ row }) => {
                const id = (row.original as any).id as string
                return (
                    <input
                        type="checkbox"
                        checked={localSelected.has(id)}
                        onChange={(e) => {
                            const newSelected = new Set(localSelected)
                            if (e.target.checked) {
                                newSelected.add(id)
                            } else {
                                newSelected.delete(id)
                            }
                            setLocalSelected(newSelected)
                            onSelectedChange?.(newSelected)
                        }}
                        className="cursor-pointer"
                    />
                )
            },
            size: 40,
        },
        // Name column
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{row.getValue('name')}</span>
            ),
        },
        // Phase columns
        ...phases.map((phase) => ({
            accessorKey: phase.key,
            header: phase.label,
            cell: ({ row }: any) => {
                const value = row.original[phase.key] || 0
                return (
                    editable ? (
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => {
                                const id = (row.original as any).id
                                onImputationChange?.(id, phase.key, parseFloat(e.target.value) || 0)
                            }}
                            className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                    ) : (
                        <span className="text-center block">{value}</span>
                    )
                )
            },
        } as ColumnDef<TData>)),
        // Total column
        {
            id: 'total',
            header: 'Total',
            cell: ({ row }: any) => {
                const total = phases.reduce((sum, phase) => {
                    return sum + (row.original[phase.key] || 0)
                }, 0)
                return (
                    <span className="font-bold text-gray-900 dark:text-gray-100">{total}</span>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            globalFilter,
        },
    })

    React.useEffect(() => {
        table.setPageSize(10)
    }, [table])

    return (
        <div className="w-full">
            {(title || description) && (
                <div className="mb-6">
                    {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
                    {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
                </div>
            )}

            {/* Search */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                    placeholder="Search collaborators..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="pl-10 max-w-sm"
                />
            </div>

            {/* Table */}
            <Card className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
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
                                            style={{
                                                width: header.getSize() !== 150 ? header.getSize() : 'auto',
                                            }}
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
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 text-right"
                                                style={{
                                                    width: cell.column.getSize() !== 150 ? cell.column.getSize() : 'auto',
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No collaborators found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* Footer with totals */}
                        {table.getRowModel().rows.length > 0 && (
                            <tfoot className="bg-gray-100 dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-600">
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">
                                        TOTAL
                                    </td>
                                    {phases.map((phase) => {
                                        const total = table.getRowModel().rows.reduce((sum, row) => {
                                            return sum + ((row.original as any)[phase.key] || 0)
                                        }, 0)
                                        return (
                                            <td
                                                key={phase.key}
                                                className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100"
                                            >
                                                {total}
                                            </td>
                                        )
                                    })}
                                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">
                                        {table.getRowModel().rows.reduce((sum, row) => {
                                            return (
                                                sum +
                                                phases.reduce((phaseSum, phase) => {
                                                    return phaseSum + ((row.original as any)[phase.key] || 0)
                                                }, 0)
                                            )
                                        }, 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length}
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
                            {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === table.getState().pagination.pageIndex ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => table.setPageIndex(page)}
                                    className="min-w-10"
                                >
                                    {page + 1}
                                </Button>
                            ))}
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
            )}
        </div>
    )
}
