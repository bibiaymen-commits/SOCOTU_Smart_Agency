import React from 'react';
import { SocotuLogo } from './SocotuLogo';
import { AfaqLogo } from './AfaqLogo';
import { SOCOTU_BRANCHES } from '../data/tunisianPorts';
import { PortId } from '../types/pda';

interface SocotuOfficialHeaderProps {
  port: PortId | string;
}

export const SocotuOfficialHeader: React.FC<SocotuOfficialHeaderProps> = ({ port }) => {
  const branchKey = (port in SOCOTU_BRANCHES) ? (port as PortId) : 'Sousse';
  const currentBranch = SOCOTU_BRANCHES[branchKey] || SOCOTU_BRANCHES.Sousse;

  return (
    <div className="flex flex-col sm:flex-row items-center border-b-[2.5px] border-[#0f2c59] pb-2.5 mb-2 gap-2 sm:gap-4">
      {/* Left header: Official SOCOTU Logo */}
      <div className="w-full sm:w-[130px] flex items-center justify-center sm:justify-start shrink-0">
        <SocotuLogo className="h-14 sm:h-16 w-auto" />
      </div>

      {/* Center: Corporate Agency Title & Details */}
      <div className="text-center grow">
        <div className="text-base sm:text-lg font-extrabold text-[#0f2c59] tracking-wider leading-tight uppercase font-sans">
          SOCIETE COMMERCIALE TUNISIENNE
        </div>
        <div className="text-xs sm:text-sm font-bold text-[#0f2c59] tracking-wide mt-0.5" id="agency_subtitle">
          Agence de {port}
        </div>
        <div className="text-[9.5px] text-slate-500 leading-snug mt-0.5" id="company_details">
          {currentBranch.details}
        </div>
      </div>

      {/* Right header: AFAQ ISO 9001 Qualité Certification Logo */}
      <div className="w-full sm:w-[130px] flex items-center justify-center sm:justify-end shrink-0">
        <AfaqLogo className="h-12 sm:h-14 w-auto" />
      </div>
    </div>
  );
};
