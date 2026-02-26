'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';

interface MomoFormProps {
  method: 'mtn_momo' | 'moov_money';
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  error: string | null;
}

const MTN_PREFIXES = ['90', '91', '96', '97'];
const MOOV_PREFIXES = ['94', '95', '98', '99'];

export function validateBeninPhone(phone: string, method: 'mtn_momo' | 'moov_money'): string | null {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  if (!cleaned) {
    return 'Le numéro de téléphone est requis';
  }

  if (!/^\d{8}$/.test(cleaned)) {
    return 'Le numéro doit contenir exactement 8 chiffres';
  }

  const prefix = cleaned.substring(0, 2);
  const validPrefixes = method === 'mtn_momo' ? MTN_PREFIXES : MOOV_PREFIXES;
  const networkName = method === 'mtn_momo' ? 'MTN' : 'Moov';

  if (!validPrefixes.includes(prefix)) {
    return `Ce numéro n'est pas un numéro ${networkName}. Les numéros ${networkName} commencent par ${validPrefixes.join(', ')}`;
  }

  return null;
}

export default function MomoForm({ method, phoneNumber, onPhoneChange, error }: MomoFormProps) {
  const [focused, setFocused] = useState(false);
  const isMTN = method === 'mtn_momo';
  const colorClass = isMTN ? 'yellow' : 'blue';
  const networkName = isMTN ? 'MTN MoMo' : 'Moov Money';
  const validPrefixes = isMTN ? MTN_PREFIXES : MOOV_PREFIXES;
  const merchantNumber = '+229 0161790766';

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${isMTN ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMTN ? 'bg-yellow-400' : 'bg-blue-600'}`}>
            <span className="text-white font-bold text-xs">{isMTN ? 'MTN' : 'MOOV'}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Paiement via {networkName}</p>
            <p className="text-xs text-gray-500">
              Numéros acceptés : {validPrefixes.map(p => `${p}XX XX XX`).join(', ')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Votre numéro de téléphone
        </label>
        <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${
          error ? 'border-red-500' : focused ? `border-${colorClass}-500 ring-2 ring-${colorClass}-200` : 'border-gray-300'
        }`}>
          <div className="flex items-center px-3 py-2.5 bg-gray-50 border-r border-gray-300">
            <Phone className="h-4 w-4 text-gray-500 mr-1.5" />
            <span className="text-gray-700 font-medium text-sm">+229</span>
          </div>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d\s-]/g, '');
              if (val.replace(/[\s-]/g, '').length <= 8) {
                onPhoneChange(val);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="96 XX XX XX"
            className="flex-1 px-3 py-2.5 outline-none text-gray-900 placeholder-gray-400"
            maxLength={11}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center space-x-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium text-gray-700 mb-1">Numéro marchand destinataire :</p>
        <p className="font-mono">{merchantNumber}</p>
      </div>
    </div>
  );
}
