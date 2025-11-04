'use client';

import { useState } from 'react';
import Section1Foundation from '@/components/assessment/Section1Foundation';

export default function AssessmentPage() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const totalSections = 6;
  const progress = (currentSection / totalSections) * 100;

  const updateFormData = (newData: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const handleNext = () => {
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
    } else {
      alert('Assessment completed!');
      window.location.href = '/dashboard';
    }
  };

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <Section1Foundation 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      default:
        return <div className="text-center p-8">Section {currentSection}: Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Development Diagnostic
          </h1>
          <p className="text-gray-600">Day 5 Progress - Section 1 Working!</p>
        </div>
        <div className="bg-white rounded-lg shadow-md mb-6">
          {renderCurrentSection()}
        </div>
        {currentSection > 1 && (
          <div className="flex justify-center">
            <button onClick={handleBack} className="px-6 py-2 border rounded">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}