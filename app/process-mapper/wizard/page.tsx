'use client';

import { useEffect, useState, useRef } from 'react';
import { useProcessWizard } from '@/hooks/useProcessWizard';
import { Send, Loader2, Plus } from 'lucide-react';

export default function ProcessWizardPage() {
  const {
    processId,
    processData,
    messages,
    loading,
    error,
    startNewProcess,
    sendMessage,
    saveProcess,
  } = useProcessWizard();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize wizard on mount
  useEffect(() => {
    startNewProcess();
  }, [startNewProcess]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) return;

    const message = inputValue;
    setInputValue('');

    await sendMessage(message);
  };

  // Handle save
  const handleSave = async () => {
    await saveProcess();
    alert('Process saved successfully!');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel: Conversation */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-2xl font-bold">Process Mapper Pro</h1>
          <p className="text-blue-100 mt-1">
            {processData.name || 'Starting conversation...'}
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your response..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel: Process Preview */}
      <div className="w-1/2 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Summary</h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Process Name</label>
              <p className="text-gray-900 font-semibold">
                {processData.name || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Trigger</label>
              <p className="text-gray-900">
                {processData.trigger || '—'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Current Stage</label>
              <p className="text-gray-900 capitalize">{processData.stage}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-600">Statistics</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-2xl font-bold text-blue-600">
                    {processData.activities.length}
                  </p>
                  <p className="text-xs text-gray-600">Activities</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-2xl font-bold text-purple-600">
                    {processData.swimlanes.length}
                  </p>
                  <p className="text-xs text-gray-600">Swimlanes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 overflow-y-auto mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>

          {processData.activities.length > 0 ? (
            <div className="space-y-2">
              {processData.activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    activity.type === 'action'
                      ? 'bg-blue-50 border-l-blue-500'
                      : 'bg-purple-50 border-l-purple-500'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900">
                    {activity.order}. {activity.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {activity.swimlane} • {activity.type}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Activities will appear here as you describe the process...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !processData.name}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save Process
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-3 rounded-lg transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}