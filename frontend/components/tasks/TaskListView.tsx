'use client';

import { useState, useEffect } from 'react';
import { Task, PaginatedResponse, SortConfig } from '@/lib/types';
import { getTasks, searchTasks } from '@/lib/tasks';
import { TaskSearch } from './TaskSearch';
import { TaskSortControls } from './TaskSortControls';
import { TaskItem } from './TaskItem';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TaskListViewProps {
  initialTasks?: Task[];
  projectId?: number;
}

// Issues #19, #20, #22: Updated task list with pagination, search, and sorting
export function TaskListView({ initialTasks = [], projectId }: TaskListViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const perPage = 20;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    order: 'desc'
  });
  
  // Load tasks with pagination and sorting
  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (searchQuery) {
        // Use search endpoint
        const results = await searchTasks(searchQuery);
        setTasks(results);
        setTotalPages(1);
        setTotalTasks(results.length);
      } else {
        // Use paginated endpoint
        const response = await getTasks(
          currentPage,
          perPage,
          sortConfig,
          { project_id: projectId }
        );
        setTasks(response.items);
        setTotalPages(response.pages);
        setTotalTasks(response.total);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load tasks when dependencies change
  useEffect(() => {
    loadTasks();
  }, [currentPage, sortConfig, projectId]);
  
  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
    
    if (query) {
      setIsSearching(true);
      try {
        const results = await searchTasks(query);
        setTasks(results);
        setTotalPages(1);
        setTotalTasks(results.length);
      } catch (err) {
        setError('Search failed');
      } finally {
        setIsSearching(false);
      }
    } else {
      // Clear search and reload normal tasks
      loadTasks();
    }
  };
  
  // Handle task update
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };
  
  // Handle task delete
  const handleTaskDelete = (taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setTotalTasks(prev => prev - 1);
  };
  
  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TaskSearch 
          onSearch={handleSearch}
          className="w-full sm:w-96"
        />
        <TaskSortControls
          sortConfig={sortConfig}
          onChange={setSortConfig}
        />
      </div>
      
      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-gray-600">
          Found {totalTasks} results for "{searchQuery}"
        </p>
      )}
      
      {/* Task list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Create your first task!'}
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))
        )}
      </div>
      
      {/* Pagination controls */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalTasks)} of {totalTasks} tasks
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}