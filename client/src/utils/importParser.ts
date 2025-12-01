import * as XLSX from 'xlsx';
import { ImportRow } from '@/types/import';
import { BetFormData, BetLegData } from '@/lib/schemas/betFormSchema';
import { BetStatus } from '@/types/betting';

/**
 * Parse a CSV file and return array of row objects
 */
export const parseCSVFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const workbook = XLSX.read(text, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};

/**
 * Parse an Excel file (.xlsx) and return array of row objects
 */
export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse file based on extension - automatically detects CSV or Excel
 */
export const parseFile = async (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSVFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else {
    throw new Error('Unsupported file format. Only CSV and Excel (.xlsx) files are allowed.');
  }
};

/**
 * Convert string value to boolean
 */
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'sim';
  }
  return false;
};

/**
 * Parse a single leg from raw CSV row data
 */
const parseLeg = (row: any): BetLegData => {
  return {
    amount: row['amount*']?.toString() || row['amount']?.toString() || '',
    odds: row['odds*']?.toString() || row['odds']?.toString() || '',
    homeTeam: row['homeTeam*'] || row['homeTeam'] || '',
    awayTeam: row['awayTeam*'] || row['awayTeam'] || '',
    sport: row['sport*'] || row['sport'] || 'Futebol',
    market: row['market*'] || row['market'] || '',
    league: row['league'] || '',
    matchTime: row['matchTime'] || '',
    isLive: parseBoolean(row['isLive']),
    strategy: row['strategy'] || '',
    hasBoost: parseBoolean(row['hasBoost']),
    originalOdds: row['originalOdds'] || '',
    boostPercentage: row['boostPercentage'] || '',
    usedCredits: parseBoolean(row['usedCredits']),
    creditsAmount: row['creditsAmount'] || '',
    hasCashout: parseBoolean(row['hasCashout']),
    cashoutValue: row['cashoutValue'] || '',
    cashoutTime: row['cashoutTime'] || '',
    hasEarlyPayout: parseBoolean(row['hasEarlyPayout']),
    isRiskFree: parseBoolean(row['isRiskFree']),
    riskFreeAmount: row['riskFreeAmount'] || '',
    protectionTypes: row['protectionTypes']
      ? row['protectionTypes'].split('|').map((p: string) => p.trim()).filter(Boolean)
      : [],
    status: (row['status*'] || row['status'] || 'pending') as BetStatus,
    finalScore: row['finalScore'] || '',
    resultTime: row['resultTime'] || '',
  };
};

/**
 * Group raw CSV rows by operation/description to create complete bets with legs
 */
export const groupLegsIntoBets = (rows: any[]): ImportRow[] => {
  // Group rows by operationNumber (preferred) or description
  const groups = new Map<string, any[]>();

  rows.forEach((row, index) => {
    // Use operationNumber if available, otherwise use description as grouping key
    const key = row['operationNumber'] || row['description*'] || row['description'] || `auto_${index}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  // Convert each group to ImportRow
  const importRows: ImportRow[] = [];
  let rowNumber = 1;

  groups.forEach((legRows, groupKey) => {
    // Sort by legNumber to ensure proper order
    legRows.sort((a, b) => {
      const legA = parseInt(a['legNumber*'] || a['legNumber'] || '1');
      const legB = parseInt(b['legNumber*'] || b['legNumber'] || '1');
      return legA - legB;
    });

    // Get common fields from first row
    const firstRow = legRows[0];

    // Parse tags from pipe-separated string
    const tags = firstRow['tags']
      ? firstRow['tags'].split('|').map((t: string) => t.trim()).filter(Boolean)
      : [];

    // Create BetFormData structure
    const betData: Partial<BetFormData> = {
      bookmaker: firstRow['bookmaker*'] || firstRow['bookmaker'] || '',
      date: firstRow['date*'] || firstRow['date'] || new Date().toISOString().split('T')[0],
      betType: (firstRow['betType*'] || firstRow['betType'] || 'simple') as 'simple' | 'multiple',
      operationNumber: firstRow['operationNumber'] || '',
      multipleQuantity: legRows.length.toString(),
      description: firstRow['description*'] || firstRow['description'] || '',
      stakeLogic: firstRow['stakeLogic'] || '',
      tags: tags.slice(0, 5), // Max 5 tags
      legs: legRows.map(parseLeg),
    };

    importRows.push({
      id: crypto.randomUUID(),
      rowNumber: rowNumber++,
      data: betData,
      validationErrors: [], // Will be populated by validator
      isValid: true, // Will be updated by validator
      status: 'pending',
    });
  });

  return importRows;
};

/**
 * Validate file size (max 5MB)
 */
export const validateFileSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'csv' || extension === 'xlsx' || extension === 'xls';
};

/**
 * Main parse function - parse file and group into bet rows
 */
export const parseImportFile = async (file: File): Promise<ImportRow[]> => {
  // Validate file
  if (!validateFileType(file)) {
    throw new Error('Tipo de arquivo inválido. Apenas CSV e Excel (.xlsx) são permitidos.');
  }

  if (!validateFileSize(file)) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
  }

  // Parse file
  const rawRows = await parseFile(file);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Arquivo vazio ou sem dados válidos.');
  }

  // Group legs into complete bets
  const importRows = groupLegsIntoBets(rawRows);

  return importRows;
};
