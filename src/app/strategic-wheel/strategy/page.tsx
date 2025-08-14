'use client'

import Link from 'next/link'

export default function StrategyMarket() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/strategic-wheel" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Strategy & Market</h1>
              <p className="text-sm text-gray-600">Strategic Wheel Component 2 of 6</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <span className="text-4xl mb-4 block">🎯</span>
          <h2 className="text-2xl font-bold mb-4">Strategy & Market Component</h2>
          <p className="text-gray-600 mb-6">This component is coming soon!</p>
          <Link href="/strategic-wheel" className="text-blue-600 hover:text-blue-700">
            Return to Strategic Wheel
          </Link>
        </div>
      </main>
    </div>
  )
}
