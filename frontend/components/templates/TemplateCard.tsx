'use client';

import { TaskTemplate } from '@/lib/types';
import { useTemplate } from '@/lib/templates';
import { DocumentDuplicateIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TemplateCardProps {
  template: TaskTemplate;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (templateId: number) => void;
  onUse: () => void;
}

// Issue #23: Template card component
export function TemplateCard({ template, onEdit, onDelete, onUse }: TemplateCardProps) {
  const handleUse = async () => {
    try {
      await useTemplate(template.id);
      toast.success('Task created from template!');
      onUse();
    } catch (error) {
      toast.error('Failed to use template');
    }
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDelete(template.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
        <span className="text-xs text-gray-500">Used {template.usage_count} times</span>
      </div>
      
      {template.description && (
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      )}
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Task: </span>
          <span className="text-gray-600">{template.task_description}</span>
        </div>
        
        <div className="text-sm">
          <span className="font-medium text-gray-700">Priority: </span>
          <span className={`
            inline-block px-2 py-1 rounded-md text-xs font-medium
            ${template.task_priority === 'urgent' ? 'bg-red-100 text-red-800' :
              template.task_priority === 'high' ? 'bg-orange-100 text-orange-800' :
              template.task_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'}
          `}>
            {template.task_priority}
          </span>
        </div>
        
        {template.task_duration_days && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Duration: </span>
            <span className="text-gray-600">{template.task_duration_days} days</span>
          </div>
        )}
        
        {template.category && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Category: </span>
            <span className="text-gray-600">{template.category}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleUse}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
          Use Template
        </button>
        
        <button
          onClick={() => onEdit(template)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}