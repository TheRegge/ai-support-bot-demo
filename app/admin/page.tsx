import { auth } from '@/app/(auth)/auth';
import { UsageMonitor } from '@/components/store/usage-monitor';
import { StoreLogo } from '@/components/store/store-logo';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();
  
  // Only authenticated users can access admin page
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <StoreLogo className="h-12 sm:h-16 w-auto" background="dark" />
            <a 
              href="/" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors self-start sm:self-auto"
            >
              ← Back to Store
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor API usage and system performance</p>
        </div>


        {/* API Usage Monitor */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">API Usage Monitor</h2>
            <UsageMonitor />
          </section>

          {/* Future admin sections can go here */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Chatbot Status</h3>
                <div className="flex items-center">
                  <div className="size-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Operational</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Rate Limiting</h3>
                <div className="flex items-center">
                  <div className="size-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Bot Protection</h3>
                <div className="flex items-center">
                  <div className="size-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limit Configuration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Rate Limit Configuration</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">IP-based Limits</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 10 requests per hour per IP</li>
                    <li>• Automatic cleanup of expired entries</li>
                    <li>• HTTP 429 responses with retry-after headers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">User-based Limits</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Guests: 30 messages per day</li>
                    <li>• Registered: 100 messages per day</li>
                    <li>• Resets every 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Security Features */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Security Features</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Input Validation</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Max 500 characters per message</li>
                    <li>• Spam pattern detection</li>
                    <li>• Special character filtering</li>
                    <li>• Profanity filtering</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Bot Protection</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Sophisticated pattern detection</li>
                    <li>• Progressive warnings system</li>
                    <li>• Multi-message behavior analysis</li>
                    <li>• CORS and security headers</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}