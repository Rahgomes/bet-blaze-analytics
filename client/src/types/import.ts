import { BetFormData } from '@/lib/schemas/betFormSchema';

/**
 * Import Session - tracks each import operation
 * Stores metadata about a bulk import including file name, dates, and linked bets
 */
export interface ImportSession {
  id: string;
  fileName: string;
  importDate: string; // ISO string
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  betIds: string[]; // IDs of bets created from this import
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Import Row - represents a single row in the import file during preview
 * Contains parsed data, validation results, and temporary state
 */
export interface ImportRow {
  id: string; // Temporary ID for preview management
  rowNumber: number; // Original row number in file (for user reference)
  data: Partial<BetFormData>; // Parsed data matching BetFormData structure
  validationErrors: ValidationError[];
  isValid: boolean;
  status: 'pending' | 'ready' | 'error';
}

/**
 * Validation Error - describes a specific validation failure
 */
export interface ValidationError {
  field: string; // Field name that failed validation
  message: string; // Human-readable error message
  severity: 'error' | 'warning'; // Error blocks import, warning is informational
}

/**
 * Validation Result - complete validation output for a row
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Import Preview State - complete state for the preview page
 * Stored in sessionStorage during preview workflow
 */
export interface ImportPreviewState {
  sessionId: string; // Temporary session ID (becomes ImportSession.id on confirm)
  fileName: string;
  fileSize: number;
  uploadDate: string; // ISO string
  rows: ImportRow[];
  filters: ImportPreviewFilters;
}

/**
 * Import Preview Filters - filter options for preview table
 */
export interface ImportPreviewFilters {
  searchTerm: string;
  showOnlyErrors: boolean;
  showOnlyValid: boolean;
  bookmaker?: string;
  betType?: 'simple' | 'multiple';
  status?: 'pending' | 'won' | 'lost' | 'void';
}

/**
 * Import Statistics - summary stats for preview page
 */
export interface ImportStatistics {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  pendingRows: number;
  totalAmount: number;
  bookmakerCounts: Record<string, number>;
}

/**
 * Import History Filters - filter options for history page
 */
export interface ImportHistoryFilters {
  searchTerm: string; // Search by file name
  dateFrom?: Date;
  dateTo?: Date;
  minBets?: number;
  maxBets?: number;
}
