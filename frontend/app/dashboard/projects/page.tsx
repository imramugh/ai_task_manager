'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FolderPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { projects as projectsApi, Project } from '@/lib/projects';
import { tasks as tasksApi, Task } from '@/lib/tasks';
import ProjectForm from '@/components/projects/ProjectForm';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getTaskCount = (projectId: number) => {
    return tasks.filter((task) => task.project_id === projectId).length;
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsApi.delete(projectId);
      toast.success('Project deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

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
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 relative"
              >
                <button
                  onClick={() => handleDelete(project.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
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
                    {getTaskCount(project.id)} tasks
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <ProjectForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}