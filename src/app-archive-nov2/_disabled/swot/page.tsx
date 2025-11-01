'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SwotAnalysis {
  id: string;
  title: string;
  quarter: string;
  year: number;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string;
}

export default function SwotListPage() {
  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const router = useRouter();
  // supabase client imported from lib

  useEffect(() => {
    fetchBusinessAndSwots();
  }, []);

  const fetchBusinessAndSwots = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      let foundBusinessId = null;

      // First, check if user owns a business directly
      const { data: ownedBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (ownedBusiness) {
        foundBusinessId = ownedBusiness.id;
        console.log('Found business via owner_id:', foundBusinessId);
      } else {
        // If not an owner, check business_members table
        const { data: memberData } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          foundBusinessId = memberData.business_id;
          console.log('Found business via business_members:', foundBusinessId);
        }
      }

      if (!foundBusinessId) {
        console.error('No business found for user');
        setLoading(false);
        return;
      }

      setBusinessId(foundBusinessId);

      // Fetch SWOT analyses for this business
      const { data: swotData, error } = await supabase
        .from('swot_analyses')
        .select('*')
        .eq('business_id', foundBusinessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SWOT analyses:', error);
      } else {
        setSwotAnalyses(swotData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSwot = async () => {
    if (!businessId) return;

    const currentQuarter = Math.floor((new Date().getMonth() / 3)) + 1;
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('swot_analyses')
      .insert({
        business_id: businessId,
        title: `Q${currentQuarter} ${currentYear} SWOT Analysis`,
        quarter: `Q${currentQuarter} ${currentYear}`,
        year: currentYear,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating SWOT:', error);
      alert('Failed to create SWOT analysis');
    } else if (data) {
      router.push(`/swot/${data.id}`);
    }
  };

  const deleteSwot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SWOT analysis?')) return;

    const { error } = await supabase
      .from('swot_analyses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting SWOT:', error);
      alert('Failed to delete SWOT analysis');
    } else {
      fetchBusinessAndSwots();
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show a better message if no business is found
  if (!businessId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Business Profile Found</h3>
            <p className="text-gray-600 mb-6">Please complete your business profile first to use the SWOT Analysis tool.</p>
            <Link
              href="/business-profile"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              Complete Business Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SWOT Analyses</h1>
              <p className="text-gray-600 mt-2">Strategic analysis for quarterly planning and review</p>
            </div>
            <button
              onClick={createNewSwot}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New SWOT Analysis
            </button>
          </div>
        </div>

        {/* SWOT Grid */}
        {swotAnalyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m-6-8h6m-3-4v12" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No SWOT Analyses Yet</h3>
            <p className="text-gray-600 mb-6">Create your first SWOT analysis to identify strategic priorities</p>
            <button
              onClick={createNewSwot}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First SWOT
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {swotAnalyses.map((swot) => (
              <div key={swot.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{swot.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(swot.status)}`}>
                      {swot.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>Quarter: {swot.quarter}</p>
                    <p>Created: {new Date(swot.created_at).toLocaleDateString()}</p>
                    <p>Updated: {new Date(swot.updated_at).toLocaleDateString()}</p>
                  </div>

                  {swot.notes && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{swot.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/swot/${swot.id}`}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-medium"
                    >
                      View/Edit
                    </Link>
                    <button
                      onClick={() => deleteSwot(swot.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About SWOT Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <h4 className="font-semibold text-blue-800">Strengths</h4>
              <p className="text-sm text-blue-700">Internal positive factors that give you an advantage</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Weaknesses</h4>
              <p className="text-sm text-blue-700">Internal factors that need improvement</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Opportunities</h4>
              <p className="text-sm text-blue-700">External factors you can leverage for growth</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">Threats</h4>
              <p className="text-sm text-blue-700">External challenges that could impact your business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}