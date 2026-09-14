import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  MapPin, 
  User, 
  Activity, 
  Home, 
  Compass, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  Edit3, 
  Trash2,
  AlertTriangle,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Patient } from '../types';
import { exportToCSV } from '../lib/db';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => Promise<void>;
  isHighContrast: boolean;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onBack,
  onEdit,
  onDelete,
  isHighContrast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSingleExport = () => {
    exportToCSV([patient]);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(patient.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Human friendly dates
  const dateObj = new Date(patient.createdAt);
  const formattedFullDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-2xl mx-auto pb-16">
      
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Required "Back to List" Navigation Button */}
        <button
          id="back-to-list-detail-btn"
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 ${
            isHighContrast
              ? 'bg-black text-yellow-300 border-2 border-black hover:bg-zinc-800'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-xs'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            id="detail-export-csv-btn"
            onClick={handleSingleExport}
            title="Download CSV for this patient"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          
          <button
            id="detail-edit-patient-btn"
            onClick={() => onEdit(patient)}
            title="Edit patient details"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            id="detail-delete-patient-btn"
            onClick={() => setShowDeleteModal(true)}
            title="Delete patient record"
            className="p-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
            aria-label="Delete patient"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Card displaying EVERY field */}
      <div 
        id="patient-profile-card"
        className={`rounded-2xl border shadow-sm overflow-hidden ${
          isHighContrast
            ? 'bg-white border-2 border-black'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header Ribbon with ID and Status */}
        <div className={`p-6 border-b ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-black'
            : 'bg-emerald-900 text-white'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            
            {/* Auto-generated Unique ID Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-md text-sm font-mono font-bold tracking-wider ${
                isHighContrast
                  ? 'bg-black text-yellow-300'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {patient.id}
              </span>
              
              <button
                type="button"
                onClick={handleCopyId}
                className={`p-1.5 rounded transition ${
                  isHighContrast
                    ? 'hover:bg-yellow-500 text-black'
                    : 'hover:bg-emerald-800 text-emerald-200'
                }`}
                title="Copy Patient ID to clipboard"
                aria-label="Copy Patient ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              {copied && (
                <span className="text-xs font-semibold animate-pulse">Copied!</span>
              )}
            </div>

            {/* Offline Verified Tag */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              isHighContrast 
                ? 'bg-black text-white' 
                : 'bg-emerald-800/80 text-emerald-100 border border-emerald-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Local Record
            </span>
          </div>

          {/* Patient Primary Name & Age */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            {patient.name}
          </h1>
          <p className={`text-sm mt-1 font-medium ${
            isHighContrast ? 'text-black' : 'text-emerald-100'
          }`}>
            Patient Age: <strong className="text-base">{patient.age} years old</strong>
          </p>
        </div>

        {/* Detailed Fields List */}
        <div className="p-6 space-y-6 divide-y divide-slate-100">
          
          {/* Field 1: Diagnosis */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Primary Diagnosis</span>
            </span>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border ${
              isHighContrast
                ? 'bg-black text-yellow-300 border-black'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}>
              <span>{patient.diagnosis}</span>
            </div>
          </div>

          {/* Field 2 & 3: Camp & Block */}
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Camp / Settlement</span>
              </span>
              <p className="text-base font-bold text-slate-900">
                {patient.camp || <span className="text-slate-400 font-normal italic">Not recorded</span>}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Block / Sector</span>
              </span>
              <p className="text-base font-bold text-slate-900">
                {patient.block || <span className="text-slate-400 font-normal italic">Not recorded</span>}
              </p>
            </div>
          </div>

          {/* Field 4 & 5: Household & Nearby Landmark */}
          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Home className="w-3.5 h-3.5 text-slate-500" />
                <span>Household Number</span>
              </span>
              <p className="text-base font-mono font-bold text-slate-900">
                {patient.household || <span className="text-slate-400 font-normal font-sans italic">Not recorded</span>}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Nearby Landmark</span>
              </span>
              <p className="text-base font-bold text-slate-900">
                {patient.landmark || <span className="text-slate-400 font-normal italic">Not recorded</span>}
              </p>
            </div>
          </div>

          {/* Field 6: Registration Timestamp */}
          <div className="pt-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Registration Timestamp</span>
            </span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{formattedFullDate} at {formattedTime}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Unix: {patient.createdAt}
              </span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onBack}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm transition text-center ${
              isHighContrast
                ? 'bg-black text-white hover:bg-zinc-800'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            ← Back to Patient Search & List
          </button>

          <button
            onClick={handleSingleExport}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm shadow-xs transition ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-2 border-black'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV Record</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Delete Patient Record?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to remove record <strong className="font-mono">{patient.id}</strong> ({patient.name}) from local storage? This cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
