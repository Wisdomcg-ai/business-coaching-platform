// /src/app/test-debug/page.tsx
// Debug page to diagnose why business profile isn't saving

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestDebugPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const supabase = createClientComponentClient();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    runTests();
  }, []);

  async function runTests() {
    addStatus('Starting diagnostics...');
    
    // Test 1: Check authentication
    try {
      addStatus('Testing authentication...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addStatus(`❌ Auth error: ${error.message}`);
        return;
      }
      
      if (!session) {
        addStatus('❌ No session found - please login first');
        return;
      }
      
      setUser(session.user);
      addStatus(`✅ Authenticated as: ${session.user.email}`);
      addStatus(`User ID: ${session.user.id}`);
    } catch (error: any) {
      addStatus(`❌ Auth test failed: ${error.message}`);
      return;
    }

    // Test 2: Check if businesses table exists
    try {
      addStatus('Testing businesses table access...');
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .limit(1);
      
      if (error) {
        addStatus(`❌ Table access error: ${error.message}`);
        addStatus('The businesses table might not exist or lacks proper permissions');
      } else {
        addStatus('✅ Businesses table is accessible');
      }
    } catch (error: any) {
      addStatus(`❌ Table test failed: ${error.message}`);
    }

    // Test 3: Check for existing business
    try {
      addStatus('Checking for existing business...');
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session?.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        addStatus(`⚠️ Query error: ${error.message}`);
      } else if (data) {
        addStatus('✅ Found existing business:');
        addStatus(`   Name: ${data.name || 'Not set'}`);
        addStatus(`   ID: ${data.id}`);
        setBusinessData(data);
      } else {
        addStatus('ℹ️ No existing business found');
      }
    } catch (error: any) {
      addStatus(`❌ Business check failed: ${error.message}`);
    }

    // Test 4: Try to create a test business
    addStatus('Ready to test business creation...');
  }

  async function testCreateBusiness() {
    if (!user) {
      alert('Please login first');
      return;
    }

    addStatus('Attempting to create test business...');
    
    try {
      const testData = {
        owner_id: user.id,
        name: 'Test Business ' + new Date().toISOString(),
        industry: 'Technology',
        annual_revenue: 1000000,
        employee_count: 10,
        years_in_business: 5,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      addStatus('Sending data to Supabase...');
      addStatus(`Data: ${JSON.stringify(testData, null, 2)}`);

      const { data, error } = await supabase
        .from('businesses')
        .insert(testData)
        .select()
        .single();

      if (error) {
        addStatus(`❌ Insert failed: ${error.message}`);
        addStatus(`Error code: ${error.code}`);
        addStatus(`Error details: ${JSON.stringify(error, null, 2)}`);
      } else {
        addStatus('✅ Business created successfully!');
        addStatus(`Business ID: ${data.id}`);
        setBusinessData(data);
      }
    } catch (error: any) {
      addStatus(`❌ Create test failed: ${error.message}`);
    }
  }

  async function testUpdateBusiness() {
    if (!businessData) {
      alert('No business to update. Create one first.');
      return;
    }

    addStatus('Attempting to update business...');
    
    try {
      const updateData = {
        name: 'Updated Test Business ' + new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessData.id)
        .select()
        .single();

      if (error) {
        addStatus(`❌ Update failed: ${error.message}`);
      } else {
        addStatus('✅ Business updated successfully!');
        addStatus(`New name: ${data.name}`);
        setBusinessData(data);
      }
    } catch (error: any) {
      addStatus(`❌ Update test failed: ${error.message}`);
    }
  }

  async function deleteTestBusiness() {
    if (!businessData) {
      alert('No business to delete');
      return;
    }

    if (!confirm('Delete the test business?')) return;

    addStatus('Attempting to delete business...');
    
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessData.id);

      if (error) {
        addStatus(`❌ Delete failed: ${error.message}`);
      } else {
        addStatus('✅ Business deleted successfully');
        setBusinessData(null);
      }
    } catch (error: any) {
      addStatus(`❌ Delete test failed: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Debug Test</h1>
        
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh & Re-test
            </button>
            
            <button
              onClick={testCreateBusiness}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!user}
            >
              Create Test Business
            </button>
            
            <button
              onClick={testUpdateBusiness}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!businessData}
            >
              Update Business
            </button>
            
            <button
              onClick={deleteTestBusiness}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={!businessData}
            >
              Delete Test Business
            </button>
            
            <button
              onClick={() => window.location.href = '/business-profile'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Business Profile
            </button>
            
            <button
              onClick={() => window.location.href = '/goals'}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Try Goals Page
            </button>
          </div>
        </div>

        {/* Current Business Data */}
        {businessData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Current Business Data</h2>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(businessData, null, 2)}
            </pre>
          </div>
        )}

        {/* Status Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-auto">
            {status.map((msg, index) => (
              <div key={index} className="mb-1">
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">What This Tests:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Verifies you're logged in</li>
            <li>Checks if the businesses table exists and is accessible</li>
            <li>Looks for any existing business data</li>
            <li>Tests creating, updating, and deleting business records</li>
          </ol>
          <p className="mt-3 text-sm font-semibold">
            If create/update works here but not in Business Profile, it's a code issue.
            If it fails here, it's a database/permissions issue.
          </p>
        </div>
      </div>
    </div>
  );
}