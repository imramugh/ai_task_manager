'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FolderPlusIcon } from '@heroicons/react/24/outline';

export default function ProjectsPage() {
  const [projects] = useState([
    { id: 1, name: 'Personal Tasks', color: '#3B82F6', taskCount: 12 },
    { id: 2, name: 'Work Projects', color: '#10B981', taskCount: 8 },
    { id: 3, name: 'Side Projects', color: '#F59E0B', taskCount: 5 },
  ]);

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="mt-1 text-sm text-gray-500">
              Organize your tasks into projects
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: project.color }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {project.taskCount} tasks
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}