'use client';

import { useState } from 'react';
import { Task, tasks as taskApi } from '@/lib/tasks';
import { formatDate, getPriorityColor, getPriorityIcon } from '@/lib/utils';
import { CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

export default function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
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

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await taskApi.update(task.id, { title });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className="flex-shrink-0 mt-0.5"
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

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <div>
              <p
                className={`text-sm font-medium text-gray-900 ${
                  task.completed ? 'line-through' : ''
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-sm text-gray-500">{task.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)} {task.priority}
                </span>
                {task.due_date && (
                  <span>Due {formatDate(task.due_date)}</span>
                )}
                {task.ai_generated && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    🤖 AI Generated
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}