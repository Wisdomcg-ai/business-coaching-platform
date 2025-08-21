'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';

const sampleBusinesses = [
  { name: "Tech Solutions Inc", industry: "Technology", stage: "SCALING" },
  { name: "Green Energy Co", industry: "Energy", stage: "LEADERSHIP" },
  { name: "Local Coffee Roasters", industry: "Food & Beverage", stage: "TRACTION" },
  { name: "Digital Marketing Agency", industry: "Marketing", stage: "SCALING" },
  { name: "Construction Partners", industry: "Construction", stage: "OPTIMIZATION" },
  { name: "Health & Wellness Center", industry: "Healthcare", stage: "TRACTION" },
  { name: "E-commerce Store", industry: "Retail", stage: "OPTIMIZATION" },
  { name: "Professional Services Ltd", industry: "Consulting", stage: "TRACTION" },
  { name: "Manufacturing Co", industry: "Manufacturing", stage: "MASTERY" },
  { name: "Software Startup", industry: "SaaS", stage: "FOUNDATION" },
  { name: "Logistics Solutions", industry: "Transportation", stage: "OPTIMIZATION" },
  { name: "Creative Design Studio", industry: "Design", stage: "TRACTION" },
  { name: "Financial Advisors", industry: "Finance", stage: "SCALING" },
  { name: "Auto Repair Shop", industry: "Automotive", stage: "TRACTION" },
  { name: "Online Education Platform", industry: "Education", stage: "SCALING" },
  { name: "Real Estate Group", industry: "Real Estate", stage: "LEADERSHIP" },
  { name: "Fitness Chain", industry: "Fitness", stage: "OPTIMIZATION" },
  { name: "IT Services Provider", industry: "IT Services", stage: "TRACTION" },
  { name: "Legal Practice", industry: "Legal", stage: "SCALING" },
  { name: "Event Management Co", industry: "Events", stage: "TRACTION" },
  { name: "Home Services Pro", industry: "Home Services", stage: "SCALING" },
  { name: "Import/Export Business", industry: "Trade", stage: "LEADERSHIP" },
  { name: "Restaurant Group", industry: "Hospitality", stage: "OPTIMIZATION" },
  { name: "Cleaning Services", industry: "Services", stage: "FOUNDATION" },
  { name: "Security Solutions", industry: "Security", stage: "SCALING" },
  { name: "Travel Agency", industry: "Travel", stage: "TRACTION" },
  { name: "Agricultural Supply", industry: "Agriculture", stage: "OPTIMIZATION" },
  { name: "Wholesale Distributor", industry: "Distribution", stage: "LEADERSHIP" },
  { name: "Recruitment Firm", industry: "HR Services", stage: "TRACTION" },
  { name: "Insurance Broker", industry: "Insurance", stage: "SCALING" },
  { name: "Media Production", industry: "Media", stage: "TRACTION" },
  { name: "Biotech Startup", industry: "Biotechnology", stage: "FOUNDATION" },
  { name: "Dental Practice", industry: "Healthcare", stage: "SCALING" },
  { name: "Accounting Firm", industry: "Accounting", stage: "SCALING" },
  { name: "Solar Installation Co", industry: "Renewable Energy", stage: "OPTIMIZATION" },
  { name: "Pet Care Services", industry: "Pet Services", stage: "TRACTION" },
  { name: "Fashion Retailer", industry: "Fashion", stage: "SCALING" },
  { name: "Engineering Consultancy", industry: "Engineering", stage: "OPTIMIZATION" }
];

const healthStatuses = [
  { status: 'THRIVING', minScore: 90, maxScore: 100 },
  { status: 'STRONG', minScore: 80, maxScore: 89 },
  { status: 'STABLE', minScore: 70, maxScore: 79 },
  { status: 'BUILDING', minScore: 60, maxScore: 69 },
  { status: 'STRUGGLING', minScore: 50, maxScore: 59 },
  { status: 'URGENT', minScore: 30, maxScore: 49 }
];

const revenueStages: Record<string, string> = {
  'FOUNDATION': 'Under $250K',
  'TRACTION': '$250K - $1M',
  'SCALING': '$1M - $3M', 
  'OPTIMIZATION': '$3M - $5M',
  'LEADERSHIP': '$5M - $10M',
  'MASTERY': '$10M+'
};

export default function TestDataPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const createTestData = async () => {
    setLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResults(['Error: You must be logged in to create test data']);
        setLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < sampleBusinesses.length; i++) {
        const business = sampleBusinesses[i];
        
        try {
          // Using 'name' column instead of 'business_name'
          const { data: newBusiness, error: businessError } = await supabase
            .from('businesses')
            .insert({
              name: business.name,  // Changed from business_name to name
              industry: business.industry,
              revenue_stage: revenueStages[business.stage],
              created_by: user.id
            })
            .select()
            .single();

          if (businessError) {
            setResults(prev => [...prev, `Error creating ${business.name}: ${businessError.message}`]);
            errorCount++;
            continue;
          }

          await supabase
            .from('business_members')
            .insert({
              business_id: newBusiness.id,
              user_id: user.id,
              role: 'owner'
            });

          const healthRange = business.stage === 'FOUNDATION' ? healthStatuses[4] :
                             business.stage === 'TRACTION' ? healthStatuses[3] :
                             business.stage === 'SCALING' ? healthStatuses[2] :
                             business.stage === 'OPTIMIZATION' ? healthStatuses[1] :
                             business.stage === 'LEADERSHIP' ? healthStatuses[0] :
                             healthStatuses[0];

          const healthScore = Math.floor(Math.random() * (healthRange.maxScore - healthRange.minScore + 1)) + healthRange.minScore;
          
          const daysAgo = Math.floor(Math.random() * 120);
          const assessmentDate = new Date();
          assessmentDate.setDate(assessmentDate.getDate() - daysAgo);

          const sampleAnswers = {
            q1: revenueStages[business.stage],
            q2: healthScore > 70 ? 'strong_15_20' : 'healthy_10_15',
            q3: 'yes_market',
            q4: '6_15',
            q5: 'somewhat',
            q6: 'very'
          };

          await supabase
            .from('assessments')
            .insert({
              business_id: newBusiness.id,
              completed_by: user.id,
              health_score: healthScore,
              health_status: healthRange.status,
              completion_percentage: 100,
              completed_at: assessmentDate.toISOString(),
              answers: sampleAnswers,
              foundation_score: Math.floor(Math.random() * 20) + 20,
              foundation_max: 40,
              strategic_wheel_score: Math.floor(Math.random() * 30) + 30,
              strategic_wheel_max: 60,
              profitability_score: Math.floor(Math.random() * 15) + 15,
              profitability_max: 30,
              engines_score: Math.floor(Math.random() * 50) + 50,
              engines_max: 100,
              disciplines_score: Math.floor(Math.random() * 30) + 30,
              disciplines_max: 60,
              total_score: Math.floor(healthScore * 2.9),
              total_max: 290
            });

          setResults(prev => [...prev, `✅ Created ${business.name} - ${healthRange.status} (${healthScore}%)`]);
          successCount++;
          
        } catch (error) {
          setResults(prev => [...prev, `Error with ${business.name}: ${error}`]);
          errorCount++;
        }

        setProgress(Math.floor(((i + 1) / sampleBusinesses.length) * 100));
      }

      setResults(prev => [
        ...prev,
        '',
        '=====================================',
        `✅ Successfully created: ${successCount} clients`,
        errorCount > 0 ? `❌ Errors encountered: ${errorCount}` : '',
        '=====================================',
        '🎉 Test data creation complete!'
      ].filter(Boolean));

    } catch (error) {
      setResults(['Unexpected error:', String(error)]);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL businesses and assessments?')) {
      return;
    }

    setLoading(true);
    setResults(['Clearing all data...']);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResults(['Error: You must be logged in']);
        setLoading(false);
        return;
      }

      await supabase
        .from('assessments')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('business_members')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('businesses')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      setResults(['✅ All data cleared successfully']);
    } catch (error) {
      setResults(['Unexpected error:', String(error)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Data Generator</h1>
          <p className="text-gray-600 mb-8">Create sample clients for testing your Coach Dashboard</p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What this will do:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create 38 sample businesses with realistic names and industries</li>
                <li>• Generate health assessments with varied scores and statuses</li>
                <li>• Randomize assessment dates (0-120 days ago)</li>
                <li>• Match health scores to revenue stages appropriately</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={createTestData}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '🚀 Create 38 Test Clients'}
              </button>

              <button
                onClick={clearAllData}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Clear All Data
              </button>

              <button
                onClick={() => router.push('/coach-dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                📊 View Dashboard
              </button>
            </div>

            {loading && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Progress: {progress}%</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-2">Results:</h3>
                <div className="text-sm font-mono space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className={
                      result.startsWith('✅') ? 'text-green-600' : 
                      result.startsWith('❌') ? 'text-red-600' : 
                      'text-gray-700'
                    }>
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
