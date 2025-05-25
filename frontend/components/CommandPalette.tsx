'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { tasks } from '@/lib/tasks';
import { ai } from '@/lib/ai';
import toast from 'react-hot-toast';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleCreateTask = async () => {
    if (!search.trim()) return;
    
    setLoading(true);
    try {
      await tasks.create({ title: search });
      toast.success('Task created!');
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!search.trim()) return;
    
    setLoading(true);
    try {
      const response = await ai.generateTasks({ content: search });
      toast.success(response.message);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
              <Command className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-900">
                <div className="flex items-center border-b border-gray-200 px-4">
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="flex-1 border-0 bg-transparent py-3 placeholder-gray-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-3">
                  {loading && (
                    <div className="py-6 text-center text-sm text-gray-500">
                      Loading...
                    </div>
                  )}

                  <Command.Empty className="py-6 text-center text-sm text-gray-500">
                    No results found.
                  </Command.Empty>

                  <Command.Group heading="Actions">
                    <Command.Item
                      onSelect={() => router.push('/dashboard')}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Go to Tasks
                    </Command.Item>
                    <Command.Item
                      onSelect={() => router.push('/dashboard/ai-chat')}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Open AI Assistant
                    </Command.Item>
                    <Command.Item
                      onSelect={() => router.push('/dashboard/projects')}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Manage Projects
                    </Command.Item>
                  </Command.Group>

                  {search && (
                    <Command.Group heading="Create">
                      <Command.Item
                        onSelect={handleCreateTask}
                        className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Create task "{search}"
                      </Command.Item>
                      <Command.Item
                        onSelect={handleAIGenerate}
                        className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        🤖 Generate tasks for "{search}"
                      </Command.Item>
                    </Command.Group>
                  )}
                </Command.List>
              </Command>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}