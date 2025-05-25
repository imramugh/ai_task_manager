'use client';

import { useState, useEffect } from 'react';
import { TaskTemplate } from '@/lib/types';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/templates';
import { TemplateCard } from './TemplateCard';
import { TemplateForm } from './TemplateForm';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const categories = ['All', 'Work', 'Personal', 'Team', 'Checklists'];

// Issue #23: Template manager component
export function TemplateManager() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);
  
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory === 'All' ? undefined : selectedCategory.toLowerCase();
      const data = await getTemplates(category);
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTemplate = async (templateData: Partial<TaskTemplate>) => {
    try {
      const newTemplate = await createTemplate(templateData);
      setTemplates([newTemplate, ...templates]);
      setShowCreateModal(false);
      toast.success('Template created successfully!');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };
  
  const handleUpdateTemplate = async (templateId: number, updates: Partial<TaskTemplate>) => {
    try {
      const updatedTemplate = await updateTemplate(templateId, updates);
      setTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t));
      setEditingTemplate(null);
      toast.success('Template updated successfully!');
    } catch (error) {
      toast.error('Failed to update template');
    }
  };
  
  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Task Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create Template
        </button>
      </div>
      
      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-full transition-colors
              ${selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Template grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No templates found. Create your first template!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={setEditingTemplate}
              onDelete={handleDeleteTemplate}
              onUse={loadTemplates}
            />
          ))}
        </div>
      )}
      
      {/* Create/Edit modal */}
      {(showCreateModal || editingTemplate) && (
        <TemplateForm
          template={editingTemplate}
          onSubmit={editingTemplate
            ? (data) => handleUpdateTemplate(editingTemplate.id, data)
            : handleCreateTemplate
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}