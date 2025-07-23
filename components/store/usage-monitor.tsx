'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface UsageStats {
  requests: {
    current: number;
    limit: number;
    percentage: string;
  };
  tokens: {
    current: number;
    limit: number;
    percentage: string;
  };
  lastReset: string;
  nextReset: string;
}

export function UsageMonitor() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/store-usage');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      
      setStats(data.usage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Loading usage statistics...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-red-500">Error: {error}</p>
        <button 
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">API Usage Monitor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requests */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Daily Requests</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Used:</span>
              <span className={getStatusColor(Number.parseFloat(stats.requests.percentage))}>
                {stats.requests.current.toLocaleString()} / {stats.requests.limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  Number.parseFloat(stats.requests.percentage) >= 90 ? 'bg-red-500' :
                  Number.parseFloat(stats.requests.percentage) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(Number.parseFloat(stats.requests.percentage), 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{stats.requests.percentage}% used</p>
          </div>
        </div>

        {/* Tokens */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Daily Tokens</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Used:</span>
              <span className={getStatusColor(Number.parseFloat(stats.tokens.percentage))}>
                {stats.tokens.current.toLocaleString()} / {stats.tokens.limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  Number.parseFloat(stats.tokens.percentage) >= 90 ? 'bg-red-500' :
                  Number.parseFloat(stats.tokens.percentage) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(Number.parseFloat(stats.tokens.percentage), 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{stats.tokens.percentage}% used</p>
          </div>
        </div>
      </div>

      {/* Reset Information */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          Next reset: {new Date(stats.nextReset).toLocaleString()}
        </p>
        <button 
          onClick={fetchStats}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh Stats
        </button>
      </div>
    </Card>
  );
}