import React, { useState } from 'react';
import { TargetCurrency } from '../types/pda';
import { formatNum } from '../utils/calculations';

interface MaritimeCurrencyConverterProps {
  currentPdaExchangeRate: number; // e.g. 1.200 (1 EUR = X target currency)
  pdaTargetCurrency: TargetCurrency;
  onClose?: () => void;
}

type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'TND' | 'AED';

export const MaritimeCurrencyConverter: React.FC<MaritimeCurrencyConverterProps> = ({
  currentPdaExchangeRate,
  pdaTargetCurrency,
  onClose
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR');
  const [amountStr, setAmountStr] = useState<string>('1000');
  
  // Custom rate override if user wants to tweak:
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRateStr, setCustomRateStr] = useState<string>('');

  // Default cross rates to EUR (Base: 1 EUR = X currency)
  // For USD, use currentPdaExchangeRate if target currency is USD, else ~1.085
  const defaultEurRates: Record<CurrencyCode, number> = {
    EUR: 1.0,
    USD: pdaTargetCurrency === 'USD' ? currentPdaExchangeRate : 1.085,
    GBP: 0.855,
    TND: pdaTargetCurrency === 'TND' ? currentPdaExchangeRate : 3.42,
    AED: pdaTargetCurrency === 'AED' ? currentPdaExchangeRate : 3.98
  };

  const amount = parseFloat(amountStr.replace(',', '.')) || 0;
  
  // Determine effective rate
  let effectiveRate = defaultEurRates[fromCurrency];
  if (useCustomRate && customRateStr) {
    const parsedCustom = parseFloat(customRateStr.replace(',', '.'));
    if (!isNaN(parsedCustom) && parsedCustom > 0) {
      effectiveRate = parsedCustom;
    }
  }

  // Conversion calculation
  // Base is EUR:
  // If fromCurrency -> EUR: amount / rateEur
  // If EUR -> toCurrency: amount * rateEur
  // If CurrencyA -> CurrencyB: (amount / rateA) * rateB
  let convertedAmount = 0;
  if (fromCurrency === toCurrency) {
    convertedAmount = amount;
  } else if (toCurrency === 'EUR') {
    convertedAmount = effectiveRate > 0 ? amount / effectiveRate : 0;
  } else if (fromCurrency === 'EUR') {
    const rateTo = defaultEurRates[toCurrency];
    convertedAmount = amount * rateTo;
  } else {
    // Cross conversion via EUR
    const inEur = effectiveRate > 0 ? amount / effectiveRate : 0;
    const rateTo = defaultEurRates[toCurrency];
    convertedAmount = inEur * rateTo;
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="bg-slate-50 border border-blue-200 rounded-lg p-3 shadow-md print:hidden text-slate-800 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">💱</span>
          <div>
            <h4 className="font-bold text-[#0f2c59] text-xs">Maritime Currency Converter</h4>
            <p className="text-[10px] text-slate-500">
              Quick conversion tool using PDA rate (1 EUR = {formatNum(currentPdaExchangeRate)} {pdaTargetCurrency})
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold px-1.5 py-0.5 rounded cursor-pointer"
            title="Close converter"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        {/* Amount Input */}
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
            Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            className="w-full h-8 px-2 border border-slate-300 rounded font-mono font-bold text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g. 1000"
          />
        </div>

        {/* From Currency */}
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
            From
          </label>
          <select
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value as CurrencyCode)}
            className="w-full h-8 px-2 border border-slate-300 rounded font-bold text-xs bg-white cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="TND">TND (DT)</option>
            <option value="AED">AED</option>
          </select>
        </div>

        {/* Swap Button */}
        <div className="sm:col-span-1 flex justify-center pt-3">
          <button
            type="button"
            onClick={handleSwap}
            className="h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-xs text-slate-700 cursor-pointer transition shadow-xs"
            title="Swap currencies"
          >
            ⇄
          </button>
        </div>

        {/* To Currency */}
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
            To
          </label>
          <select
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value as CurrencyCode)}
            className="w-full h-8 px-2 border border-slate-300 rounded font-bold text-xs bg-white cursor-pointer"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="TND">TND (DT)</option>
            <option value="AED">AED</option>
          </select>
        </div>
      </div>

      {/* Result Display Box */}
      <div className="mt-2.5 bg-white border border-blue-100 rounded-md p-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block">Converted Result:</span>
          <div className="text-base font-extrabold font-mono text-[#0f2c59]">
            {formatNum(convertedAmount)} <span className="text-xs text-blue-600 font-sans">{toCurrency}</span>
          </div>
        </div>

        <div className="text-right text-[10.5px] font-mono text-slate-500">
          <div>
            1 EUR = {formatNum(defaultEurRates[fromCurrency === 'EUR' ? toCurrency : fromCurrency])}{' '}
            {fromCurrency === 'EUR' ? toCurrency : fromCurrency}
          </div>
          <div className="text-[9.5px] text-slate-400">
            {fromCurrency} {formatNum(amount)} ≈ {toCurrency} {formatNum(convertedAmount)}
          </div>
        </div>
      </div>

      {/* Quick amount presets */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-[9.5px] font-bold text-slate-500 uppercase">Presets:</span>
        {quickAmounts.map(val => (
          <button
            key={val}
            type="button"
            onClick={() => setAmountStr(String(val))}
            className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-mono text-[10px] font-medium text-slate-700 cursor-pointer"
          >
            {val.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
};
