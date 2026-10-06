'use client';

interface PaymentMethodSelectorProps {
  selected: string | null;
  onSelect: (method: string) => void;
}

export default function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choisissez votre mode de paiement</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* MTN MoMo */}
        <button
          type="button"
          onClick={() => onSelect('mtn_momo')}
          className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
            selected === 'mtn_momo'
              ? 'border-yellow-500 bg-yellow-50 shadow-md'
              : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
            <span className="text-white font-black text-lg">MTN</span>
          </div>
          <span className="font-semibold text-gray-900">MTN MoMo</span>
          <span className="text-xs text-gray-500 mt-1">Mobile Money</span>
          {selected === 'mtn_momo' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Moov Money */}
        <button
          type="button"
          onClick={() => onSelect('moov_money')}
          className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
            selected === 'moov_money'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-3">
            <span className="text-white font-black text-sm">MOOV</span>
          </div>
          <span className="font-semibold text-gray-900">Moov Money</span>
          <span className="text-xs text-gray-500 mt-1">Mobile Money</span>
          {selected === 'moov_money' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* PayPal - Bientôt disponible */}
        <button
          type="button"
          disabled
          className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xs">PayPal</span>
          </div>
          <span className="font-semibold text-gray-500">PayPal</span>
          <span className="text-xs text-orange-500 mt-1 font-medium">Bientôt disponible</span>
        </button>

        {/* Carte bancaire - Bientôt disponible */}
        <button
          type="button"
          disabled
          className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-500">Carte bancaire</span>
          <span className="text-xs text-orange-500 mt-1 font-medium">Bientôt disponible</span>
        </button>
      </div>
    </div>
  );
}
