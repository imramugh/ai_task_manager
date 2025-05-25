'use client';

import { useState } from 'react';
import { Task, tasks as taskApi } from '@/lib/tasks';
import { formatDate, getPriorityColor, getPriorityIcon } from '@/lib/utils';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await taskApi.update(task.id, { completed: !task.completed });
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      await taskApi.delete(task.id);
      toast.success('Task deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md flex flex-col ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className="flex-shrink-0"
        >
          <div
            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 hover:border-indigo-600'
            }`}
          >
            {task.completed && <CheckIconSolid className="h-3 w-3 text-white" />}
          </div>
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1">
        <h3
          className={`text-sm font-medium text-gray-900 mb-1 ${
            task.completed ? 'line-through' : ''
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
        )}
      </div>

      <div className="mt-auto pt-3 space-y-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {getPriorityIcon(task.priority)} {task.priority}
        </span>
        {task.due_date && (
          <p className="text-xs text-gray-500">Due {formatDate(task.due_date)}</p>
        )}
        {task.ai_generated && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            🤖 AI
          </span>
        )}
      </div>
    </div>
  );
}