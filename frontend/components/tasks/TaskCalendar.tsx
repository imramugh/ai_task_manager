'use client';

import { useState } from 'react';
import { Task } from '@/lib/tasks';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';

interface TaskCalendarProps {
  tasks: Task[];
  onUpdate: () => void;
}

type ViewType = 'day' | 'week' | 'month' | 'year';

export default function TaskCalendar({ tasks, onUpdate }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-2">
            {(['day', 'week', 'month', 'year'] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewType === view
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewType === 'month' && (
        <div className="p-4">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                className={`bg-white p-2 min-h-[80px] ${
                  day ? 'hover:bg-gray-50' : ''
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium text-gray-900">
                      {day.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {getTasksForDate(day).slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.completed
                              ? 'bg-gray-100 text-gray-500 line-through'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {getTasksForDate(day).length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{getTasksForDate(day).length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simplified views for other types */}
      {viewType === 'day' && (
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Day view coming soon!</p>
          </div>
        </div>
      )}
      {viewType === 'week' && (
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Week view coming soon!</p>
          </div>
        </div>
      )}
      {viewType === 'year' && (
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Year view coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}