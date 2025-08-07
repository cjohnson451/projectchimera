import React, { useState, useMemo, HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { ChevronUp, ChevronDown, ChevronsUpDown, Check } from 'lucide-react'
import Button from './Button'

export interface Column<T = any> {
  key: string
  title: string
  dataIndex?: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

export interface TableProps<T = any> extends Omit<HTMLAttributes<HTMLTableElement>, 'onChange'> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
    showSizeChanger?: boolean
    pageSizeOptions?: number[]
  }
  rowSelection?: {
    selectedRowKeys: (string | number)[]
    onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void
    getCheckboxProps?: (record: T) => { disabled?: boolean }
  }
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>
  rowKey?: string | ((record: T) => string | number)
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  emptyText?: React.ReactNode
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      columns,
      data,
      loading = false,
      pagination,
      rowSelection,
      onRow,
      rowKey = 'id',
      size = 'md',
      bordered = false,
      striped = false,
      hoverable = true,
      emptyText = 'No data',
      sortBy,
      sortOrder,
      onSort,
      className,
      ...props
    },
    ref
  ) => {
    const [internalSortBy, setInternalSortBy] = useState<string>('')
    const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>('asc')

    const currentSortBy = sortBy || internalSortBy
    const currentSortOrder = sortOrder || internalSortOrder

    const getRowKey = (record: any, index: number): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return record[rowKey] || index
    }

    const handleSort = (columnKey: string) => {
      let newSortOrder: 'asc' | 'desc' = 'asc'
      
      if (currentSortBy === columnKey) {
        newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'
      }

      if (onSort) {
        onSort(columnKey, newSortOrder)
      } else {
        setInternalSortBy(columnKey)
        setInternalSortOrder(newSortOrder)
      }
    }

    const sortedData = useMemo(() => {
      if (!currentSortBy) return data

      const column = columns.find(col => col.key === currentSortBy)
      if (!column || !column.sortable) return data

      return [...data].sort((a, b) => {
        const aValue = column.dataIndex ? a[column.dataIndex] : a[column.key]
        const bValue = column.dataIndex ? b[column.dataIndex] : b[column.key]

        if (aValue === bValue) return 0

        const comparison = aValue < bValue ? -1 : 1
        return currentSortOrder === 'asc' ? comparison : -comparison
      })
    }, [data, columns, currentSortBy, currentSortOrder])

    const paginatedData = useMemo(() => {
      if (!pagination) return sortedData

      const start = (pagination.current - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return sortedData.slice(start, end)
    }, [sortedData, pagination])

    const handleSelectAll = (checked: boolean) => {
      if (!rowSelection) return

      if (checked) {
        const allKeys = paginatedData.map((record, index) => getRowKey(record, index))
        const selectableKeys = allKeys.filter((key, index) => {
          const record = paginatedData[index]
          const checkboxProps = rowSelection.getCheckboxProps?.(record)
          return !checkboxProps?.disabled
        })
        rowSelection.onChange(selectableKeys, paginatedData.filter((_, index) => 
          selectableKeys.includes(getRowKey(paginatedData[index], index))
        ))
      } else {
        rowSelection.onChange([], [])
      }
    }

    const handleSelectRow = (record: any, index: number, checked: boolean) => {
      if (!rowSelection) return

      const key = getRowKey(record, index)
      let newSelectedKeys = [...rowSelection.selectedRowKeys]
      let newSelectedRows = [...data.filter((item, idx) => 
        rowSelection.selectedRowKeys.includes(getRowKey(item, idx))
      )]

      if (checked) {
        newSelectedKeys.push(key)
        newSelectedRows.push(record)
      } else {
        newSelectedKeys = newSelectedKeys.filter(k => k !== key)
        newSelectedRows = newSelectedRows.filter(item => getRowKey(item, 0) !== key)
      }

      rowSelection.onChange(newSelectedKeys, newSelectedRows)
    }

    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    const cellPaddingClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    }

    if (loading) {
      return (
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-12 bg-neutral-200 rounded mb-2"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded mb-1"></div>
            ))}
          </div>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="w-full border border-neutral-200 rounded-lg">
          <table className={clsx('table w-full', className)} ref={ref} {...props}>
            <thead className="table-header">
              <tr>
                {rowSelection && (
                  <th className={clsx('table-header-cell', cellPaddingClasses[size])}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      disabled
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      'table-header-cell',
                      cellPaddingClasses[size],
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <div className="empty-state py-16">
            <div className="empty-state-title">No data available</div>
            <div className="empty-state-description">{emptyText}</div>
          </div>
        </div>
      )
    }

    const allSelectableCount = paginatedData.filter((record, index) => {
      const checkboxProps = rowSelection?.getCheckboxProps?.(record)
      return !checkboxProps?.disabled
    }).length

    const selectedCount = paginatedData.filter((record, index) => 
      rowSelection?.selectedRowKeys.includes(getRowKey(record, index))
    ).length

    const isAllSelected = allSelectableCount > 0 && selectedCount === allSelectableCount
    const isIndeterminate = selectedCount > 0 && selectedCount < allSelectableCount

    return (
      <div className="w-full">
        <div className={clsx('overflow-x-auto', bordered && 'border border-neutral-200 rounded-lg')}>
          <table
            ref={ref}
            className={clsx(
              'table w-full',
              sizeClasses[size],
              className
            )}
            {...props}
          >
            <thead className="table-header">
              <tr>
                {rowSelection && (
                  <th className={clsx('table-header-cell', cellPaddingClasses[size])}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(
                      'table-header-cell',
                      cellPaddingClasses[size],
                      column.sortable && 'cursor-pointer select-none hover:bg-neutral-100',
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={column.sortable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSort(column.key)
                      }
                    } : undefined}
                    aria-sort={
                      currentSortBy === column.key
                        ? currentSortOrder === 'asc' ? 'ascending' : 'descending'
                        : column.sortable ? 'none' : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="flex-shrink-0">
                          {currentSortBy === column.key ? (
                            currentSortOrder === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record, index) => {
                const key = getRowKey(record, index)
                const isSelected = rowSelection?.selectedRowKeys.includes(key) || false
                const rowProps = onRow?.(record, index) || {}
                const checkboxProps = rowSelection?.getCheckboxProps?.(record) || {}

                return (
                  <tr
                    key={key}
                    className={clsx(
                      'table-row',
                      isSelected && 'table-row-selected',
                      striped && index % 2 === 1 && 'bg-neutral-50',
                      hoverable && 'hover:bg-neutral-50'
                    )}
                    {...rowProps}
                  >
                    {rowSelection && (
                      <td className={clsx('table-cell', cellPaddingClasses[size])}>
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          checked={isSelected}
                          disabled={checkboxProps.disabled}
                          onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : record[column.key]
                      const content = column.render ? column.render(value, record, index) : value

                      return (
                        <td
                          key={column.key}
                          className={clsx(
                            'table-cell',
                            cellPaddingClasses[size],
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {content}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-neutral-500">
              Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current <= 1}
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-700">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

Table.displayName = 'Table'

export default Table
