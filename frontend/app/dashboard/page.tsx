'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskList from '@/components/tasks/TaskList';
import TaskGrid from '@/components/tasks/TaskGrid';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import { tasks as taskApi, Task } from '@/lib/tasks';
import { projects as projectApi, Project } from '@/lib/projects';
import toast from 'react-hot-toast';
import { ViewColumnsIcon, ListBulletIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        taskApi.getAll(),
        projectApi.getAll(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = selectedProjectId
    ? tasks.filter(task => task.project_id === selectedProjectId)
    : tasks;

  const viewModes = [
    { id: 'list', name: 'List', icon: ListBulletIcon },
    { id: 'grid', name: 'Grid', icon: ViewColumnsIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarDaysIcon },
  ];

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div>
          {/* View mode selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              {selectedProjectId && (
                <span className="text-sm text-gray-500">
                  in {projects.find(p => p.id === selectedProjectId)?.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === mode.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title={mode.name}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project filter */}
          {projects.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProjectId(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedProjectId === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Projects
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedProjectId === project.id
                      ? 'text-white'
                      : 'text-gray-700 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: selectedProjectId === project.id ? project.color : project.color + '20',
                    color: selectedProjectId === project.id ? 'white' : project.color,
                  }}
                >
                  {project.name}
                </button>
              ))}
            </div>
          )}

          {/* Task views */}
          {viewMode === 'list' && (
            <TaskList tasks={filteredTasks} onUpdate={loadData} selectedProjectId={selectedProjectId} />
          )}
          {viewMode === 'grid' && (
            <TaskGrid tasks={filteredTasks} onUpdate={loadData} />
          )}
          {viewMode === 'calendar' && (
            <TaskCalendar tasks={filteredTasks} onUpdate={loadData} />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}