import React, { useState, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  sortable?: boolean
  onRowClick?: (item: T, index: number) => void
  selectedRows?: Set<number>
  onRowSelect?: (index: number, selected: boolean) => void
  selectAll?: boolean
  onSelectAll?: (selected: boolean) => void
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
  clickable?: boolean
}
export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
  numeric?: boolean
}

type SortDirection = 'asc' | 'desc' | null

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  hoverable = true,
  compact = false,
  sortable = true,
  onRowClick,
  selectedRows,
  onRowSelect,
  selectAll,
  onSelectAll,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortColumn)
      let aValue = column?.accessor ? column.accessor(a) : a[sortColumn]
      let bValue = column?.accessor ? column.accessor(b) : b[sortColumn]

      // Handle null/undefined values
      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      // Convert to string for comparison if not already
      if (typeof aValue !== 'string' && typeof aValue !== 'number') {
        aValue = String(aValue)
      }
      if (typeof bValue !== 'string' && typeof bValue !== 'number') {
        bValue = String(bValue)
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [data, sortColumn, sortDirection, columns])

  const handleSort = (columnKey: string) => {
    if (!sortable) return

    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return null

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        return <ChevronUp className="h-4 w-4" />
      } else if (sortDirection === 'desc') {
        return <ChevronDown className="h-4 w-4" />
      }
    }
    return <ChevronsUpDown className="h-4 w-4 opacity-50" />
  }

  const handleRowSelect = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    onRowSelect?.(index, event.target.checked)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked)
  }

  const isAllSelected = selectedRows && selectedRows.size === data.length && data.length > 0
  const isIndeterminate = selectedRows && selectedRows.size > 0 && selectedRows.size < data.length

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="financial-table w-full">
          <TableHeader>
            <TableRow>
              {(selectedRows !== undefined || selectAll !== undefined) && (
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !!isIndeterminate
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Select all rows"
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  align={column.align}
                  className={cn(
                    'table-header-cell',
                    column.sortable && sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {getSortIcon(String(column.key))}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectedRows !== undefined ? 1 : 0)}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner-md" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectedRows !== undefined ? 1 : 0)}
                  className="text-center py-8 text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow
                  key={index}
                  selected={selectedRows?.has(index)}
                  clickable={!!onRowClick}
                  className={cn(
                    striped && index % 2 === 1 && 'bg-gray-50',
                    hoverable && 'hover:bg-gray-50',
                    compact && 'py-2',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {selectedRows !== undefined && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => handleRowSelect(index, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      align={column.align}
                      numeric={column.align === 'right'}
                      className={column.className}
                    >
                      {column.accessor 
                        ? column.accessor(item)
                        : item[column.key as keyof T]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  )
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('table-header', className)} {...props} />
  )
)

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
  )
)

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'table-row',
        selected && 'table-row-selected',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    />
  )
)

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', numeric, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'table-cell',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        numeric && 'table-cell-numeric',
        className
      )}
      {...props}
    />
  )
)

Table.displayName = 'Table'
TableHeader.displayName = 'TableHeader'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableCell }
