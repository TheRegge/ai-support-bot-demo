'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InfoIcon } from 'lucide-react';

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
  dataSource: 'local' | 'google-cloud' | 'hybrid';
  lastGoogleCloudSync?: string;
  errorRate?: string;
  averageLatency?: string;
  realApiData?: {
    totalRequests: number;
    errorCount: number;
    responseCodeStats: { [key: string]: number };
    timeWindow: {
      start: string;
      end: string;
    };
  };
}

interface ConnectionTestResult {
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
}

export function UsageMonitor() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

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

  const testGoogleCloudConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-google-cloud');
      const data = await response.json();
      setConnectionTest(data);
    } catch (err) {
      setConnectionTest({
        isConfigured: false,
        isConnected: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    fetchStats();
    testGoogleCloudConnection();
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

  const getDataSourceBadge = (dataSource: string) => {
    const badges = {
      'local': { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 
        text: 'Local Tracking',
        description: 'Using local in-memory tracking only. API usage data is estimated based on tracked requests within this application instance.'
      },
      'google-cloud': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
        text: 'Google Cloud',
        description: 'Connected to Google Cloud Monitoring. Showing real-time API usage data directly from Google\'s metrics.'
      },
      'hybrid': { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
        text: 'Hybrid',
        description: 'Combining local tracking with Google Cloud data. Local data is used for immediate updates, while Google Cloud provides accurate historical metrics.'
      }
    };
    const badge = badges[dataSource as keyof typeof badges] || badges.local;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color} hover:opacity-80 transition-opacity cursor-help`}>
            {badge.text}
            <InfoIcon className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Data Source: {badge.text}</h4>
            <p className="text-sm text-muted-foreground">
              {badge.description}
            </p>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Google Cloud data may have a slight delay (1-2 minutes) compared to real-time usage.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">API Usage Monitor</h3>
        {stats && getDataSourceBadge(stats.dataSource)}
      </div>
      
      {/* Google Cloud Connection Status */}
      {connectionTest && (
        <div className="mb-4 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionTest.isConnected ? 'bg-green-500' : 
                connectionTest.isConfigured ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                Google Cloud Monitoring: {
                  connectionTest.isConnected ? 'Connected' :
                  connectionTest.isConfigured ? 'Configured (Not Connected)' : 'Not Configured'
                }
              </span>
            </div>
            <button
              onClick={testGoogleCloudConnection}
              disabled={testingConnection}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
          {connectionTest.error && (
            <p className="text-xs text-red-600 mt-1">{connectionTest.error}</p>
          )}
        </div>
      )}
      
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
            <p className="text-sm text-gray-300 dark:text-gray-300">{stats.requests.percentage}% used</p>
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
            <p className="text-sm text-gray-300 dark:text-gray-300">{stats.tokens.percentage}% used</p>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      {stats?.errorRate && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <h5 className="text-sm font-medium mb-1">Error Rate</h5>
            <p className={`text-lg font-semibold ${
              Number.parseFloat(stats.errorRate) > 5 ? 'text-red-600' :
              Number.parseFloat(stats.errorRate) > 1 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {stats.errorRate}%
            </p>
          </div>
          
          {stats.averageLatency && (
            <div className="border rounded-lg p-3">
              <h5 className="text-sm font-medium mb-1">Avg Response Time</h5>
              <p className="text-lg font-semibold text-blue-600">
                {stats.averageLatency}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Real API Data Details */}
      {stats?.realApiData && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Google Cloud Data (Last 24h)</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Requests:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{stats.realApiData.totalRequests.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Errors:</span>
              <span className="ml-2 font-medium text-red-600 dark:text-red-400">{stats.realApiData.errorCount.toLocaleString()}</span>
            </div>
          </div>
          
          {Object.keys(stats.realApiData.responseCodeStats).length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Codes:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {Object.entries(stats.realApiData.responseCodeStats).map(([code, count]) => (
                  <span key={code} className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                    {code}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Data from {new Date(stats.realApiData.timeWindow.start).toLocaleString()} to {new Date(stats.realApiData.timeWindow.end).toLocaleString()}
          </p>
        </div>
      )}
      
      {/* Reset Information */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300 dark:text-gray-300">
              Next reset: {new Date(stats.nextReset).toLocaleString()}
            </p>
            {stats.lastGoogleCloudSync && (
              <p className="text-xs text-gray-400 dark:text-gray-400">
                Last Google sync: {new Date(stats.lastGoogleCloudSync).toLocaleString()}
              </p>
            )}
          </div>
          <button 
            onClick={fetchStats}
            className="text-sm text-blue-400 hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </Card>
  );
}