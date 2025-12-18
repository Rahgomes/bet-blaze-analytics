import * as XLSX from 'xlsx';

/**
 * Column definitions for the import template
 */
const TEMPLATE_COLUMNS = [
  // Required columns
  { name: 'bookmaker*', key: 'bookmaker', description: 'Casa de apostas' },
  { name: 'date*', key: 'date', description: 'Data (YYYY-MM-DD)' },
  { name: 'betType*', key: 'betType', description: 'Tipo (simple/multiple)' },
  { name: 'legNumber*', key: 'legNumber', description: 'Número da leg (1, 2, 3...)' },
  { name: 'amount*', key: 'amount', description: 'Valor apostado' },
  { name: 'odds*', key: 'odds', description: 'Odd' },
  { name: 'homeTeam*', key: 'homeTeam', description: 'Time mandante' },
  { name: 'awayTeam*', key: 'awayTeam', description: 'Time visitante' },
  { name: 'sport*', key: 'sport', description: 'Esporte' },
  { name: 'market*', key: 'market', description: 'Mercado' },
  { name: 'status*', key: 'status', description: 'Status (pending/won/lost/void)' },
  { name: 'description*', key: 'description', description: 'Descrição da aposta' },

  // Optional columns
  { name: 'operationNumber', key: 'operationNumber', description: 'Número da operação' },
  { name: 'league', key: 'league', description: 'Liga/Campeonato' },
  { name: 'matchTime', key: 'matchTime', description: 'Horário (YYYY-MM-DD HH:mm)' },
  { name: 'isLive', key: 'isLive', description: 'Ao vivo (true/false)' },
  { name: 'strategy', key: 'strategy', description: 'Estratégia' },
  { name: 'stakeLogic', key: 'stakeLogic', description: 'Lógica do stake' },
  { name: 'tags', key: 'tags', description: 'Tags separadas por | (ex: Value Bet|Linha Segura)' },
  { name: 'hasBoost', key: 'hasBoost', description: 'Tem boost? (true/false)' },
  { name: 'originalOdds', key: 'originalOdds', description: 'Odd original (se hasBoost=true)' },
  { name: 'boostPercentage', key: 'boostPercentage', description: '% de boost (se hasBoost=true)' },
  { name: 'usedCredits', key: 'usedCredits', description: 'Usou créditos? (true/false)' },
  { name: 'creditsAmount', key: 'creditsAmount', description: 'Valor em créditos (se usedCredits=true)' },
  { name: 'hasCashout', key: 'hasCashout', description: 'Fez cashout? (true/false)' },
  { name: 'cashoutValue', key: 'cashoutValue', description: 'Valor do cashout (se hasCashout=true)' },
  { name: 'cashoutTime', key: 'cashoutTime', description: 'Horário do cashout (se hasCashout=true)' },
  { name: 'isRiskFree', key: 'isRiskFree', description: 'Sem risco? (true/false)' },
  { name: 'riskFreeAmount', key: 'riskFreeAmount', description: 'Valor sem risco (se isRiskFree=true)' },
  { name: 'hasEarlyPayout', key: 'hasEarlyPayout', description: 'Pagamento antecipado? (true/false)' },
  { name: 'protectionTypes', key: 'protectionTypes', description: 'Proteções separadas por | (ex: DC|DNB)' },
  { name: 'finalScore', key: 'finalScore', description: 'Placar final' },
  { name: 'resultTime', key: 'resultTime', description: 'Horário do resultado' },
];

/**
 * Example rows for the template
 */
const EXAMPLE_ROWS = [
  // Simple bet example
  {
    'bookmaker*': 'Bet365',
    'date*': '2024-12-01',
    'betType*': 'simple',
    'legNumber*': '1',
    'amount*': '50.00',
    'odds*': '1.85',
    'homeTeam*': 'Flamengo',
    'awayTeam*': 'Palmeiras',
    'sport*': 'Futebol',
    'market*': 'Resultado Final',
    'status*': 'won',
    'description*': 'Vitória do Flamengo no Maracanã',
    'operationNumber': 'OP001',
    'league': 'Brasileirão Série A',
    'matchTime': '2024-12-01 16:00',
    'isLive': 'false',
    'strategy': 'Value Betting',
    'stakeLogic': '2% da banca - odd favorável',
    'tags': 'Value Bet|Linha Segura',
    'hasBoost': 'false',
    'originalOdds': '',
    'boostPercentage': '',
    'usedCredits': 'false',
    'creditsAmount': '',
    'hasCashout': 'false',
    'cashoutValue': '',
    'cashoutTime': '',
    'isRiskFree': 'false',
    'riskFreeAmount': '',
    'hasEarlyPayout': 'false',
    'protectionTypes': '',
    'finalScore': '2-1',
    'resultTime': '2024-12-01 17:50',
  },
  // Multiple bet example - leg 1
  {
    'bookmaker*': 'Betfair',
    'date*': '2024-12-02',
    'betType*': 'multiple',
    'legNumber*': '1',
    'amount*': '30.00',
    'odds*': '2.10',
    'homeTeam*': 'Corinthians',
    'awayTeam*': 'São Paulo',
    'sport*': 'Futebol',
    'market*': 'Ambas Marcam',
    'status*': 'won',
    'description*': 'Múltipla Clássico Paulista',
    'operationNumber': 'OP002',
    'league': 'Brasileirão Série A',
    'matchTime': '2024-12-02 18:00',
    'isLive': 'false',
    'strategy': 'Kelly Criterion',
    'stakeLogic': '1.5% da banca - múltipla segura',
    'tags': 'Múltipla|Alta Convicção',
    'hasBoost': 'true',
    'originalOdds': '1.95',
    'boostPercentage': '7.7',
    'usedCredits': 'false',
    'creditsAmount': '',
    'hasCashout': 'false',
    'cashoutValue': '',
    'cashoutTime': '',
    'isRiskFree': 'false',
    'riskFreeAmount': '',
    'hasEarlyPayout': 'false',
    'protectionTypes': '',
    'finalScore': '1-1',
    'resultTime': '2024-12-02 19:50',
  },
  // Multiple bet example - leg 2
  {
    'bookmaker*': 'Betfair',
    'date*': '2024-12-02',
    'betType*': 'multiple',
    'legNumber*': '2',
    'amount*': '30.00',
    'odds*': '1.75',
    'homeTeam*': 'Atlético-MG',
    'awayTeam*': 'Cruzeiro',
    'sport*': 'Futebol',
    'market*': 'Mais de 2.5 gols',
    'status*': 'won',
    'description*': 'Múltipla Clássico Paulista',
    'operationNumber': 'OP002',
    'league': 'Brasileirão Série A',
    'matchTime': '2024-12-02 20:00',
    'isLive': 'false',
    'strategy': 'Kelly Criterion',
    'stakeLogic': '1.5% da banca - múltipla segura',
    'tags': 'Múltipla|Alta Convicção',
    'hasBoost': 'false',
    'originalOdds': '',
    'boostPercentage': '',
    'usedCredits': 'false',
    'creditsAmount': '',
    'hasCashout': 'false',
    'cashoutValue': '',
    'cashoutTime': '',
    'isRiskFree': 'false',
    'riskFreeAmount': '',
    'hasEarlyPayout': 'false',
    'protectionTypes': '',
    'finalScore': '2-2',
    'resultTime': '2024-12-02 21:50',
  },
];

/**
 * Generate and download CSV template
 */
export const generateCSVTemplate = (): void => {
  const headers = TEMPLATE_COLUMNS.map((col) => col.name);
  const rows = EXAMPLE_ROWS.map((row) =>
    headers.map((header) => row[header as keyof typeof row] || '')
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Apostas');

  XLSX.writeFile(workbook, 'template_apostas.csv');
};

/**
 * Generate and download Excel template with formatting
 */
export const generateExcelTemplate = (): void => {
  const headers = TEMPLATE_COLUMNS.map((col) => col.name);
  const descriptions = TEMPLATE_COLUMNS.map((col) => col.description);
  const rows = EXAMPLE_ROWS.map((row) =>
    headers.map((header) => row[header as keyof typeof row] || '')
  );

  // Create worksheet with headers, descriptions row, and example data
  const data = [
    headers,
    descriptions, // Second row with descriptions
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for better readability
  const columnWidths = headers.map((_, index) => {
    if (index === 0) return { wch: 15 }; // bookmaker
    if (index === 11) return { wch: 30 }; // description
    if (index === 17) return { wch: 25 }; // stakeLogic
    return { wch: 12 };
  });

  worksheet['!cols'] = columnWidths;

  // Apply styles to header row (row 1) - bold
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'CCCCCC' } },
    };
  }

  // Apply styles to description row (row 2) - italic
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { italic: true },
      fill: { fgColor: { rgb: 'F0F0F0' } },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Apostas');

  XLSX.writeFile(workbook, 'template_apostas.xlsx');
};

/**
 * Get column mapping for display purposes
 */
export const getColumnMapping = () => {
  const required = TEMPLATE_COLUMNS.filter((col) => col.name.includes('*'));
  const optional = TEMPLATE_COLUMNS.filter((col) => !col.name.includes('*'));

  return { required, optional };
};
