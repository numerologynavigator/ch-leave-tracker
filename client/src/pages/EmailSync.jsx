import { useState, useEffect } from 'react';
import { RefreshCw, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function EmailSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    fetchSyncHistory();
  }, []);

  const fetchSyncHistory = async () => {
    try {
      const response = await fetch('/api/email/sync-history');
      const data = await response.json();
      setSyncHistory(data);
      if (data.length > 0) {
        setLastSync(data[0]);
      }
    } catch (error) {
      console.error('Error fetching sync history:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/email/sync', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert(`Success! ${result.message}`);
        fetchSyncHistory();
      } else {
        alert(`Sync failed: ${result.message || result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Sync</h1>
        <p className="mt-1 text-sm text-gray-500">
          Automatically sync PTO requests from your Outlook inbox
        </p>
      </div>

      {/* Sync Status Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-50 rounded-full">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Integration Status</h2>
              {lastSync ? (
                <p className="text-sm text-gray-500">
                  Last synced: {new Date(lastSync.last_sync).toLocaleString()}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Never synced</p>
              )}
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-primary flex items-center"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Email Configuration</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>• The system monitors your Outlook inbox for PTO-related emails</p>
              <p>• Email subjects should contain keywords like "PTO", "leave", or "vacation"</p>
              <p>• <strong>Employee matching by email address</strong> - ensure employees are added with their email first</p>
              <p>• The system extracts dates and leave type automatically from email content</p>
              <p>• Syncs run automatically every 15 minutes (when configured)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expected Email Format */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Email Format</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Example email subject:</p>
          <code className="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
            PTO Request: Planned leave from 2/10/2026 to 2/14/2026
          </code>
          
          <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Email body (optional):</p>
          <div className="bg-white p-3 rounded border text-sm text-gray-700">
            <p>Start Date: 2/15/2026</p>
            <p>End Date: 2/16/2026</p>
            <p>Type: Unplanned</p>
            <p>Reason: Family emergency</p>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Important:</p>
            <p className="text-sm text-yellow-700">
              The system matches PTO requests based on the <strong>sender's email address</strong>. 
              Make sure all employees are added to the system with their correct email addresses before they send PTO requests.
            </p>
          </div>
        </div>
      </div>

      {/* Sync History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync History</h2>
        <div className="space-y-3">
          {syncHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No sync history yet</p>
          ) : (
            syncHistory.map((sync, index) => (
              <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {sync.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(sync.last_sync).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sync.emails_processed} emails processed
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  sync.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sync.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Setup Required</h3>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>To enable automatic email syncing, you need to:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Register an app in Azure Active Directory</li>
            <li>Configure Microsoft Graph API permissions (Mail.Read)</li>
            <li>Add credentials to your .env file</li>
            <li>Restart the server</li>
          </ol>
          <p className="mt-3">See the README.md file for detailed setup instructions.</p>
        </div>
      </div>
    </div>
  );
}
