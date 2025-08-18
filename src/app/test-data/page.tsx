'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setData({ error: 'No session found' });
        setLoading(false);
        return;
      }

      const { data: assessments, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        setData({ error: error.message });
      } else if (assessments && assessments[0]) {
        setData(assessments[0]);
      } else {
        setData({ error: 'No assessments found' });
      }
    } catch (err) {
      setData({ error: 'Failed to load data' });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading Assessment Data...</h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">No Data Found</h1>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error: {data.error}</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Assessment Data Structure Debug</h1>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Basic Info:</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Total Score:</p>
            <p className="text-2xl">{data.total_score}</p>
          </div>
          <div>
            <p className="font-medium">Percentage:</p>
            <p className="text-2xl">{data.percentage}%</p>
          </div>
          <div>
            <p className="font-medium">Health Status:</p>
            <p className="text-lg">{data.health_status}</p>
          </div>
          <div>
            <p className="font-medium">Revenue Stage:</p>
            <p className="text-lg">{data.revenue_stage}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Answer Keys (First 20):</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm">
          {data.answers ? (
            <>
              <p className="mb-2">Total keys: {Object.keys(data.answers).length}</p>
              <p className="break-all">{Object.keys(data.answers).slice(0, 20).join(', ')}</p>
            </>
          ) : (
            <p>No answers object found</p>
          )}
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sample Answer Values:</h2>
        {data.answers && (
          <div className="space-y-2 font-mono text-sm">
            <p>q1: {JSON.stringify(data.answers.q1)}</p>
            <p>q2: {JSON.stringify(data.answers.q2)}</p>
            <p>q3: {JSON.stringify(data.answers.q3)}</p>
            <p>q10: {JSON.stringify(data.answers.q10)}</p>
            <p>q30: {JSON.stringify(data.answers.q30)}</p>
            <p>discipline_1: {JSON.stringify(data.answers.discipline_1)}</p>
          </div>
        )}
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Complete Answers Structure:</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          <pre className="text-xs">
            {JSON.stringify(data.answers, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Answer Keys:</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-xs break-all">
          {data.answers ? Object.keys(data.answers).join(', ') : 'No answers'}
        </div>
      </div>
    </div>
  );
}