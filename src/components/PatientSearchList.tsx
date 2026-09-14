import React, { useMemo, useState } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  MapPin, 
  User, 
  Calendar, 
  Filter, 
  ChevronRight, 
  Activity, 
  Building2, 
  Clock 
} from 'lucide-react';
import { Patient } from '../types';

interface PatientSearchListProps {
  patients: Patient[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPatient: (patientId: string) => void;
  onAddNewPatient: () => void;
  isHighContrast: boolean;
  onSeedDemoData?: () => void;
}

export const PatientSearchList: React.FC<PatientSearchListProps> = ({
  patients,
  searchQuery,
  onSearchChange,
  onSelectPatient,
  onAddNewPatient,
  isHighContrast,
  onSeedDemoData,
}) => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('ALL');

  // Extract unique diagnoses for quick filter pills
  const availableDiagnoses = useMemo(() => {
    const set = new Set<string>();
    patients.forEach(p => {
      if (p.diagnosis) set.add(p.diagnosis);
    });
    return Array.from(set).sort();
  }, [patients]);

  // Instant reactive filtering by Patient Name or Patient ID as user types
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch =
        !query ||
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query);

      const matchesDiagnosis =
        selectedDiagnosis === 'ALL' || patient.diagnosis === selectedDiagnosis;

      return matchesSearch && matchesDiagnosis;
    });
  }, [patients, searchQuery, selectedDiagnosis]);

  // Format relative timestamp
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Color styling helper for diagnoses
  const getDiagnosisBadgeStyle = (diagnosis: string) => {
    if (isHighContrast) {
      return 'bg-black text-white border-2 border-black font-extrabold';
    }
    const lower = diagnosis.toLowerCase();
    if (lower.includes('malaria') || lower.includes('cholera')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (lower.includes('respiratory') || lower.includes('infection')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (lower.includes('antenatal') || lower.includes('pregnancy')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (lower.includes('malnutrition')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (lower.includes('hypertension') || lower.includes('diabetes')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Search & Primary Action Row */}
      <div 
        id="search-and-action-container" 
        className={`p-4 rounded-xl border shadow-xs ${
          isHighContrast 
            ? 'bg-yellow-50 border-2 border-black' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Prominent Search Bar */}
          <div className="relative flex-1">
            <label htmlFor="patient-search-input" className="sr-only">
              Search by Patient Name or Patient ID
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className={`w-5 h-5 ${isHighContrast ? 'text-black' : 'text-slate-500'}`} />
            </div>
            <input
              id="patient-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Patient Name or ID (e.g., PAT-XXXXXX)..."
              autoComplete="off"
              className={`w-full pl-10 pr-10 py-3 rounded-lg text-base transition outline-none font-medium ${
                isHighContrast
                  ? 'bg-white text-black border-2 border-black focus:border-yellow-600 focus:ring-2 focus:ring-yellow-400 placeholder:text-slate-600'
                  : 'bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                id="clear-search-btn"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                aria-label="Clear search input"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Action Top Button: + Add New Patient */}
          <button
            id="top-add-patient-btn"
            onClick={onAddNewPatient}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-base shadow-sm active:scale-98 transition shrink-0 ${
              isHighContrast
                ? 'bg-black text-yellow-300 hover:bg-zinc-800 border-2 border-black'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            title="Register a new patient"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Patient</span>
          </button>
        </div>

        {/* Quick Diagnosis Filter Chips */}
        {availableDiagnoses.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>
            <button
              onClick={() => setSelectedDiagnosis('ALL')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedDiagnosis === 'ALL'
                  ? isHighContrast
                    ? 'bg-black text-white font-bold'
                    : 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({patients.length})
            </button>
            {availableDiagnoses.map((diag) => {
              const count = patients.filter(p => p.diagnosis === diag).length;
              const active = selectedDiagnosis === diag;
              return (
                <button
                  key={diag}
                  onClick={() => setSelectedDiagnosis(active ? 'ALL' : diag)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                    active
                      ? isHighContrast
                        ? 'bg-black text-white font-bold'
                        : 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {diag} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header / Counter */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-medium">
        <span>
          Showing <strong className="text-slate-900">{filteredPatients.length}</strong> of{' '}
          <strong className="text-slate-900">{patients.length}</strong> registered patients
        </span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Reset query
          </button>
        )}
      </div>

      {/* Patient Cards List */}
      {filteredPatients.length === 0 ? (
        <div 
          id="empty-patient-list"
          className={`text-center py-12 px-4 rounded-xl border ${
            isHighContrast 
              ? 'bg-white border-2 border-black' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {patients.length === 0 ? 'No Patients Registered Yet' : 'No Matching Patients Found'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {patients.length === 0
              ? 'Start recording field clinic patients completely offline. All data is saved directly to your device.'
              : `No patients match "${searchQuery}". Check the name spelling or ID format (e.g. PAT-XXXXXX).`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAddNewPatient}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition flex items-center gap-2 ${
                isHighContrast
                  ? 'bg-black text-yellow-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Patient</span>
            </button>
            {patients.length === 0 && onSeedDemoData && (
              <button
                onClick={onSeedDemoData}
                className="px-4 py-2.5 rounded-lg font-semibold text-sm border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
              >
                Load Sample Field Records
              </button>
            )}
          </div>
        </div>
      ) : (
        <div 
          id="patient-card-list" 
          className="space-y-3"
          role="feed"
          aria-label="Patient records list"
        >
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              id={`patient-card-${patient.id}`}
              onClick={() => onSelectPatient(patient.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPatient(patient.id);
                }
              }}
              className={`group w-full p-4 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] hover:shadow-md ${
                isHighContrast
                  ? 'bg-white border-2 border-black hover:border-black hover:bg-yellow-50'
                  : 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                
                {/* Left Info: Name & ID Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Patient ID badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider ${
                      isHighContrast
                        ? 'bg-black text-yellow-300'
                        : 'bg-slate-900 text-emerald-300'
                    }`}>
                      {patient.id}
                    </span>

                    {/* Age Badge */}
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {patient.age} yrs
                    </span>

                    {/* Registration Time */}
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(patient.createdAt)}
                    </span>
                  </div>

                  {/* Patient Name */}
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors truncate">
                    {patient.name}
                  </h2>

                  {/* Diagnosis Tag */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${getDiagnosisBadgeStyle(patient.diagnosis)}`}>
                      <Activity className="w-3 h-3" />
                      {patient.diagnosis}
                    </span>
                  </div>

                  {/* Camp & Block details */}
                  {(patient.camp || patient.block || patient.household) && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      {patient.camp && (
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{patient.camp}</span>
                        </span>
                      )}
                      {patient.block && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{patient.block}</span>
                        </span>
                      )}
                      {patient.household && (
                        <span className="text-slate-500 font-mono text-[11px]">
                          {patient.household}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Arrow / Action indicator */}
                <div className="self-center pl-2 text-slate-400 group-hover:text-emerald-700 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    isHighContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 group-hover:bg-emerald-100'
                  }`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (Mobile-first Quick Access) */}
      <button
        id="floating-add-patient-btn"
        onClick={onAddNewPatient}
        className={`fixed bottom-6 right-6 z-40 sm:hidden flex items-center justify-center gap-2 p-4 rounded-full shadow-xl active:scale-95 transition ${
          isHighContrast
            ? 'bg-black text-yellow-300 border-2 border-yellow-400'
            : 'bg-emerald-700 text-white hover:bg-emerald-800'
        }`}
        aria-label="Add New Patient"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};
