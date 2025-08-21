'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [message, setMessage] = useState('Testing...')

  useEffect(() => {
    async function test() {
      try {
  // supabase client imported from lib
        const { data, error } = await supabase.from('profiles').select('count')
        
        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('✅ Database connected successfully!')
        }
      } catch (err) {
        setMessage('❌ Connection failed')
      }
    }
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Database Test</h1>
      <p className="mt-4">{message}</p>
    </div>
  )
}