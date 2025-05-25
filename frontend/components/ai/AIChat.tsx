'use client';

import { useState, useRef, useEffect } from 'react';
import { ai } from '@/lib/ai';
import { projects as projectApi, Project } from '@/lib/projects';
import { PaperAirplaneIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
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

    try {
      const response = await ai.chat({ content: input });
      
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
    }
  };

  const handleGenerateTasks = async (prompt: string) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }

    setLoading(true);
    try {
      const response = await ai.generateTasks({ 
        content: prompt,
        context: { project_id: selectedProjectId }
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
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Initial state - centered input
  if (messages.length === 0) {
    return (
      <div className="min-h-[calc(100vh-240px)] flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome back, let's get productive!</h2>
          <p className="text-gray-600">How can I help you organize your tasks today?</p>
        </div>
        
        <form onSubmit={handleSendMessage} className="w-full max-w-2xl">
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="w-full resize-none rounded-lg px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[56px] max-h-[120px]"
              rows={1}
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
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
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-64 overflow-y-auto">
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
                  </div>
                )}
              </div>
              
              {selectedProject && (
                <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                  <div
                    className="w-3 h-3 rounded-sm mr-2"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  <span>{selectedProject.name}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed"
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
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative bg-gray-50 rounded-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to assistant..."
              className="w-full resize-none rounded-lg px-4 py-3 pr-12 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[48px] max-h-[120px]"
              disabled={loading}
              rows={1}
            />
            <div className="absolute bottom-3 right-3">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="text-indigo-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-64 overflow-y-auto">
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
                </div>
              )}
            </div>
            
            {selectedProject && (
              <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="font-medium">{selectedProject.name}</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}