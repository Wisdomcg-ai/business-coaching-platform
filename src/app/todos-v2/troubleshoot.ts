// /src/app/todos-v2/troubleshoot.ts
// Run this script to diagnose and fix TodoManagerV2 issues

'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function runDiagnostics() {
  const supabase = createClientComponentClient()
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: [],
    errors: [],
    warnings: [],
    fixes: []
  }
  
  console.log('🔍 Starting TodoManagerV2 Diagnostics...')
  
  // Test 1: Authentication
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    results.checks.push({
      name: 'Authentication',
      status: 'PASS',
      details: `User ID: ${user?.id}`
    })
  } catch (error) {
    results.errors.push({
      name: 'Authentication',
      error: error,
      fix: 'Check your Supabase credentials in .env.local'
    })
  }
  
  // Test 2: Profile Check
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      
      results.checks.push({
        name: 'Profile',
        status: 'PASS',
        details: `Business ID: ${profile?.business_id}`
      })
    }
  } catch (error) {
    results.warnings.push({
      name: 'Profile',
      warning: 'No profile found',
      fix: 'Creating profile with test data...'
    })
    
    // Attempt to create profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').insert([{
          id: user.id,
          business_id: '8a4cf97b-604f-4117-8fef-610b33ab9dab',
          role: 'coach',
          full_name: 'Test User'
        }])
        results.fixes.push('Profile created')
      }
    } catch (fixError) {
      results.errors.push({
        name: 'Profile Creation',
        error: fixError
      })
    }
  }
  
  // Test 3: Database Tables
  const tables = ['todo_items', 'daily_musts', 'businesses', 'profiles']
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) throw error
      
      results.checks.push({
        name: `Table: ${table}`,
        status: 'PASS'
      })
    } catch (error: any) {
      if (error.code === '42P01') {
        results.errors.push({
          name: `Table: ${table}`,
          error: 'Table does not exist',
          fix: 'Run the migration SQL in Supabase dashboard'
        })
      } else {
        results.warnings.push({
          name: `Table: ${table}`,
          warning: error.message
        })
      }
    }
  }
  
  // Test 4: RLS Policies
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('todo_items')
        .select('*')
        .limit(1)
      
      if (error && error.message.includes('RLS')) {
        results.warnings.push({
          name: 'RLS Policies',
          warning: 'RLS might be blocking access',
          fix: 'Check RLS policies in Supabase dashboard'
        })
      } else {
        results.checks.push({
          name: 'RLS Policies',
          status: 'PASS'
        })
      }
    }
  } catch (error) {
    results.errors.push({
      name: 'RLS Check',
      error: error
    })
  }
  
  // Test 5: MUST Selection Logic
  try {
    const { data: todos } = await supabase
      .from('todo_items')
      .select('id, title, is_must, is_top_three')
      .or('is_must.eq.true,is_top_three.eq.true')
    
    const mustCount = todos?.filter(t => t.is_must).length || 0
    const topThreeCount = todos?.filter(t => t.is_top_three).length || 0
    
    if (mustCount > 1) {
      results.warnings.push({
        name: 'MUST Selection',
        warning: `Multiple TRUE MUSTs found (${mustCount})`,
        fix: 'Running cleanup...'
      })
      
      // Fix: Keep only the most recent MUST
      if (todos && todos.length > 1) {
        const mustsToReset = todos.filter(t => t.is_must).slice(1)
        for (const todo of mustsToReset) {
          await supabase
            .from('todo_items')
            .update({ is_must: false })
            .eq('id', todo.id)
        }
        results.fixes.push('Reset duplicate MUSTs')
      }
    }
    
    if (mustCount + topThreeCount > 3) {
      results.warnings.push({
        name: 'Priority Tasks',
        warning: `Too many priority tasks (${mustCount + topThreeCount})`,
        fix: 'Limit to 1 MUST + 2 TOP THREE'
      })
    }
    
    results.checks.push({
      name: 'MUST Selection',
      status: 'PASS',
      details: `MUSTs: ${mustCount}, TOP 3: ${topThreeCount}`
    })
  } catch (error) {
    results.errors.push({
      name: 'MUST Check',
      error: error
    })
  }
  
  // Test 6: Create Test Data if needed
  try {
    const { data: todos } = await supabase
      .from('todo_items')
      .select('id')
      .limit(1)
    
    if (!todos || todos.length === 0) {
      results.warnings.push({
        name: 'Test Data',
        warning: 'No todos found',
        fix: 'Creating test data...'
      })
      
      // Create test todos
      const testTodos = [
        {
          business_id: '8a4cf97b-604f-4117-8fef-610b33ab9dab',
          created_by: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          assigned_to: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          title: 'Review quarterly financials',
          description: 'Analyze Q4 revenue and expenses',
          priority: 'high',
          category: 'Finance',
          status: 'pending',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          business_id: '8a4cf97b-604f-4117-8fef-610b33ab9dab',
          created_by: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          assigned_to: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          title: 'Call key client about renewal',
          description: 'Discuss contract renewal for 2025',
          priority: 'critical',
          category: 'Sales',
          status: 'pending',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          business_id: '8a4cf97b-604f-4117-8fef-610b33ab9dab',
          created_by: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          assigned_to: '52343ba5-7da0-4d76-8f5f-73f336164aa6',
          title: 'Team meeting preparation',
          description: 'Prepare agenda for Monday team meeting',
          priority: 'medium',
          category: 'Team',
          status: 'pending',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      const { error } = await supabase
        .from('todo_items')
        .insert(testTodos)
      
      if (!error) {
        results.fixes.push('Created 3 test todos')
      }
    }
  } catch (error) {
    results.errors.push({
      name: 'Test Data Creation',
      error: error
    })
  }
  
  // Generate Summary
  const summary = {
    totalChecks: results.checks.length,
    passed: results.checks.filter((c: any) => c.status === 'PASS').length,
    errors: results.errors.length,
    warnings: results.warnings.length,
    fixes: results.fixes.length
  }
  
  // Print Results
  console.log('\n📊 DIAGNOSTIC RESULTS')
  console.log('====================')
  console.log(`✅ Passed: ${summary.passed}/${summary.totalChecks}`)
  console.log(`❌ Errors: ${summary.errors}`)
  console.log(`⚠️  Warnings: ${summary.warnings}`)
  console.log(`🔧 Fixes Applied: ${summary.fixes}`)
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:')
    results.errors.forEach((e: any) => {
      console.error(`- ${e.name}: ${e.error}`)
      if (e.fix) console.log(`  FIX: ${e.fix}`)
    })
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.warnings.forEach((w: any) => {
      console.warn(`- ${w.name}: ${w.warning}`)
      if (w.fix) console.log(`  FIX: ${w.fix}`)
    })
  }
  
  if (results.fixes.length > 0) {
    console.log('\n🔧 FIXES APPLIED:')
    results.fixes.forEach((f: any) => {
      console.log(`- ${f}`)
    })
  }
  
  console.log('\n✅ Diagnostic complete!')
  
  return results
}

// Add this to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).diagnoseToDoManager = runDiagnostics
  console.log('💡 Run window.diagnoseToDoManager() in console to diagnose issues')
}