'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import AIChat from '@/components/ai/AIChat';

export default function AIChatPage() {
  return (
    <DashboardLayout>
      <AIChat />
    </DashboardLayout>
  );
}