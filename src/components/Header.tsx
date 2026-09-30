import React from 'react';
import { SocotuLogo } from './SocotuLogo';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0f2c59] text-white py-2 px-4 sm:px-6 shadow-md print:hidden flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-blue-900/60">
      {/* Left: Official SOCOTU Logo */}
      <div className="w-full sm:w-[150px] flex items-center justify-center sm:justify-start shrink-0">
        <div className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">
          <SocotuLogo className="h-9 w-auto" />
        </div>
      </div>

      {/* Middle: Centered Agency Title & Tunisian Ports */}
      <div className="text-center grow">
        <h1 className="font-extrabold tracking-wider text-sm sm:text-base uppercase text-white m-0 font-sans">
          SOCIETE COMMERCIALE TUNISIENNE
        </h1>
        <div className="text-[10.5px] text-blue-200 font-semibold tracking-wide">
          Shipping & Port Agency Operations Management
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-blue-200 mt-0.5 font-mono">
          <span>Ports of Call:</span>
          <span className="text-amber-300 font-medium">Sousse • Sfax • Radès • Bizerte • Gabès</span>
        </div>
      </div>

      {/* Right: Symmetrical balancing block with Est. 1900 badge */}
      <div className="hidden sm:flex sm:w-[150px] justify-end items-center shrink-0">
        <div className="text-right">
          <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
            EST. 1900
          </span>
        </div>
      </div>
    </header>
  );
};


