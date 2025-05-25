'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FolderPlusIcon, TrashIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { projects as projectsApi, Project } from '@/lib/projects';
import { tasks as tasksApi, Task } from '@/lib/tasks';
import ProjectForm from '@/components/projects/ProjectForm';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const router = useRouter();
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

  const handleDelete = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsApi.delete(projectId);
      toast.success('Project deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleProjectClick = (projectId: number) => {
    // Navigate to tasks page with project filter
    router.push(`/dashboard?project=${projectId}`);
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
            <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="group bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer p-6 relative"
              >
                <button
                  onClick={(e) => handleDelete(e, project.id)}
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
                <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium group-hover:text-indigo-700">
                  <span>View tasks</span>
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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