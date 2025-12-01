import { ImportRow, ValidationError, ValidationResult } from '@/types/import';
import { BetFormData } from '@/lib/schemas/betFormSchema';

/**
 * Validate required fields in bet data
 */
const validateRequiredFields = (data: Partial<BetFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Top-level required fields
  if (!data.bookmaker || data.bookmaker.trim() === '') {
    errors.push({
      field: 'bookmaker',
      message: 'Casa de apostas é obrigatória',
      severity: 'error',
    });
  }

  if (!data.date || data.date.trim() === '') {
    errors.push({
      field: 'date',
      message: 'Data é obrigatória',
      severity: 'error',
    });
  }

  if (!data.betType) {
    errors.push({
      field: 'betType',
      message: 'Tipo de aposta é obrigatório',
      severity: 'error',
    });
  }

  if (!data.description || data.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Descrição é obrigatória',
      severity: 'error',
    });
  }

  // Validate legs exist
  if (!data.legs || data.legs.length === 0) {
    errors.push({
      field: 'legs',
      message: 'Pelo menos uma leg é obrigatória',
      severity: 'error',
    });
    return errors; // Can't validate legs if they don't exist
  }

  // Validate each leg
  data.legs.forEach((leg, index) => {
    if (!leg.amount || leg.amount.trim() === '') {
      errors.push({
        field: `legs[${index}].amount`,
        message: `Leg ${index + 1}: Valor é obrigatório`,
        severity: 'error',
      });
    }

    if (!leg.odds || leg.odds.trim() === '') {
      errors.push({
        field: `legs[${index}].odds`,
        message: `Leg ${index + 1}: Odd é obrigatória`,
        severity: 'error',
      });
    }

    if (!leg.homeTeam || leg.homeTeam.trim() === '') {
      errors.push({
        field: `legs[${index}].homeTeam`,
        message: `Leg ${index + 1}: Time mandante é obrigatório`,
        severity: 'error',
      });
    }

    if (!leg.awayTeam || leg.awayTeam.trim() === '') {
      errors.push({
        field: `legs[${index}].awayTeam`,
        message: `Leg ${index + 1}: Time visitante é obrigatório`,
        severity: 'error',
      });
    }

    if (!leg.sport || leg.sport.trim() === '') {
      errors.push({
        field: `legs[${index}].sport`,
        message: `Leg ${index + 1}: Esporte é obrigatório`,
        severity: 'error',
      });
    }

    if (!leg.market || leg.market.trim() === '') {
      errors.push({
        field: `legs[${index}].market`,
        message: `Leg ${index + 1}: Mercado é obrigatório`,
        severity: 'error',
      });
    }

    if (!leg.status) {
      errors.push({
        field: `legs[${index}].status`,
        message: `Leg ${index + 1}: Status é obrigatório`,
        severity: 'error',
      });
    }
  });

  return errors;
};

/**
 * Validate data types and formats
 */
const validateTypes = (data: Partial<BetFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate date format (YYYY-MM-DD)
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push({
        field: 'date',
        message: 'Data deve estar no formato YYYY-MM-DD',
        severity: 'error',
      });
    } else {
      // Check if date is valid
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        errors.push({
          field: 'date',
          message: 'Data inválida',
          severity: 'error',
        });
      }
    }
  }

  // Validate betType
  if (data.betType && !['simple', 'multiple'].includes(data.betType)) {
    errors.push({
      field: 'betType',
      message: 'Tipo de aposta deve ser "simple" ou "multiple"',
      severity: 'error',
    });
  }

  // Validate tags limit
  if (data.tags && data.tags.length > 5) {
    errors.push({
      field: 'tags',
      message: 'Máximo de 5 tags permitidas',
      severity: 'error',
    });
  }

  // Validate leg data types
  if (data.legs) {
    data.legs.forEach((leg, index) => {
      // Amount must be a valid positive number
      if (leg.amount) {
        const amount = parseFloat(leg.amount);
        if (isNaN(amount) || amount <= 0) {
          errors.push({
            field: `legs[${index}].amount`,
            message: `Leg ${index + 1}: Valor deve ser um número positivo`,
            severity: 'error',
          });
        }
      }

      // Odds must be a valid positive number
      if (leg.odds) {
        const odds = parseFloat(leg.odds);
        if (isNaN(odds) || odds <= 0) {
          errors.push({
            field: `legs[${index}].odds`,
            message: `Leg ${index + 1}: Odd deve ser um número positivo`,
            severity: 'error',
          });
        }
      }

      // Status must be valid
      if (leg.status && !['pending', 'won', 'lost', 'void'].includes(leg.status)) {
        errors.push({
          field: `legs[${index}].status`,
          message: `Leg ${index + 1}: Status deve ser "pending", "won", "lost" ou "void"`,
          severity: 'error',
        });
      }

      // Validate numeric fields when present
      if (leg.originalOdds && leg.originalOdds !== '') {
        const odds = parseFloat(leg.originalOdds);
        if (isNaN(odds) || odds <= 0) {
          errors.push({
            field: `legs[${index}].originalOdds`,
            message: `Leg ${index + 1}: Odd original deve ser um número positivo`,
            severity: 'error',
          });
        }
      }

      if (leg.boostPercentage && leg.boostPercentage !== '') {
        const boost = parseFloat(leg.boostPercentage);
        if (isNaN(boost) || boost < 0) {
          errors.push({
            field: `legs[${index}].boostPercentage`,
            message: `Leg ${index + 1}: Percentual de boost deve ser um número não-negativo`,
            severity: 'error',
          });
        }
      }

      if (leg.creditsAmount && leg.creditsAmount !== '') {
        const credits = parseFloat(leg.creditsAmount);
        if (isNaN(credits) || credits <= 0) {
          errors.push({
            field: `legs[${index}].creditsAmount`,
            message: `Leg ${index + 1}: Valor de créditos deve ser um número positivo`,
            severity: 'error',
          });
        }
      }

      if (leg.cashoutValue && leg.cashoutValue !== '') {
        const cashout = parseFloat(leg.cashoutValue);
        if (isNaN(cashout) || cashout <= 0) {
          errors.push({
            field: `legs[${index}].cashoutValue`,
            message: `Leg ${index + 1}: Valor de cashout deve ser um número positivo`,
            severity: 'error',
          });
        }
      }

      if (leg.riskFreeAmount && leg.riskFreeAmount !== '') {
        const riskFree = parseFloat(leg.riskFreeAmount);
        if (isNaN(riskFree) || riskFree <= 0) {
          errors.push({
            field: `legs[${index}].riskFreeAmount`,
            message: `Leg ${index + 1}: Valor sem risco deve ser um número positivo`,
            severity: 'error',
          });
        }
      }
    });
  }

  return errors;
};

/**
 * Validate conditional requirements (similar to betFormSchema refinements)
 */
const validateConditional = (data: Partial<BetFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.legs) return errors;

  data.legs.forEach((leg, index) => {
    // If hasBoost is true, originalOdds and boostPercentage are required
    if (leg.hasBoost) {
      if (!leg.originalOdds || leg.originalOdds.trim() === '') {
        errors.push({
          field: `legs[${index}].originalOdds`,
          message: `Leg ${index + 1}: Odd original é obrigatória quando boost está ativo`,
          severity: 'error',
        });
      }
      if (!leg.boostPercentage || leg.boostPercentage.trim() === '') {
        errors.push({
          field: `legs[${index}].boostPercentage`,
          message: `Leg ${index + 1}: Percentual de boost é obrigatório quando boost está ativo`,
          severity: 'error',
        });
      }
    }

    // If usedCredits is true, creditsAmount is required
    if (leg.usedCredits) {
      if (!leg.creditsAmount || leg.creditsAmount.trim() === '') {
        errors.push({
          field: `legs[${index}].creditsAmount`,
          message: `Leg ${index + 1}: Valor dos créditos é obrigatório quando créditos foram utilizados`,
          severity: 'error',
        });
      }
    }

    // If hasCashout is true, cashoutValue and cashoutTime are required
    if (leg.hasCashout) {
      if (!leg.cashoutValue || leg.cashoutValue.trim() === '') {
        errors.push({
          field: `legs[${index}].cashoutValue`,
          message: `Leg ${index + 1}: Valor do cashout é obrigatório`,
          severity: 'error',
        });
      }
      if (!leg.cashoutTime || leg.cashoutTime.trim() === '') {
        errors.push({
          field: `legs[${index}].cashoutTime`,
          message: `Leg ${index + 1}: Horário do cashout é obrigatório`,
          severity: 'error',
        });
      }
    }

    // If isRiskFree is true, riskFreeAmount is required
    if (leg.isRiskFree) {
      if (!leg.riskFreeAmount || leg.riskFreeAmount.trim() === '') {
        errors.push({
          field: `legs[${index}].riskFreeAmount`,
          message: `Leg ${index + 1}: Valor da aposta sem risco é obrigatório`,
          severity: 'error',
        });
      }
    }
  });

  return errors;
};

/**
 * Validate multi-leg specific requirements
 */
const validateMultiLeg = (data: Partial<BetFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (data.betType === 'multiple') {
    if (!data.legs || data.legs.length < 2) {
      errors.push({
        field: 'legs',
        message: 'Apostas múltiplas devem ter pelo menos 2 legs',
        severity: 'error',
      });
    }
  }

  return errors;
};

/**
 * Validate a single import row
 */
export const validateRow = (row: ImportRow): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Run all validation checks
  errors.push(...validateRequiredFields(row.data));
  errors.push(...validateTypes(row.data));
  errors.push(...validateConditional(row.data));
  errors.push(...validateMultiLeg(row.data));

  // Add warnings for optional but recommended fields
  if (!row.data.stakeLogic || row.data.stakeLogic.trim() === '') {
    warnings.push({
      field: 'stakeLogic',
      message: 'Recomendado: adicione a lógica do stake para melhor rastreamento',
      severity: 'warning',
    });
  }

  if (!row.data.operationNumber || row.data.operationNumber.trim() === '') {
    warnings.push({
      field: 'operationNumber',
      message: 'Recomendado: adicione um número de operação para organização',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate all rows in an import batch
 */
export const validateImportRows = (rows: ImportRow[]): ImportRow[] => {
  return rows.map((row) => {
    const result = validateRow(row);

    return {
      ...row,
      validationErrors: [...result.errors, ...result.warnings],
      isValid: result.isValid,
      status: result.isValid ? 'ready' : 'error',
    };
  });
};

/**
 * Get summary statistics about validation results
 */
export const getValidationSummary = (rows: ImportRow[]) => {
  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);
  const errorCount = invalidRows.reduce((sum, r) =>
    sum + r.validationErrors.filter(e => e.severity === 'error').length, 0
  );
  const warningCount = rows.reduce((sum, r) =>
    sum + r.validationErrors.filter(e => e.severity === 'warning').length, 0
  );

  return {
    totalRows: rows.length,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
    errorCount,
    warningCount,
  };
};
