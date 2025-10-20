// /src/app/goals-debug/page.tsx
// Debug version to find why Goals page redirects

'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GoalsDebugPage() {
  const [log, setLog] = useState<string[]>([]);
  const [foundBusiness, setFoundBusiness] = useState(false);
  const supabase = createClientComponentClient();

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    addLog('=== GOALS PAGE DIAGNOSTICS ===');
    
    try {
      // Step 1: Check session
      addLog('Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
        return;
      }
      
      if (!session) {
        addLog('❌ No session - would redirect to /auth/login');
        return;
      }
      
      addLog(`✅ Session found: ${session.user.email}`);
      addLog(`User ID: ${session.user.id}`);
      
      // Step 2: EXACT query from Goals page
      addLog('\n--- Running EXACT Goals page query ---');
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();
      
      addLog(`Query: .select('id').eq('owner_id', '${session.user.id}').single()`);
      
      if (businessError) {
        addLog(`❌ Business query error: ${businessError.message}`);
        addLog(`Error code: ${businessError.code}`);
        addLog(`Error hint: ${businessError.hint || 'none'}`);
        addLog(`Error details: ${JSON.stringify(businessError.details) || 'none'}`);
        
        if (businessError.code === 'PGRST116') {
          addLog('→ This means NO rows found');
          addLog('→ Goals would check business_members next');
          
          // Check business_members
          const { data: member, error: memberError } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', session.user.id)
            .single();
          
          if (memberError) {
            addLog(`❌ Member query error: ${memberError.message}`);
            if (memberError.code === 'PGRST116') {
              addLog('→ Not a member either');
              addLog('🔴 WOULD REDIRECT TO /business-profile');
            }
          } else if (member) {
            addLog(`✅ Found membership: ${member.business_id}`);
            setFoundBusiness(true);
          }
        }
      } else if (business) {
        addLog('✅ Business found!');
        addLog(`Business ID: ${business.id}`);
        addLog('→ Goals page SHOULD work');
        setFoundBusiness(true);
      }
      
      // Step 3: Alternative query - get ALL businesses for this user
      addLog('\n--- Checking ALL businesses for user ---');
      const { data: allBusinesses, error: allError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id);
      
      if (allError) {
        addLog(`Error getting all businesses: ${allError.message}`);
      } else if (allBusinesses && allBusinesses.length > 0) {
        addLog(`Found ${allBusinesses.length} business(es):`);
        allBusinesses.forEach((biz, index) => {
          addLog(`  ${index + 1}. ID: ${biz.id}`);
          addLog(`     Name: ${biz.name}`);
          addLog(`     Owner ID: ${biz.owner_id}`);
          addLog(`     Created: ${biz.created_at}`);
        });
      } else {
        addLog('No businesses found for this user');
      }
      
      // Step 4: Check without .single() to see all matches
      addLog('\n--- Query without .single() ---');
      const { data: multiCheck, error: multiError } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .eq('owner_id', session.user.id);
      
      if (multiError) {
        addLog(`Multi-check error: ${multiError.message}`);
      } else if (multiCheck) {
        addLog(`Found ${multiCheck.length} matches`);
        if (multiCheck.length === 0) {
          addLog('❌ Zero matches - this is why Goals redirects!');
        } else if (multiCheck.length === 1) {
          addLog('✅ One match - .single() should work');
        } else {
          addLog('⚠️ Multiple matches - .single() would fail');
        }
      }
      
      // Step 5: Check if owner_id matches exactly
      addLog('\n--- Checking owner_id match ---');
      const { data: testBiz } = await supabase
        .from('businesses')
        .select('owner_id')
        .limit(1)
        .single();
      
      if (testBiz) {
        addLog(`First business owner_id: ${testBiz.owner_id}`);
        addLog(`Current user ID: ${session.user.id}`);
        addLog(`IDs match: ${testBiz.owner_id === session.user.id ? '✅ YES' : '❌ NO'}`);
        
        if (testBiz.owner_id !== session.user.id) {
          addLog('🔴 PROBLEM: Business exists but owner_id doesn\'t match!');
          addLog('This is why Goals page redirects');
        }
      }
      
    } catch (error: any) {
      addLog(`❌ Unexpected error: ${error.message}`);
    }
    
    addLog('\n=== DIAGNOSTICS COMPLETE ===');
  }

  async function fixOwnership() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Not logged in');
      return;
    }
    
    addLog('Attempting to fix ownership...');
    
    // Get the first business
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .limit(1);
    
    if (businesses && businesses.length > 0) {
      const business = businesses[0];
      
      // Update owner_id to current user
      const { error } = await supabase
        .from('businesses')
        .update({ owner_id: session.user.id })
        .eq('id', business.id);
      
      if (error) {
        addLog(`❌ Failed to update: ${error.message}`);
        alert(`Error: ${error.message}`);
      } else {
        addLog('✅ Ownership updated! Refresh to test.');
        alert('Ownership fixed! Try the Goals page now.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Goals Page Debug</h1>
        
        {/* Status */}
        <div className={`rounded-lg p-6 mb-6 ${
          foundBusiness ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h2 className="text-lg font-semibold mb-2">
            {foundBusiness ? '✅ Business Found - Goals should work' : '❌ No Business Found - Goals will redirect'}
          </h2>
          <p className="text-sm">
            {foundBusiness 
              ? 'The query found a business. If Goals still redirects, there\'s a different issue.'
              : 'The exact query from Goals page found no business for your user.'}
          </p>
        </div>
        
        {/* Log */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
            {log.map((entry, i) => (
              <div key={i} className={entry.includes('❌') ? 'text-red-400' : entry.includes('✅') ? 'text-green-400' : entry.includes('🔴') ? 'text-red-600 font-bold' : ''}>
                {entry}
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Re-run Diagnostics
            </button>
            
            <button
              onClick={fixOwnership}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Fix Ownership (Set to Current User)
            </button>
            
            <button
              onClick={() => window.location.href = '/goals'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Try Goals Page
            </button>
            
            <button
              onClick={() => window.location.href = '/test-debug'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Back to Test Debug
            </button>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">Common Issues:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Owner ID mismatch:</strong> Business exists but owner_id doesn't match your user ID</li>
            <li><strong>No business:</strong> No business record exists for your user</li>
            <li><strong>Multiple businesses:</strong> Multiple businesses exist, causing .single() to fail</li>
          </ul>
          <p className="text-sm mt-3">
            The "Fix Ownership" button will update the first business to be owned by you.
          </p>
        </div>
      </div>
    </div>
  );
}