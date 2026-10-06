'use client';

import PhoneInput from './PhoneInput';
import type { Operator } from '@/utils/phoneValidation';
import { normalizePhone, detectOperator, validateForPayment } from '@/utils/phoneValidation';

interface MomoFormProps {
  method: 'mtn_momo' | 'moov_money';
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  error: string | null;
  operator: Operator | null;
  isValid: boolean;
  successMessage: string | null;
}

/**
 * @deprecated Utiliser directement `validateForPayment` de `@/utils/phoneValidation`
 */
export function validateBeninPhone(phone: string, method: 'mtn_momo' | 'moov_money'): string | null {
  const result = validateForPayment(phone, method);
  return result.valid ? null : result.message;
}

export { normalizePhone, detectOperator, validateForPayment };

export default function MomoForm({
  method,
  phoneNumber,
  onPhoneChange,
  error,
  operator,
  isValid,
  successMessage,
}: MomoFormProps) {
  const isMTN = method === 'mtn_momo';
  const networkName = isMTN ? 'MTN MoMo' : 'Moov Money';

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
              Numérotation béninoise 8 ou 10 chiffres acceptée
            </p>
          </div>
        </div>
      </div>

      <PhoneInput
        phoneNumber={phoneNumber}
        onPhoneChange={onPhoneChange}
        error={error}
        operator={operator}
        isValid={isValid}
        successMessage={successMessage}
        method={method}
      />
    </div>
  );
}
