'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lightbulb } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface VisionMissionData {
  purpose_statement: string;
  mission_statement: string;
  vision_statement: string;
  core_values: string[];
}

export default function VisionMissionPage() {
  const router = useRouter();
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<VisionMissionData>({
    purpose_statement: '',
    mission_statement: '',
    vision_statement: '',
    core_values: ['', '', '', '', '', '', '', '']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load from strategy_data table
      const { data: existingData } = await supabase
        .from('strategy_data')
        .select('vision_mission')
        .eq('user_id', user.id)
        .single();

      if (existingData?.vision_mission) {
        const vmData = existingData.vision_mission as VisionMissionData;
        
        // Ensure core_values has 8 slots
        const values = [...(vmData.core_values || [])];
        while (values.length < 8) values.push('');
        
        setFormData({
          ...vmData,
          core_values: values.slice(0, 8)
        });
        lastSavedDataRef.current = JSON.stringify(vmData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading:', error);
      setLoading(false);
    }
  };

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
    setErrorMessage(null);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 2000);
  };

  const saveData = async () => {
    const dataToSave = {
      ...formData,
      core_values: formData.core_values.filter(v => v.trim() !== '')
    };

    const currentDataString = JSON.stringify(dataToSave);
    if (currentDataString === lastSavedDataRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('strategy_data')
        .upsert({
          user_id: user.id,
          vision_mission: dataToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      lastSavedDataRef.current = currentDataString;
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Error saving:', error);
      setErrorMessage(error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCoreValueChange = (index: number, value: string) => {
    const newValues = [...formData.core_values];
    newValues[index] = value;
    setFormData(prev => ({ ...prev, core_values: newValues }));
    handleFieldChange();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vision and mission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vision, Mission & Values</h1>
                <p className="mt-2 text-gray-600">
                  Define why your business exists and where it's going
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </span>
              )}
              {!saving && lastSaved && (
                <span className="text-sm text-green-600">
                  ✓ Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {hasUnsavedChanges && !saving && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              {errorMessage && (
                <span className="text-sm text-red-600">Error: {errorMessage}</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Purpose Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Purpose Statement</h2>
            <p className="text-sm text-gray-600 mb-3">
              Complete this sentence: <span className="font-medium">Our business exists to...</span>
            </p>
            <textarea
              value={formData.purpose_statement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, purpose_statement: e.target.value }));
                handleFieldChange();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., help small businesses achieve sustainable growth through innovative solutions and strategic guidance..."
            />
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Mission Statement</h2>
            <p className="text-sm text-gray-600 mb-3">
              What do you do, who do you serve, and how do you create value?
            </p>
            <textarea
              value={formData.mission_statement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, mission_statement: e.target.value }));
                handleFieldChange();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., We deliver world-class coaching and strategic planning tools to ambitious business owners, empowering them to build profitable, sustainable companies..."
            />
          </div>

          {/* Vision Statement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">3-Year Vision Statement</h2>
            <p className="text-sm text-gray-600 mb-3">
              In 3 years, our business will be...
            </p>
            <textarea
              value={formData.vision_statement}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, vision_statement: e.target.value }));
                handleFieldChange();
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., the leading provider of business coaching in our region, serving 500+ clients with a team of 20, generating $5M in annual revenue..."
            />
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Core Values</h2>
            <p className="text-sm text-gray-600 mb-4">
              List the principles that guide every decision (up to 8 values, minimum 3 recommended)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.core_values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCoreValueChange(index, e.target.value)}
                    placeholder={index < 3 ? 'Recommended' : 'Optional'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">💡 Tip:</span> Great core values are memorable, actionable, and guide decision-making. 
                Examples: "Customer obsession", "Radical transparency", "Move fast, learn faster"
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <button
              onClick={() => {
                saveData();
                alert('Vision, Mission & Values saved successfully!');
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}