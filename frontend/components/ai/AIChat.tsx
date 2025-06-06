'use client';

import { useState, useRef, useEffect } from 'react';
import { ai, ConversationMessage } from '@/lib/ai';
import { projects as projectApi, Project } from '@/lib/projects';
import { tasks as tasksApi, Task } from '@/lib/tasks';
import { PaperAirplaneIcon, FolderIcon, SparklesIcon, PlusIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NewProjectModal {
  isOpen: boolean;
  name: string;
  color: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState<NewProjectModal>({
    isOpen: false,
    name: '',
    color: '#3B82F6'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadProjects();
  }, []);

  // Load tasks when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectTasks(selectedProjectId);
    } else {
      setProjectTasks([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  useEffect(() => {
    // Close project menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setShowProjectMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects');
    }
  };

  const loadProjectTasks = async (projectId: number) => {
    try {
      const tasks = await tasksApi.getAll({ project_id: projectId });
      setProjectTasks(tasks);
      
      // Add a system message about loaded tasks
      if (tasks.length > 0) {
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: `📋 Loaded ${tasks.length} existing task${tasks.length > 1 ? 's' : ''} from this project. I can help you review, update, or add to these tasks.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Failed to load project tasks');
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectModal.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const newProject = await projectApi.create({
        name: newProjectModal.name,
        color: newProjectModal.color,
        description: ''
      });
      
      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject.id);
      setNewProjectModal({ isOpen: false, name: '', color: '#3B82F6' });
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setIsThinking(true);

    try {
      // Build conversation history for context
      const conversationHistory: ConversationMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current message to history
      conversationHistory.push({
        role: 'user',
        content: input
      });

      // Create context with project tasks if a project is selected
      const context: any = {
        project_id: selectedProjectId
      };
      
      if (projectTasks.length > 0) {
        context.existing_tasks = projectTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          completed: task.completed
        }));
      }

      // Send message with conversation history and task context
      const response = await ai.chat({ 
        content: input,
        conversation_history: conversationHistory,
        context
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleGenerateTasks = async (prompt: string) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    setLoading(true);
    setIsThinking(true);
    try {
      // Build conversation history for better context
      const conversationHistory: ConversationMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create context with existing tasks
      const context: any = { project_id: selectedProjectId };
      if (projectTasks.length > 0) {
        context.existing_tasks = projectTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          completed: task.completed
        }));
      }

      const response = await ai.generateTasks({ 
        content: prompt,
        context,
        conversation_history: conversationHistory
      });
      toast.success(response.message);
      
      // Add a success message to the chat
      const successMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✨ ${response.message}\n\nThe tasks have been created and added to your task list!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
      
      // Reload project tasks to show the new ones
      loadProjectTasks(selectedProjectId);
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Project color options
  const projectColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
  ];

  // Initial state - centered input
  if (messages.length === 0) {
    return (
      <div className="min-h-[calc(100vh-240px)] flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome back, let's get productive!</h2>
          <p className="text-gray-600">How can I help you organize your tasks today?</p>
        </div>
        
        <form onSubmit={handleSendMessage} className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="w-full resize-none rounded-lg px-4 py-3 focus:outline-none focus:border-transparent min-h-[56px] max-h-[200px]"
              rows={1}
            />

            {/* Buttons */}
            <div className="flex items-center space-x-2 mt-2 justify-end">
              {selectedProject && (
                <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                  <div
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  <span className="text-xs">{selectedProject.name}</span>
                </div>
              )}
              
              <div className="relative" ref={projectMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProjectMenu(!showProjectMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  title="Select project"
                >
                  <FolderIcon className="h-5 w-5" />
                </button>
                
                {showProjectMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-64 overflow-y-auto z-10">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select Project
                    </div>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowProjectMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                          selectedProjectId === project.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProjectMenu(false);
                          setNewProjectModal({ ...newProjectModal, isOpen: true });
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 text-indigo-600"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Create New Project</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Try asking:</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 italic">"I need to plan a website redesign project"</p>
            <p className="text-sm text-gray-600 italic">"Help me organize a team meeting"</p>
            <p className="text-sm text-gray-600 italic">"Break down a marketing campaign into tasks"</p>
          </div>
        </div>

        {/* New Project Modal */}
        {newProjectModal.isOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectModal.name}
                  onChange={(e) => setNewProjectModal({ ...newProjectModal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Color
                </label>
                <div className="flex space-x-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectModal({ ...newProjectModal, color })}
                      className={`w-8 h-8 rounded-md ${newProjectModal.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewProjectModal({ isOpen: false, name: '', color: '#3B82F6' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Chat view - fullscreen with messages
  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-240px)]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              {message.role === 'assistant' && message.content.includes('plan') && (
                <button
                  onClick={() => handleGenerateTasks(messages[messages.length - 2]?.content)}
                  className="mt-2 text-xs underline opacity-80 hover:opacity-100"
                >
                  Generate these tasks
                </button>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-5 w-5 text-orange-500 animate-pulse" />
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="bg-gray-50 rounded-lg p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to assistant..."
            className="w-full resize-none rounded-lg px-4 py-3 bg-transparent focus:outline-none focus:border-transparent min-h-[48px] max-h-[200px]"
            disabled={loading}
            rows={1}
          />

          {/* Buttons */}
          <div className="flex items-center space-x-2 mt-2 justify-end">
            {selectedProject && (
              <div className="flex items-center px-2 py-1 bg-white rounded-md text-sm text-gray-700">
                <div
                  className="w-3 h-3 rounded-sm mr-1"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="text-xs">{selectedProject.name}</span>
                {projectTasks.length > 0 && (
                  <span className="text-xs text-gray-500 ml-1">({projectTasks.length} tasks)</span>
                )}
              </div>
            )}
            
            <div className="relative" ref={projectMenuRef}>
              <button
                type="button"
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Select project"
              >
                <FolderIcon className="h-5 w-5" />
              </button>
              
              {showProjectMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-64 overflow-y-auto z-10">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select Project for Tasks
                  </div>
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowProjectMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                        selectedProjectId === project.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>{project.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectMenu(false);
                        setNewProjectModal({ ...newProjectModal, isOpen: true });
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 text-indigo-600"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Create New Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      {/* New Project Modal */}
      {newProjectModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectModal.name}
                onChange={(e) => setNewProjectModal({ ...newProjectModal, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Color
              </label>
              <div className="flex space-x-2">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewProjectModal({ ...newProjectModal, color })}
                    className={`w-8 h-8 rounded-md ${newProjectModal.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setNewProjectModal({ isOpen: false, name: '', color: '#3B82F6' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}