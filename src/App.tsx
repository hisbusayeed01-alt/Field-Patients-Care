import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { PatientSearchList } from './components/PatientSearchList';
import { PatientForm } from './components/PatientForm';
import { PatientDetail } from './components/PatientDetail';
import { Toast } from './components/Toast';
import { Patient, ViewScreen, ToastMessage } from './types';
import { 
  getAllPatients, 
  savePatient, 
  deletePatient, 
  generatePatientId, 
  exportToCSV, 
  seedInitialDataIfEmpty,
  INITIAL_FIELD_PATIENTS
} from './lib/db';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fieldcare_high_contrast') === 'true';
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load patients from IndexedDB / LocalStorage
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loaded = await seedInitialDataIfEmpty();
        setPatients(loaded);
      } catch (err) {
        console.error('Error initializing database:', err);
        setPatients(INITIAL_FIELD_PATIENTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      message,
    });
  }, []);

  const handleToggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    try {
      localStorage.setItem('fieldcare_high_contrast', String(next));
    } catch (e) {
      console.warn('Unable to persist contrast preference', e);
    }
  };

  // Header CSV Export
  const handleExportCSV = useCallback(() => {
    if (patients.length === 0) {
      showToast('No patient records available to export.', 'info');
      return;
    }
    exportToCSV(patients);
    showToast(`Successfully exported ${patients.length} patient records to patients_export.csv`, 'success');
  }, [patients, showToast]);

  // Selected patient object
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Save new patient or update existing
  const handleSavePatient = async (
    patientData: Omit<Patient, 'id' | 'createdAt'>, 
    existingId?: string
  ) => {
    const existingIds = new Set<string>(patients.map(p => p.id));
    const isUpdating = !!existingId;
    const finalId = isUpdating ? existingId : generatePatientId(existingIds);
    const createdAt = isUpdating && selectedPatient 
      ? selectedPatient.createdAt 
      : Date.now();

    const patientRecord: Patient = {
      ...patientData,
      id: finalId,
      createdAt,
    };

    // Save to IndexedDB / localStorage
    await savePatient(patientRecord);

    // Update state
    setPatients(prev => {
      const idx = prev.findIndex(p => p.id === finalId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = patientRecord;
        return updated;
      } else {
        return [patientRecord, ...prev];
      }
    });

    showToast(
      isUpdating 
        ? `Patient record ${finalId} updated successfully.` 
        : `Patient ${patientRecord.name} (${finalId}) saved to local storage.`,
      'success'
    );

    // Redirect to list view
    setCurrentScreen('list');
    setSelectedPatientId(finalId);
  };

  // Delete patient
  const handleDeletePatient = async (patientId: string) => {
    await deletePatient(patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setSelectedPatientId(null);
    setCurrentScreen('list');
    showToast(`Patient record ${patientId} deleted.`, 'info');
  };

  // Seed sample field records if requested
  const handleSeedDemoData = async () => {
    for (const patient of INITIAL_FIELD_PATIENTS) {
      await savePatient(patient);
    }
    const refreshed = await getAllPatients();
    setPatients(refreshed);
    showToast('Loaded sample field clinic records.', 'success');
  };

  return (
    <div 
      id="field-care-app" 
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isHighContrast ? 'bg-zinc-100 text-black' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header / Navigation Bar */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          if (screen === 'list') {
            setSelectedPatientId(null);
          }
        }}
        totalPatientsCount={patients.length}
        onExportCSV={handleExportCSV}
        isHighContrast={isHighContrast}
        onToggleHighContrast={handleToggleHighContrast}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">
              Initializing offline local database...
            </p>
          </div>
        ) : (
          <>
            {/* Screen 1: Patient Search & List View */}
            {currentScreen === 'list' && (
              <PatientSearchList
                patients={patients}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectPatient={(id) => {
                  setSelectedPatientId(id);
                  setCurrentScreen('detail');
                }}
                onAddNewPatient={() => {
                  setSelectedPatientId(null);
                  setCurrentScreen('create');
                }}
                isHighContrast={isHighContrast}
                onSeedDemoData={handleSeedDemoData}
              />
            )}

            {/* Screen 2: Registration Form (Add Patient) */}
            {currentScreen === 'create' && (
              <PatientForm
                initialPatient={null}
                onSave={handleSavePatient}
                onCancel={() => setCurrentScreen('list')}
                isHighContrast={isHighContrast}
              />
            )}

            {/* Screen 2 Edit Mode (Optional auxiliary for field workers) */}
            {currentScreen === 'edit' && selectedPatient && (
              <PatientForm
                initialPatient={selectedPatient}
                onSave={handleSavePatient}
                onCancel={() => setCurrentScreen('detail')}
                isHighContrast={isHighContrast}
              />
            )}

            {/* Screen 3: Patient Detail Profile View */}
            {currentScreen === 'detail' && selectedPatient && (
              <PatientDetail
                patient={selectedPatient}
                onBack={() => {
                  setCurrentScreen('list');
                }}
                onEdit={() => {
                  setCurrentScreen('edit');
                }}
                onDelete={handleDeletePatient}
                isHighContrast={isHighContrast}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Offline Ready Footer */}
      <footer className="py-3 px-4 border-t border-slate-200/80 text-center text-xs text-slate-400 select-none">
        <p>Field Care Patients • 100% Offline Browser IndexedDB Storage • Zero Cloud/Server Calls Required</p>
      </footer>

      {/* Floating Feedback Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
