/**
 * Préfixes officiels ARCEP Bénin par opérateur
 */
const MTN_PREFIXES = [
  '42', '46', '50', '51', '52', '53', '54', '56', '57', '59',
  '61', '62', '66', '67', '69', '90', '91', '96', '97',
];

const MOOV_PREFIXES = [
  '45', '55', '58', '60', '63', '64', '65', '68',
  '94', '95', '98', '99',
];

const CELTIIS_PREFIXES = [
  '20', '21', '22', '23', '24', '28', '29',
  '40', '41', '43', '44', '47', '48', '49',
  '92', '93',
];

export type Operator = 'MTN' | 'MOOV' | 'CELTIIS';

export interface PhoneValidationResult {
  valid: boolean;
  operator: Operator | null;
  phone: string;
  message: string;
}

/**
 * Normalise un numéro béninois en 8 chiffres.
 *
 * Accepte : 97000000, 0197000000, +2290197000000, 2290197000000, +22997000000
 */
export function normalizePhone(phone: string): string {
  // Retirer espaces, tirets, points, parenthèses
  let cleaned = phone.replace(/[\s\-.()+]/g, '');

  // Retirer l'indicatif pays 229
  if (cleaned.startsWith('229')) {
    cleaned = cleaned.slice(3);
  }

  // Retirer le préfixe 01 (nouvelle numérotation 10 chiffres)
  if (cleaned.length === 10 && cleaned.startsWith('01')) {
    cleaned = cleaned.slice(2);
  }

  return cleaned;
}

/**
 * Détecte l'opérateur d'un numéro béninois.
 */
export function detectOperator(phone: string): PhoneValidationResult {
  const normalized = normalizePhone(phone);

  if (!/^\d{8}$/.test(normalized)) {
    return {
      valid: false,
      operator: null,
      phone: normalized,
      message: 'Le numéro doit contenir 8 chiffres (format béninois).',
    };
  }

  const prefix = normalized.substring(0, 2);

  if (MTN_PREFIXES.includes(prefix)) {
    return {
      valid: true,
      operator: 'MTN',
      phone: normalized,
      message: 'Numéro MTN Bénin valide.',
    };
  }

  if (MOOV_PREFIXES.includes(prefix)) {
    return {
      valid: true,
      operator: 'MOOV',
      phone: normalized,
      message: 'Numéro Moov Africa Bénin valide.',
    };
  }

  if (CELTIIS_PREFIXES.includes(prefix)) {
    return {
      valid: true,
      operator: 'CELTIIS',
      phone: normalized,
      message: 'Numéro Celtiis Bénin valide.',
    };
  }

  return {
    valid: false,
    operator: null,
    phone: normalized,
    message: `Numéro invalide : le préfixe « ${prefix} » ne correspond à aucun opérateur béninois.`,
  };
}

/**
 * Valide un numéro pour un mode de paiement spécifique.
 */
export function validateForPayment(
  phone: string,
  paymentMethod: 'mtn_momo' | 'moov_money' | 'mobile_money'
): PhoneValidationResult {
  const result = detectOperator(phone);

  if (!result.valid) {
    return result;
  }

  const expectedOperator: Operator | null =
    paymentMethod === 'mtn_momo' ? 'MTN' :
    paymentMethod === 'moov_money' ? 'MOOV' :
    null;

  if (expectedOperator && result.operator !== expectedOperator) {
    return {
      valid: false,
      operator: result.operator,
      phone: result.phone,
      message: `Ce numéro est un numéro ${result.operator}, mais vous avez choisi le paiement ${expectedOperator}.`,
    };
  }

  // Pour mobile_money générique, rejeter Celtiis
  if (paymentMethod === 'mobile_money' && result.operator === 'CELTIIS') {
    return {
      valid: false,
      operator: result.operator,
      phone: result.phone,
      message: 'Celtiis ne propose pas de service Mobile Money. Veuillez utiliser un numéro MTN ou Moov.',
    };
  }

  return result;
}
