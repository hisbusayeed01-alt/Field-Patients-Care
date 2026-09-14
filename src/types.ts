export interface Patient {
  id: string; // Format: "PAT-XXXXXX"
  name: string;
  age: number;
  diagnosis: string;
  camp: string;
  block: string;
  household: string;
  landmark: string;
  createdAt: number; // Timestamp
}

export type ViewScreen = 'list' | 'create' | 'detail' | 'edit';

export interface PatientFilter {
  searchQuery: string;
  diagnosis: string;
  camp: string;
  sortBy: 'createdAt_desc' | 'createdAt_asc' | 'name_asc' | 'age_asc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
