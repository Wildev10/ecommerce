'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import type { Operator } from '@/utils/phoneValidation';

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  error: string | null;
  operator: Operator | null;
  isValid: boolean;
  successMessage: string | null;
  /** Mode de paiement sélectionné — utilisé pour l'affichage contextualisé */
  method?: 'mtn_momo' | 'moov_money' | string;
}

const OPERATOR_CONFIG: Record<Operator, { label: string; emoji: string; bg: string; border: string; text: string; ring: string }> = {
  MTN: {
    label: 'MTN MoMo',
    emoji: '🟡',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    ring: 'ring-yellow-200',
  },
  MOOV: {
    label: 'Moov Money',
    emoji: '🔵',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
    ring: 'ring-blue-200',
  },
  CELTIIS: {
    label: 'Celtiis',
    emoji: '🟢',
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
    ring: 'ring-green-200',
  },
};

const MERCHANT_NUMBERS: Record<string, string> = {
  mtn_momo: '+229 01 61 79 07 66',
  moov_money: '+229 01 60 59 05 00',
};

export default function PhoneInput({
  phoneNumber,
  onPhoneChange,
  error,
  operator,
  isValid,
  successMessage,
  method,
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const config = operator ? OPERATOR_CONFIG[operator] : null;

  const borderClass = error
    ? 'border-red-500'
    : isValid && config
      ? `${config.border} ring-2 ${config.ring}`
      : focused
        ? 'border-blue-500 ring-2 ring-blue-200'
        : 'border-gray-300';

  const merchantNumber = method ? MERCHANT_NUMBERS[method] : null;

  return (
    <div className="space-y-4">
      {/* Bandeau opérateur détecté */}
      {isValid && config && (
        <div className={`p-4 rounded-lg ${config.bg} border ${config.border}`}>
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{config.emoji}</div>
            <div>
              <p className={`font-semibold ${config.text}`}>
                {config.label} détecté
              </p>
              <p className="text-xs text-gray-500">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Champ de saisie */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Votre numéro de téléphone
        </label>
        <div
          className={`flex items-center border rounded-lg overflow-hidden transition-all ${borderClass}`}
        >
          <div className="flex items-center px-3 py-2.5 bg-gray-50 border-r border-gray-300">
            <Phone className="h-4 w-4 text-gray-500 mr-1.5" />
            <span className="text-gray-700 font-medium text-sm">+229</span>
          </div>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              // Autoriser chiffres, espaces et tirets
              const val = e.target.value.replace(/[^\d\s-]/g, '');
              onPhoneChange(val);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="01 97 00 00 00  ou  97 00 00 00"
            className="flex-1 px-3 py-2.5 outline-none text-gray-900 placeholder-gray-400"
            maxLength={14}
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {/* Aide formats acceptés */}
        <p className="text-xs text-gray-400 mt-1">
          Formats acceptés : 97000000 · 0197000000 · +229 01 97 00 00 00
        </p>
      </div>

      {/* Numéro marchand */}
      {merchantNumber && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-700 mb-1">Numéro marchand destinataire :</p>
          <p className="font-mono">{merchantNumber}</p>
        </div>
      )}
    </div>
  );
}
