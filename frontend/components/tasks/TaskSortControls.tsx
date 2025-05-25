'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SortField, SortOrder, SortConfig } from '@/lib/types';

interface TaskSortControlsProps {
  sortConfig: SortConfig;
  onChange: (config: SortConfig) => void;
  className?: string;
}

const sortOptions = [
  { value: 'created_at' as SortField, label: 'Date Created', icon: '📅' },
  { value: 'updated_at' as SortField, label: 'Last Updated', icon: '🔄' },
  { value: 'due_date' as SortField, label: 'Due Date', icon: '⏰' },
  { value: 'priority' as SortField, label: 'Priority', icon: '🚨' },
  { value: 'title' as SortField, label: 'Alphabetical', icon: '🔤' },
  { value: 'completed' as SortField, label: 'Status', icon: '✅' },
];

// Issue #22: Task sorting controls
export function TaskSortControls({ sortConfig, onChange, className = "" }: TaskSortControlsProps) {
  const currentSort = sortOptions.find(opt => opt.value === sortConfig.field);
  
  const handleSortFieldChange = (field: SortField) => {
    onChange({ field, order: sortConfig.order });
  };
  
  const toggleSortOrder = () => {
    onChange({
      field: sortConfig.field,
      order: sortConfig.order === 'asc' ? 'desc' : 'asc'
    });
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50">
          <ArrowsUpDownIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentSort?.icon} {currentSort?.label}
          </span>
          <span className="sm:hidden">{currentSort?.icon}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Menu.Button>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              {sortOptions.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      onClick={() => handleSortFieldChange(option.value)}
                    >
                      <span className="mr-3">{option.icon}</span>
                      {option.label}
                      {sortConfig.field === option.value && (
                        <CheckIcon className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      
      {/* Order toggle button */}
      <button
        onClick={toggleSortOrder}
        className="p-2 hover:bg-gray-100 rounded text-gray-600"
        title={sortConfig.order === 'asc' ? 'Sort descending' : 'Sort ascending'}
      >
        {sortConfig.order === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}