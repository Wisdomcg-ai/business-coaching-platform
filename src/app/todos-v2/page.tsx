// app/todos-v2/page.tsx
'use client';

import TodoManagerV2 from '@/components/todos/TodoManagerV2';

export default function TodosV2Page() {
  // Using your hardcoded values for testing
  return (
    <TodoManagerV2
      businessId="8a4cf97b-604f-4117-8fef-610b33ab9dab"
      userId="52343ba5-7da0-4d76-8f5f-73f336164aa6"
      userRole="coach"
      userName="Matt"
    />
  );
}