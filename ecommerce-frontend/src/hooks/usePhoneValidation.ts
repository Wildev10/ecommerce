'use client';

import { useState, useCallback } from 'react';
import {
  normalizePhone,
  detectOperator,
  validateForPayment,
  type Operator,
  type PhoneValidationResult,
} from '@/utils/phoneValidation';

interface UsePhoneValidationReturn {
  phoneNumber: string;
  normalizedPhone: string;
  operator: Operator | null;
  isValid: boolean;
  error: string | null;
  message: string | null;
  setPhone: (raw: string) => void;
  validateFor: (method: 'mtn_momo' | 'moov_money' | 'mobile_money') => PhoneValidationResult;
  reset: () => void;
}

export function usePhoneValidation(): UsePhoneValidationReturn {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState<PhoneValidationResult | null>(null);

  const setPhone = useCallback((raw: string) => {
    setPhoneNumber(raw);

    // Ne valider que si l'utilisateur a saisi assez de caractères
    const cleaned = raw.replace(/[\s\-.()+]/g, '');
    if (cleaned.length === 0) {
      setResult(null);
      return;
    }

    // Valider dès qu'on a un numéro normalisable en 8 chiffres
    const normalized = normalizePhone(raw);
    if (normalized.length === 8 && /^\d{8}$/.test(normalized)) {
      setResult(detectOperator(raw));
    } else if (normalized.length >= 8) {
      // Trop long ou invalide
      setResult({
        valid: false,
        operator: null,
        phone: normalized,
        message: 'Le numéro doit contenir 8 chiffres (format béninois).',
      });
    } else {
      // Pas encore assez de chiffres — pas d'erreur affichée
      setResult(null);
    }
  }, []);

  const validateFor = useCallback(
    (method: 'mtn_momo' | 'moov_money' | 'mobile_money'): PhoneValidationResult => {
      const res = validateForPayment(phoneNumber, method);
      setResult(res);
      return res;
    },
    [phoneNumber]
  );

  const reset = useCallback(() => {
    setPhoneNumber('');
    setResult(null);
  }, []);

  return {
    phoneNumber,
    normalizedPhone: normalizePhone(phoneNumber),
    operator: result?.operator ?? null,
    isValid: result?.valid ?? false,
    error: result && !result.valid ? result.message : null,
    message: result?.valid ? result.message : null,
    setPhone,
    validateFor,
    reset,
  };
}
