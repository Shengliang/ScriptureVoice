
import React, { useState, useEffect } from 'react';
import { X, Key, Save, Trash2, Check, Info, Loader2, WifiOff, RefreshCw } from './Icons';
import { Language } from '../types';
import { getDiagnostics, testConnection } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  
  // Diagnostic State
  const [diag, setDiag] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    const d = await getDiagnostics();
    setDiag(d);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (isOpen) {
      const local = localStorage.getItem('user_api_key');
      if (local) {
        setSavedKey(local);
        setApiKey(local);
      }
      refreshDiagnostics();
    } else {
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatusMsg("Please enter a valid key.");
      return;
    }
    localStorage.setItem('user_api_key', apiKey.trim());
    setSavedKey(apiKey.trim());
    setStatusMsg("Key saved! Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('user_api_key');
    setSavedKey(null);
    setApiKey('');
    setStatusMsg("Key removed. Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setIsTesting(false);
    refreshDiagnostics();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-bible-200 flex flex-col max-h-[90vh]">
        <div className="bg-bible-50 p-4 border-b border-bible-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-bible-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-bible-600" />
            System Settings
          </h3>
          <button onClick={onClose} className="text-bible-400 hover:text-bible-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* System Status Panel */}
          {diag && (
            <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2">
                 <span className="font-bold text-stone-700">Diagnostics</span>
                 <button 
                   onClick={refreshDiagnostics} 
                   className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                   title="Refresh Status"
                 >
                   <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                 </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600">Server Connection:</span>
                <span className={`font-bold ${diag.serverReachable ? 'text-green-600' : 'text-red-500'}`}>
                  {diag.serverReachable ? 'Online' : 'Offline / Blocked'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Server Default Key:</span>
                <span className={`font-bold ${diag.serverHasKey ? 'text-green-600' : 'text-red-500'}`}>
                  {diag.serverHasKey ? 'Configured' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="text-stone-600">Active Key Source:</span>
                <span className="font-mono font-bold text-bible-800">{diag.activeKeySource}</span>
              </div>
              
              <button 
                onClick={handleTestConnection}
                disabled={isTesting}
                className={`w-full mt-2 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2
                  ${testResult 
                    ? (testResult.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                  }
                `}
              >
                {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : (testResult ? (testResult.success ? <Check className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />) : null)}
                {isTesting ? "Testing..." : (testResult ? testResult.message : "Test Connection to Google")}
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <p className="font-bold mb-1">Troubleshooting</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>If <strong>Quota Exceeded</strong>: The server key is busy. Add your own key below.</li>
                <li>If <strong>Server Key Missing</strong>: The admin needs to set <code>API_KEY</code> in Cloud Run.</li>
              </ul>
            </div>
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-xs font-bold text-bible-500 uppercase mb-2">
              Override with Your API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 pl-10 bg-stone-50 border border-bible-200 rounded-xl focus:ring-2 focus:ring-bible-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <Key className="absolute left-3 top-3.5 w-4 h-4 text-bible-400" />
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className="text-center text-sm font-bold text-green-600 animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-bible-800 text-white py-3 rounded-xl font-bold hover:bg-bible-900 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Reload
            </button>

            {savedKey && (
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-200"
                title="Remove Custom Key"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
