import React, { useState } from 'react';
import { CongenbillModel, OfficialPdaModel, ArrivalDeclarationModel } from '../types/pda';
import { SocotuLogo } from './SocotuLogo';

interface BillOfLadingProps {
  pda: OfficialPdaModel;
  declaration: ArrivalDeclarationModel;
  congenbill: CongenbillModel;
  onUpdateCongenbill: (bl: CongenbillModel) => void;
  onUpdateDeclaration: (decl: ArrivalDeclarationModel) => void;
  onUpdatePda: (pda: OfficialPdaModel) => void;
  onBackToPda: () => void;
  onGoToArrival?: () => void;
  onGoToSof?: () => void;
}

export const BillOfLading: React.FC<BillOfLadingProps> = ({
  pda,
  declaration,
  congenbill,
  onUpdateCongenbill,
  onUpdateDeclaration,
  onUpdatePda,
  onBackToPda,
  onGoToArrival,
  onGoToSof
}) => {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showStatus = (text: string) => {
    setStatusMsg(text);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleFieldChange = <K extends keyof CongenbillModel>(
    field: K,
    val: CongenbillModel[K]
  ) => {
    const updated = {
      ...congenbill,
      [field]: val
    };
    onUpdateCongenbill(updated);

    // Bidirectional sync with declaration and PDA
    if (field === 'oceanVessel') {
      const vName = String(val);
      onUpdateDeclaration({
        ...declaration,
        vesselName: vName
      });
      onUpdatePda({
        ...pda,
        vessel: {
          ...pda.vessel,
          name: vName
        }
      });
    } else if (field === 'portOfLoading') {
      onUpdateDeclaration({
        ...declaration,
        lastPort: String(val)
      });
    } else if (field === 'grossWeightKg') {
      const qVal = String(val);
      onUpdateDeclaration({
        ...declaration,
        qty: qVal,
        cargoQuantityDischarge: qVal,
        cargoQuantityInput: qVal
      });
    } else if (field === 'masterName') {
      const mName = String(val);
      onUpdateDeclaration({
        ...declaration,
        master: mName,
        masterName: mName
      });
    } else if (field === 'shipper') {
      onUpdateDeclaration({
        ...declaration,
        stowaways: String(val)
      });
    } else if (field === 'consignee') {
      onUpdateDeclaration({
        ...declaration,
        to: String(val)
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[950px] mx-auto animate-fade-in space-y-2">
      {/* Toast notification */}
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md print:hidden flex items-center justify-between shadow-xs">
          <span>{statusMsg}</span>
          <span className="text-[10px] text-emerald-600 font-mono">CONGENBILL 94</span>
        </div>
      )}

      {/* Screen action bar */}
      <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-300 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0f2c59] uppercase tracking-wide">
            📜 Bill of Lading (CONGENBILL 1994)
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Format officiel BIMCO pour Charte-Partie
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackToPda}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded cursor-pointer"
          >
            ← Proforma (PDA)
          </button>
          {onGoToArrival && (
            <button
              type="button"
              onClick={onGoToArrival}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded cursor-pointer"
            >
              Master's Decl.
            </button>
          )}
          {onGoToSof && (
            <button
              type="button"
              onClick={onGoToSof}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded cursor-pointer"
            >
              SOF
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="text-xs font-bold text-white bg-[#0f2c59] hover:bg-blue-900 px-3 py-1 rounded cursor-pointer shadow-xs flex items-center gap-1"
          >
            <span>🖨️</span>
            <span>Print A4</span>
          </button>
        </div>
      </div>

      {/* 
        OFFICIAL BIMCO CONGENBILL 94 DOCUMENT
        Meticulously aligned to official CONGENBILL 1994 standard form
      */}
      <div
        id="congenbill-print-area"
        className="bg-white p-4 sm:p-6 rounded-md shadow-md text-[#111] font-sans text-[9px] border-2 border-black print:border-black print:shadow-none print:p-2 print:m-0 print:text-[8.5px] print:max-h-[280mm] print:overflow-hidden leading-tight"
      >
        {/* Top Header Grid */}
        <div className="grid grid-cols-12 border-b-2 border-black">
          {/* Top Left: Shipper */}
          <div className="col-span-7 border-r-2 border-black p-1.5 flex flex-col justify-between min-h-[90px]">
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Shipper
              </label>
              <textarea
                rows={3}
                placeholder="Shipper name, address and country..."
                value={congenbill.shipper || ''}
                onChange={e => handleFieldChange('shipper', e.target.value)}
                className="w-full text-[9.5px] font-semibold text-slate-900 bg-white border border-slate-200 p-1 resize-none outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-[7.5px] text-slate-400 italic">
              Shipper / Charterer / Exporter Designation
            </div>
          </div>

          {/* Top Right: Reference No. & CONGENBILL Heading */}
          <div className="col-span-5 p-1.5 flex flex-col justify-between bg-slate-50/50">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-extrabold uppercase text-slate-700">Reference N°:</span>
                <input
                  type="text"
                  placeholder="e.g. BL-2026/01"
                  value={congenbill.blNumber || ''}
                  onChange={e => handleFieldChange('blNumber', e.target.value)}
                  className="w-[110px] text-right font-mono font-bold text-[#0f2c59] bg-white border border-slate-300 px-1 py-0.5 text-[9.5px] outline-none"
                />
              </div>

              <div className="text-right">
                <h2 className="text-base font-black text-[#0f2c59] tracking-wider m-0">
                  BILL OF LADING
                </h2>
                <div className="text-[8.5px] font-bold text-slate-700 tracking-wide uppercase">
                  TO BE USED WITH CHARTER-PARTIES
                </div>
                <div className="text-[8px] font-extrabold text-blue-900 mt-0.5 tracking-widest">
                  CODE NAME: "CONGENBILL"
                </div>
                <div className="text-[7.5px] font-semibold text-slate-500">
                  EDITION 1994
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-[7.5px] text-slate-500 font-mono">BIMCO Standard Form</span>
              <div className="h-5">
                <SocotuLogo className="h-5 w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Consignee */}
        <div className="grid grid-cols-12 border-b-2 border-black">
          <div className="col-span-7 border-r-2 border-black p-1.5 min-h-[70px]">
            <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
              Consignee
            </label>
            <textarea
              rows={2}
              placeholder="e.g. TO ORDER or Consignee designation..."
              value={congenbill.consignee || ''}
              onChange={e => handleFieldChange('consignee', e.target.value)}
              className="w-full text-[9.5px] font-bold text-slate-900 bg-white border border-slate-200 p-1 resize-none outline-none focus:border-blue-500 uppercase"
            />
          </div>
          <div className="col-span-5 p-1.5 flex flex-col justify-center bg-slate-50/30">
            <div className="text-[7.5px] text-slate-500 leading-tight">
              A document of title issued in accordance with the terms and conditions of the charter party dated as specified herein.
            </div>
          </div>
        </div>

        {/* Notify Address */}
        <div className="grid grid-cols-12 border-b-2 border-black">
          <div className="col-span-7 border-r-2 border-black p-1.5 min-h-[60px]">
            <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
              Notify Address (carrier not responsible for failure to notify)
            </label>
            <input
              type="text"
              placeholder="e.g. SAME AS CONSIGNEE / Full notify address..."
              value={congenbill.notifyAddress || ''}
              onChange={e => handleFieldChange('notifyAddress', e.target.value)}
              className="w-full text-[9.5px] text-slate-900 bg-white border border-slate-200 p-1 outline-none focus:border-blue-500"
            />
          </div>
          <div className="col-span-5 p-1.5 flex items-center justify-between text-[8px] bg-slate-50/30">
            <span className="font-semibold text-slate-600">Port Agency / Discharge Office:</span>
            <span className="font-bold text-[#0f2c59]">SOCOTU ({pda.port || declaration.portOfCall})</span>
          </div>
        </div>

        {/* Vessel & Ports of Loading / Discharge */}
        <div className="grid grid-cols-12 border-b-2 border-black text-[8.5px]">
          {/* Pre-carriage by & Place of receipt */}
          <div className="col-span-6 border-r-2 border-black p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-600">Pre-carriage by</label>
            <input
              type="text"
              placeholder="—"
              value={congenbill.preCarriageBy || ''}
              onChange={e => handleFieldChange('preCarriageBy', e.target.value)}
              className="w-full h-[19px] border border-slate-300 px-1 bg-white text-[8.5px]"
            />
          </div>
          <div className="col-span-6 p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-600">Place of receipt by pre-carrier</label>
            <input
              type="text"
              placeholder="—"
              value={congenbill.placeOfReceipt || ''}
              onChange={e => handleFieldChange('placeOfReceipt', e.target.value)}
              className="w-full h-[19px] border border-slate-300 px-1 bg-white text-[8.5px]"
            />
          </div>

          {/* Ocean vessel & Port of loading */}
          <div className="col-span-6 border-r-2 border-t border-black p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-700">Ocean vessel</label>
            <input
              type="text"
              value={congenbill.oceanVessel || declaration.vesselName || pda.vessel.name || ''}
              onChange={e => handleFieldChange('oceanVessel', e.target.value)}
              className="w-full h-[20px] border border-slate-300 px-1 font-bold text-[#0f2c59] uppercase bg-white text-[9.5px]"
            />
          </div>
          <div className="col-span-6 border-t border-black p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-700">Port of loading</label>
            <input
              type="text"
              placeholder="Port of loading..."
              value={congenbill.portOfLoading || declaration.lastPort || ''}
              onChange={e => handleFieldChange('portOfLoading', e.target.value)}
              className="w-full h-[20px] border border-slate-300 px-1 font-semibold uppercase bg-white text-[9.5px]"
            />
          </div>

          {/* Port of discharge & Place of delivery */}
          <div className="col-span-6 border-r-2 border-t border-black p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-700">Port of discharge</label>
            <input
              type="text"
              value={congenbill.portOfDischarge || `PORT OF ${(declaration.portOfCall || pda.port || 'SOUSSE').toUpperCase()}, TUNISIA`}
              onChange={e => handleFieldChange('portOfDischarge', e.target.value)}
              className="w-full h-[20px] border border-slate-300 px-1 font-bold text-[#0f2c59] uppercase bg-white text-[9.5px]"
            />
          </div>
          <div className="col-span-6 border-t border-black p-1">
            <label className="block text-[7.5px] font-bold uppercase text-slate-600">Place of delivery by on-carrier</label>
            <input
              type="text"
              placeholder="—"
              value={congenbill.placeOfDelivery || ''}
              onChange={e => handleFieldChange('placeOfDelivery', e.target.value)}
              className="w-full h-[20px] border border-slate-300 px-1 bg-white text-[8.5px]"
            />
          </div>
        </div>

        {/* CARGO PARTICULARS TABLE (Shipper's description of goods) */}
        <div className="border-b-2 border-black">
          <table className="w-full border-collapse text-[8.5px]">
            <thead>
              <tr className="bg-[#f0f2f4] text-slate-800 border-b border-black">
                <th className="border-r border-black p-1 text-left w-[24%] font-bold uppercase">
                  Shipper's description of goods<br />
                  <span className="text-[7.5px] text-slate-600 font-normal">Marks and Numbers</span>
                </th>
                <th className="border-r border-black p-1 text-left w-[46%] font-bold uppercase">
                  Number and kind of packages; Description of goods
                </th>
                <th className="border-r border-black p-1 text-right w-[15%] font-bold uppercase">
                  Gross weight
                </th>
                <th className="p-1 text-right w-[15%] font-bold uppercase">
                  Measurement
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                {/* Marks and Numbers */}
                <td className="border-r border-black p-1 h-[130px]">
                  <textarea
                    rows={6}
                    placeholder="e.g. IN BULK"
                    value={congenbill.marksAndNumbers || ''}
                    onChange={e => handleFieldChange('marksAndNumbers', e.target.value)}
                    className="w-full h-full text-[9px] font-mono text-slate-800 bg-white border-none resize-none p-0 outline-none uppercase"
                  />
                </td>

                {/* Number & kind of packages; Description of goods */}
                <td className="border-r border-black p-1">
                  <textarea
                    rows={6}
                    placeholder="Cargo details & description..."
                    value={congenbill.descriptionOfPackagesAndGoods ?? (declaration.cargo ? `BULK CARGO SAID TO BE:\n${declaration.cargo.toUpperCase()}` : '')}
                    onChange={e => handleFieldChange('descriptionOfPackagesAndGoods', e.target.value)}
                    className="w-full h-full text-[9.5px] font-bold text-slate-900 bg-white border-none resize-none p-0 outline-none leading-snug"
                  />
                </td>

                {/* Gross Weight */}
                <td className="border-r border-black p-1 text-right">
                  <input
                    type="text"
                    placeholder="e.g. 7,500 MT"
                    value={congenbill.grossWeightKg ?? declaration.qty ?? declaration.cargoQuantityDischarge ?? ''}
                    onChange={e => handleFieldChange('grossWeightKg', e.target.value)}
                    className="w-full text-right font-mono font-bold text-blue-900 bg-white border-none p-0 outline-none text-[9.5px]"
                  />
                </td>

                {/* Measurement */}
                <td className="p-1 text-right">
                  <input
                    type="text"
                    placeholder="—"
                    value={congenbill.measurementM3 || ''}
                    onChange={e => handleFieldChange('measurementM3', e.target.value)}
                    className="w-full text-right font-mono text-slate-800 bg-white border-none p-0 outline-none text-[8.5px]"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Deck cargo notation line */}
          <div className="p-1 border-t border-slate-300 text-[8px] text-slate-600 italic bg-slate-50/50 flex items-center justify-between">
            <span>(of which <input
              type="text"
              placeholder="NIL"
              className="w-16 border-b border-dotted border-slate-400 bg-transparent text-center px-1 font-mono text-[8px]"
            /> on deck at Charterer's / Shipper's risk; the Carrier not being responsible for loss or damage howsoever arising)</span>
            <span className="font-semibold text-slate-700 uppercase not-italic">CLEAN ON BOARD</span>
          </div>
        </div>

        {/* FREIGHT & CHARTER-PARTY DETAILS SECTION */}
        <div className="grid grid-cols-12 border-b-2 border-black text-[8.5px]">
          {/* Freight clause */}
          <div className="col-span-8 border-r-2 border-black p-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold uppercase text-slate-800 text-[8px]">
                  Freight payable as per CHARTER-PARTY dated:
                </span>
                <input
                  type="date"
                  value={congenbill.freightPayableAsPerCharterPartyDate || declaration.charterpartyDate || ''}
                  onChange={e => {
                    handleFieldChange('freightPayableAsPerCharterPartyDate', e.target.value);
                    onUpdateDeclaration({
                      ...declaration,
                      charterpartyDate: e.target.value
                    });
                  }}
                  className="border border-slate-300 px-1 py-0 text-[8.5px] font-mono bg-white font-bold text-blue-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold uppercase text-slate-800 text-[8px]">FREIGHT PAYABLE AT:</span>
                <select
                  value={congenbill.freightPayableAt || 'PAYABLE AT DESTINATION'}
                  onChange={e => handleFieldChange('freightPayableAt', e.target.value)}
                  className="border border-slate-300 bg-white px-1 py-0.5 text-[8.5px] font-bold text-[#0f2c59] cursor-pointer"
                >
                  <option value="PAYABLE AT DESTINATION">PAYABLE AT DESTINATION</option>
                  <option value="FREIGHT PREPAID">FREIGHT PREPAID</option>
                  <option value="AS PER CHARTER PARTY">AS PER CHARTER PARTY</option>
                </select>
              </div>
            </div>

            <div className="text-[7.5px] text-slate-500 italic mt-1 leading-tight">
              SHIPPED at the Port of Loading in apparent good order and condition on board the Vessel for carriage to the Port of Discharge or so near thereto as she may safely get the goods specified above. Weight, measure, quality, quantity, condition, contents and value unknown.
            </div>
          </div>

          {/* Freight advance / charges */}
          <div className="col-span-4 p-1.5 flex flex-col justify-between bg-slate-50/40">
            <div>
              <span className="block font-bold uppercase text-slate-700 text-[7.5px]">
                FREIGHT ADVANCE / CHARGES
              </span>
              <input
                type="text"
                placeholder="AS PER CHARTER PARTY"
                value={congenbill.freightAmount || 'AS PER CHARTER PARTY'}
                onChange={e => handleFieldChange('freightAmount', e.target.value)}
                className="w-full border border-slate-300 px-1 py-0.5 text-[8.5px] font-mono mt-0.5 bg-white"
              />
            </div>
            <div className="text-[7.5px] font-bold text-[#0f2c59] uppercase mt-1">
              FOR CONDITIONS OF CARRIAGE SEE OVERLEAF
            </div>
          </div>
        </div>

        {/* BOTTOM EXECUTION & SIGNATURE SECTION */}
        <div className="grid grid-cols-12 text-[8px]">
          {/* Number of Originals & Place/Date of Issue */}
          <div className="col-span-6 border-r-2 border-black p-1.5 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block font-bold uppercase text-slate-700 text-[7.5px]">
                  Number of original Bs/L
                </label>
                <input
                  type="text"
                  value={congenbill.numberOfOriginals || 'THREE (3)'}
                  onChange={e => handleFieldChange('numberOfOriginals', e.target.value)}
                  className="w-full border border-slate-300 px-1 py-0.5 text-[8.5px] font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 text-[7.5px]">
                  Place & Date of issue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sousse, 01/10/2026"
                  value={congenbill.placeOfIssue ? `${congenbill.placeOfIssue}, ${congenbill.dateOfIssue}` : `${declaration.portOfCall || pda.port || 'Sousse'}, ${congenbill.dateOfIssue}`}
                  onChange={e => handleFieldChange('placeOfIssue', e.target.value)}
                  className="w-full border border-slate-300 px-1 py-0.5 text-[8.5px] font-mono bg-white"
                />
              </div>
            </div>

            <div className="text-[7.5px] text-slate-600 leading-tight mt-1">
              IN WITNESS whereof the Master or his Agent has signed the number of Bills of Lading stated above, all of this tenor and date, one of which being accomplished the others to stand void.
            </div>
          </div>

          {/* Master / Agent Signature & Stamp Box */}
          <div className="col-span-6 p-1.5 flex flex-col justify-between min-h-[75px] bg-slate-50/20">
            <div className="flex justify-between items-center text-[7.5px]">
              <span className="font-bold uppercase text-slate-800">
                Signature of Master or Agent:
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="radio"
                    name="signedAs"
                    checked={congenbill.signedAs === 'AGENT'}
                    onChange={() => handleFieldChange('signedAs', 'AGENT')}
                  />
                  <span>As Agents</span>
                </label>
                <label className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="radio"
                    name="signedAs"
                    checked={congenbill.signedAs === 'MASTER'}
                    onChange={() => handleFieldChange('signedAs', 'MASTER')}
                  />
                  <span>Master</span>
                </label>
              </div>
            </div>

            {/* Signature designation */}
            <div className="pt-2 border-b border-dotted border-slate-400 flex justify-between items-end pb-1">
              <div>
                {congenbill.signedAs === 'AGENT' ? (
                  <div>
                    <div className="font-bold text-[#0f2c59] text-[8.5px]">
                      FOR AND ON BEHALF OF THE MASTER:
                    </div>
                    <div className="font-extrabold text-[9px] uppercase text-slate-900">
                      SOCOTU — Société Commerciale Tunisienne
                    </div>
                    <div className="text-[7px] text-slate-500">As Port & Shipping Agents Only</div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Master / Captain Name"
                      value={congenbill.masterName || declaration.master || declaration.masterName || ''}
                      onChange={e => handleFieldChange('masterName', e.target.value)}
                      className="font-bold text-[9px] text-slate-900 bg-transparent border-none p-0 outline-none"
                    />
                    <div className="text-[7.5px] text-slate-500">Master of the Vessel</div>
                  </div>
                )}
              </div>

              <div className="text-right text-[7.5px] text-slate-400 italic">
                Signature & Official Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
