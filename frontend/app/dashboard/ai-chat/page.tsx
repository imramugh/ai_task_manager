'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AIChat from '@/components/ai/AIChat';

export default function AIChatPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Task Assistant</h2>
          <p className="mt-1 text-sm text-gray-500">
            Chat with AI to plan projects, break down complex tasks, and get intelligent suggestions.
          </p>
        </div>
        <AIChat />
      </div>
    </DashboardLayout>
  );
}