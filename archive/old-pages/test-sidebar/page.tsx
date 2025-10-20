'use client'

import SidebarLayout from '@/components/layout/sidebar-layout'

export default function TestSidebar() {
  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sidebar Test Page</h1>
        <p className="text-gray-600">
          If you can see this with the sidebar, the layout is working correctly!
        </p>
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Navigation Test</h2>
          <p>Try clicking different menu items in the sidebar.</p>
          <p>The sidebar should:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Show different sections based on your role</li>
            <li>Highlight the active page</li>
            <li>Collapse and expand sections</li>
            <li>Work on mobile with hamburger menu</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  )
}