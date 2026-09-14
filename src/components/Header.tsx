import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  SunMedium, 
  HeartPulse 
} from 'lucide-react';
import { ViewScreen } from '../types';

interface HeaderProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  totalPatientsCount: number;
  onExportCSV: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  totalPatientsCount,
  onExportCSV,
  isHighContrast,
  onToggleHighContrast,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header 
      id="app-header" 
      className={`sticky top-0 z-30 border-b shadow-sm transition-colors ${
        isHighContrast 
          ? 'bg-black text-white border-yellow-400' 
          : 'bg-emerald-900 text-white border-emerald-950'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand & Title */}
          <div 
            id="brand-section" 
            onClick={() => onNavigate('list')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            aria-label="Return to patient list"
          >
            <div className={`p-2 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
              isHighContrast 
                ? 'bg-yellow-400 text-black font-bold' 
                : 'bg-emerald-700 text-emerald-100'
            }`}>
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                Field Care Patients
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 font-medium ${
                  isHighContrast ? 'text-yellow-300' : 'text-emerald-200'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Offline Local DB
                </span>
                <span className="opacity-40">•</span>
                <span className="opacity-90">
                  {totalPatientsCount} {totalPatientsCount === 1 ? 'record' : 'records'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* High Contrast / Outdoor Sunlight Mode */}
            <button
              id="high-contrast-toggle-btn"
              onClick={onToggleHighContrast}
              title={isHighContrast ? 'Switch to Standard Palette' : 'Switch to Outdoor High-Contrast Mode'}
              aria-label="Toggle Outdoor Sunlight Contrast"
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : 'bg-emerald-800/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <SunMedium className="w-4 h-4" />
              <span className="hidden md:inline">
                {isHighContrast ? 'Standard' : 'Sunlight Mode'}
              </span>
            </button>

            {/* Offline Status Pill */}
            <div 
              id="connectivity-status-pill"
              title={isOnline ? 'Network available. All records store locally first.' : 'Offline mode active. Zero connection needed.'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                !isOnline 
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                  : 'bg-emerald-800/60 text-emerald-200 border-emerald-700/50'
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>Offline Active</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Offline Ready</span>
                </>
              )}
            </div>

            {/* Export CSV Button (Explicitly Required in Header) */}
            <button
              id="header-export-csv-btn"
              onClick={onExportCSV}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 border ${
                isHighContrast
                  ? 'bg-white text-black border-yellow-400 hover:bg-yellow-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
              }`}
              title="Download all stored patient records as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
