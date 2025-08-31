'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Check if we can query the database
      let canQueryDb = false;
      let businessCount = 0;
      
      if (user) {
        const { data: businesses, error: dbError } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id);
        
        canQueryDb = !dbError;
        businessCount = businesses?.length || 0;
      }
      
      setAuthStatus({
        hasSession: !!session,
        sessionError: sessionError?.message,
        hasUser: !!user,
        userError: userError?.message,
        userId: user?.id,
        userEmail: user?.email,
        canQueryDb,
        businessCount,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setAuthStatus({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }

  async function testLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'mattmalouf@wisdomcoaching.com.au',
      password: 'coach123'
    });
    
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      alert('Login successful!');
      window.location.reload();
    }
  }

  async function testLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Auth Status:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(authStatus, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions:</h2>
        <div className="space-x-4">
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Login (Matt)
          </button>
          <button
            onClick={testLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">What This Means:</h2>
        {authStatus.hasUser ? (
          <div className="text-green-600">
            ✅ You are logged in as: {authStatus.userEmail}
            <br />
            User ID: {authStatus.userId}
            <br />
            Businesses: {authStatus.businessCount}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ You are NOT logged in
            <br />
            {authStatus.sessionError && `Session Error: ${authStatus.sessionError}`}
            <br />
            {authStatus.userError && `User Error: ${authStatus.userError}`}
          </div>
        )}
      </div>
    </div>
  );
}