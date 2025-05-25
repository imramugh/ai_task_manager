'use client';

import { useState } from 'react';
import { Task } from '@/lib/tasks';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TaskGridProps {
  tasks: Task[];
  onUpdate: () => void;
}

export default function TaskGrid({ tasks, onUpdate }: TaskGridProps) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter((task) => !task.completed).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {activeTasks} active, {tasks.length - activeTasks} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 px-1 text-sm font-medium ${
            filter === 'all'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`pb-2 px-1 text-sm font-medium ${
            filter === 'active'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`pb-2 px-1 text-sm font-medium ${
            filter === 'completed'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-gray-500">
              {filter === 'all'
                ? 'No tasks yet. Create your first task!'
                : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
          ))
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}