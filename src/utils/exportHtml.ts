import { OfficialPdaModel } from '../types/pda';
import { formatInt, formatNum } from './calculations';
import { SOCOTU_BRANCHES } from '../data/tunisianPorts';

export function generateStandaloneHtml(pda: OfficialPdaModel): string {
  const branch = SOCOTU_BRANCHES[pda.port] || SOCOTU_BRANCHES.Sousse;

  const shelterTotalCost = pda.portDues.tShelter || 0;
  const stayTotalCost = pda.portDues.tStay || 0;

  const ispsShelterUnit = pda.portDues.ispsShelterUnitEUR ?? (shelterTotalCost * 0.05);
  const ispsShelterT = pda.portDues.tIspsShelter ?? ispsShelterUnit;
  const ispsShelterVat = pda.portDues.vatIspsShelter ?? (ispsShelterT * 0.19);
  const ispsShelterTot = pda.portDues.totIspsShelter ?? (ispsShelterT + ispsShelterVat);

  const ispsStayUnit = pda.portDues.ispsStayUnitEUR ?? (stayTotalCost * 0.05);
  const ispsStayT = pda.portDues.tIspsStay ?? ispsStayUnit;
  const ispsStayVat = pda.portDues.vatIspsStay ?? (ispsStayT * 0.19);
  const ispsStayTot = pda.portDues.totIspsStay ?? (ispsStayT + ispsStayVat);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOCOTU PDA — ${pda.ref} — ${pda.vessel.name || 'Vessel'}</title>
    <style>
        :root {
            --primary-color: #0f2c59;
            --secondary-color: #1d4ed8;
            --border-color: #cbd5e1;
            --text-main: #1e293b;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: var(--text-main);
            background-color: #e2e8f0;
            margin: 0;
            padding: 8px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 14px 18px;
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(15, 44, 89, 0.1);
        }
        .corporate-header {
            text-align: center;
            border-bottom: 2.5px solid var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 8px;
        }
        .company-brand {
            font-size: 18px;
            font-weight: 800;
            color: var(--primary-color);
            letter-spacing: 1px;
            line-height: 1.2;
            text-transform: uppercase;
        }
        .agency-subtitle {
            font-size: 12.5px;
            font-weight: 700;
            color: var(--secondary-color);
            margin-top: 2px;
        }
        .company-details {
            font-size: 10px;
            color: #64748b;
            line-height: 1.3;
            margin-top: 4px;
        }
        .sub-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .doc-title {
            font-size: 14px;
            font-weight: 800;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-date {
            font-size: 11px;
            color: #475569;
            background: #f1f5f9;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px 8px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            margin-bottom: 5px;
        }
        .meta-item {
            display: flex;
            align-items: center;
            font-size: 10px;
        }
        .meta-label {
            font-weight: 700;
            color: var(--primary-color);
            width: 70px;
            flex-shrink: 0;
            text-align: left;
        }
        .meta-value {
            color: #334155;
            flex-grow: 1;
            text-align: left;
        }
        .meta-value input, .meta-value select {
            width: 100%;
            padding: 0 4px;
            border: 1px solid var(--border-color);
            border-radius: 3px;
            font-size: 10px;
            background: #fff;
            text-align: left;
            font-family: inherit;
            height: 18px;
            box-sizing: border-box;
        }
        .vessel-particulars {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 8px;
            margin-bottom: 6px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px 10px;
        }
        .particular-group {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
        .particular-group label {
            font-size: 8.5px;
            font-weight: 700;
            color: #1d4ed8;
            text-transform: uppercase;
            width: 50px;
            flex-shrink: 0;
            text-align: left;
            margin-right: 2px;
        }
        .particular-group input, .particular-group select {
            width: 50px;
            padding: 0 3px;
            border: 1px solid #93c5fd;
            border-radius: 3px;
            text-align: left;
            font-weight: 600;
            font-size: 9.5px;
            font-family: inherit;
            background: #fff;
            height: 18px;
            box-sizing: border-box;
        }
        .particular-group input[readonly] {
            background-color: #dbeafe;
            color: #1e3a8a;
        }
        .volume-summary {
            grid-column: span 3;
            font-size: 9px;
            color: #1e3a8a;
            border-top: 1px dashed #bfdbfe;
            padding-top: 4px;
            margin-top: 2px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
        }
        .section-header {
            background-color: var(--primary-color);
            color: #fff;
            text-align: left;
            font-weight: 700;
            padding: 4px 8px;
            margin-top: 8px;
            margin-bottom: 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            background: #fff;
            table-layout: fixed;
        }
        .data-table th, .data-table td {
            border: 1px solid var(--border-color);
            padding: 2.5px 4px;
            font-size: 10px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: var(--primary-color);
            font-weight: 700;
            font-size: 9.5px;
            text-align: center;
        }
        .text-right { text-align: right; white-space: nowrap; font-family: monospace; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        
        input.qty-input {
            width: 28px;
            text-align: center;
            font-weight: bold;
            background-color: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 3px;
            padding: 1px;
            font-size: 10px;
            height: 19px;
            box-sizing: border-box;
            -moz-appearance: textfield;
        }
        input.qty-input::-webkit-outer-spin-button,
        input.qty-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input.unit-price-input {
            width: 65px;
            text-align: right;
            background-color: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 3px;
            padding: 1px 3px;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
            height: 19px;
            box-sizing: border-box;
            -moz-appearance: textfield;
        }
        input.unit-price-input::-webkit-outer-spin-button,
        input.unit-price-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .footer-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 8px;
            border-top: 2px solid #e2e8f0;
            padding-top: 8px;
        }
        .footer-box {
            background: #f8fafc;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            padding: 7px 10px;
            font-size: 9.5px;
            line-height: 1.35;
        }
        .footer-box strong {
            color: var(--primary-color);
            display: block;
            margin-bottom: 2px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
            font-size: 10px;
        }
        .page-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #64748b;
            margin-top: 8px;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
        }
        .btn-container {
            text-align: center;
            margin-top: 10px;
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .btn-print, .btn-save {
            background-color: var(--primary-color);
            color: white;
            padding: 7px 18px;
            border: none;
            border-radius: 4px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 3px 5px rgba(15, 44, 89, 0.2);
            transition: background 0.2s;
        }
        .btn-print:hover, .btn-save:hover {
            background-color: #1d4ed8;
        }
        .btn-save {
            background-color: #059669;
        }
        .btn-save:hover {
            background-color: #047857;
        }
        @media print {
            * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            @page {
                size: A4 portrait;
                margin: 4mm 6mm;
            }
            body {
                background: #fff;
                padding: 0;
                font-size: 9.5px;
                overflow: visible !important;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
                width: 100%;
                overflow: visible !important;
            }
            .data-table, table {
                overflow: visible !important;
            }
            .btn-container {
                display: none;
            }
            input, select {
                border: none !important;
                background: transparent !important;
                text-align: left !important;
                box-shadow: none;
                padding: 0;
                font-size: 10px;
                height: auto !important;
            }
            input.qty-input {
                background: transparent !important;
                border: none !important;
                text-align: center !important;
            }
            input.unit-price-input {
                background: transparent !important;
                border: none !important;
                text-align: right !important;
                font-family: monospace !important;
                font-variant-numeric: tabular-nums !important;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="corporate-header" style="display: flex; align-items: center; border-bottom: 2.5px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 8px;">
        <div style="width: 120px; flex-shrink: 0; text-align: left;">
            <svg viewBox="0 0 120 135" style="height: 54px; width: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="48" r="44" fill="#009fe3" />
                <rect x="57.5" y="36" width="50" height="7" rx="3.5" ry="3.5" fill="#ffffff" />
                <rect x="12.5" y="52" width="50" height="7" rx="3.5" ry="3.5" fill="#ffffff" />
                <text x="60" y="126" text-anchor="middle" fill="#009fe3" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="28" letter-spacing="0.5px">SOCOTU</text>
            </svg>
        </div>
        <div style="flex-grow: 1; text-align: center;">
            <div class="company-brand" style="text-align: center;">SOCIETE COMMERCIALE TUNISIENNE</div>
            <div class="agency-subtitle" id="agency_subtitle" style="text-align: center;">Agence de ${pda.port}</div>
            <div class="company-details" id="company_details" style="text-align: center;">
                ${branch.details}
            </div>
        </div>
        <div style="width: 120px; flex-shrink: 0; text-align: right;">
            <svg viewBox="0 0 160 120" style="height: 52px; width: auto; display: inline-block;" xmlns="http://www.w3.org/2000/svg">
                <path d="M 16 6 C 40 4, 120 4, 144 8 L 154 112 C 120 115, 40 115, 8 112 Z" fill="#3b0754" rx="6" />
                <text x="80" y="50" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="34" letter-spacing="-1px">afaq</text>
                <rect x="16" y="62" width="128" height="28" rx="3" fill="#ffffff" />
                <text x="80" y="82" text-anchor="middle" fill="#3b0754" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="18" letter-spacing="1px">ISO 9001</text>
                <text x="80" y="106" text-anchor="middle" fill="#ffffff" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="12" letter-spacing="2px">Qualité</text>
            </svg>
        </div>
    </div>

    <div class="sub-header-bar">
        <div class="doc-title">Proforma Disbursement Account</div>
        <div class="doc-date"><span id="port_label_date">${pda.port}</span> on: <input type="date" id="doc_date_input" value="${pda.date}" style="width: 110px; border:none; background:#f1f5f9; text-align:center; font-weight:600; font-family:inherit; height:auto;"></div>
    </div>

    <div class="meta-grid">
        <div class="meta-item">
            <span class="meta-label">From / Branch:</span>
            <span class="meta-value"><input type="text" id="branch_name" value="${pda.branchName}" style="font-weight: bold;"></span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Port of Call:</span>
            <span class="meta-value">
                <select id="port_selector" onchange="onPortChange()">
                    <option value="Sousse" ${pda.port === 'Sousse' ? 'selected' : ''}>Sousse Port</option>
                    <option value="Sfax" ${pda.port === 'Sfax' ? 'selected' : ''}>Sfax Port</option>
                    <option value="Rades" ${pda.port === 'Rades' ? 'selected' : ''}>Radès / La Goulette Port</option>
                    <option value="Bizerte" ${pda.port === 'Bizerte' ? 'selected' : ''}>Bizerte Port</option>
                    <option value="Gabes" ${pda.port === 'Gabes' ? 'selected' : ''}>Gabès Port</option>
                </select>
            </span>
        </div>
        <div class="meta-item">
            <span class="meta-label">To:</span>
            <span class="meta-value"><input type="text" id="meta_to" value="${pda.vessel.to}"></span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Kind Attention:</span>
            <span class="meta-value"><input type="text" id="meta_attn" value="${pda.vessel.attn}"></span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Vessel Name:</span>
            <span class="meta-value"><input type="text" id="meta_vessel" value="${pda.vessel.name}"></span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Flag:</span>
            <span class="meta-value"><input type="text" id="meta_flag" value="${pda.vessel.flag || ''}" placeholder="Panama"></span>
        </div>
        <div class="meta-item" style="grid-column: span 2;">
            <span class="meta-label">Cargo:</span>
            <span class="meta-value" style="display: flex; gap: 6px;">
                <select id="meta_cargo_op" style="width: 120px; font-weight: bold; background: #eff6ff; border-color: #93c5fd;">
                    <option value="Loading" ${pda.vessel.cargoOperation === 'Loading' ? 'selected' : ''}>Loading</option>
                    <option value="Discharging" ${(!pda.vessel.cargoOperation || pda.vessel.cargoOperation === 'Discharging') ? 'selected' : ''}>Discharging</option>
                    <option value="Formalities" ${pda.vessel.cargoOperation === 'Formalities' ? 'selected' : ''}>Formalities</option>
                    <option value="Transit" ${pda.vessel.cargoOperation === 'Transit' ? 'selected' : ''}>Transit</option>
                </select>
                <input type="text" id="meta_cargo" value="${pda.vessel.cargo}" style="flex-grow: 1;">
            </span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Weight:</span>
            <span class="meta-value"><input type="text" id="meta_weight" value="${pda.vessel.weightCargo}"></span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Vessel Owner:</span>
            <span class="meta-value"><input type="text" id="meta_owner" value="${pda.vesselOwner || ''}"></span>
        </div>
        <div class="meta-item" style="grid-column: span 2;">
            <span class="meta-label">Remarks:</span>
            <span class="meta-value"><input type="text" id="meta_remarks" value="${pda.remarks || ''}"></span>
        </div>
    </div>

    <div class="vessel-particulars">
        <div class="particular-group">
            <label>L.O.A. (m)</label>
            <input type="number" id="loa" value="${pda.vessel.loa}" step="0.01" onchange="recalculate()">
        </div>
        <div class="particular-group">
            <label>B.E.A.M. (m)</label>
            <input type="number" id="beam" value="${pda.vessel.beam}" step="0.01" onchange="recalculate()">
        </div>
        <div class="particular-group">
            <label>S. Draft (m)</label>
            <input type="number" id="draft" value="${pda.vessel.draft}" step="0.001" onchange="recalculate()">
        </div>
        <div class="particular-group">
            <label title="Theoretical Draft: 0,14 * sqrt(LOA * Beam)">Th. Draft (m)</label>
            <input type="text" id="theor_draft" value="${pda.vessel.theorDraft.toFixed(3)}" readonly title="0,14 * sqrt(LOA * Beam)">
        </div>
        <div class="particular-group">
            <label>N° Days</label>
            <input type="number" class="qty-input" id="n_stay" value="${pda.portDues.nStay}" step="1" onchange="document.getElementById('n_stay_table').value=this.value; recalculate();" style="width: 50px; text-align: left; height: 18px; background-color: #fff; border: 1px solid #cbd5e1;">
        </div>
        <div class="particular-group">
            <label>GRT</label>
            <input type="number" id="grt_val" value="${pda.vessel.grt}" step="1" style="text-align: left;">
        </div>
        <div class="particular-group">
            <label>NRT</label>
            <input type="number" id="nrt_val" value="${pda.vessel.nrt}" step="1" style="text-align: left;">
        </div>
        <div class="particular-group">
            <label>IMO N°</label>
            <input type="text" id="imo_num" value="${pda.vessel.imo}" style="text-align: left;">
        </div>
        <div class="particular-group">
            <label>C.SIGN</label>
            <input type="text" id="call_sign" value="${pda.vessel.callSign}" style="text-align: left;">
        </div>
        <div class="volume-summary" style="grid-column: span 3; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
            <span><strong>Volume (V):</strong> <span id="vol_display">${formatInt(pda.vessel.volume)}</span> m³</span>
            <span style="display: flex; align-items: center; gap: 4px;">
                <strong style="color: #0f2c59; font-size: 8.5px; text-transform: uppercase;">Currency:</strong>
                <select id="curr_selector" style="padding: 0 2px; text-align: left; height: 18px; font-size: 8.5px;" onchange="
                    var r = {EUR: 1.0000, USD: 1.0800, TND: 3.3500, AED: 3.9600, GBP: 0.8500};
                    if (r[this.value]) document.getElementById('ex_rate').value = r[this.value].toFixed(4).replace('.', ',');
                    recalculate();
                ">
                    <option value="EUR" ${pda.targetCurrency === 'EUR' ? 'selected' : ''}>EUR</option>
                    <option value="USD" ${pda.targetCurrency === 'USD' ? 'selected' : ''}>USD</option>
                    <option value="TND" ${pda.targetCurrency === 'TND' ? 'selected' : ''}>TND</option>
                    <option value="AED" ${pda.targetCurrency === 'AED' ? 'selected' : ''}>AED</option>
                    <option value="GBP" ${pda.targetCurrency === 'GBP' ? 'selected' : ''}>GBP</option>
                </select>
                <span style="font-size: 8px; color: #64748b;">1 EUR =</span>
                <input type="text" inputmode="decimal" id="ex_rate" value="${pda.exchangeRate.toFixed(4).replace('.', ',')}" onchange="recalculate()" style="width: 54px; padding: 0 4px; text-align: right; height: 18px; font-size: 8.5px; font-family: monospace; border: 1px solid #93c5fd; border-radius: 3px; background: #fff;">
                <span id="target_curr_badge" style="font-size: 8.5px; font-weight: bold; color: #1d4ed8;">${pda.targetCurrency}</span>
            </span>
        </div>
    </div>

    <!-- TABLE 1: PORT DUES -->
    <div class="section-header">Port Dues (Euro)</div>
    <table class="data-table">
        <colgroup>
            <col style="width: 26%;">
            <col style="width: 22%;">
            <col style="width: 18%;">
            <col style="width: 10%;">
            <col style="width: 24%;">
        </colgroup>
        <tbody><tr>
            <th class="text-left">Item</th>
            <th class="text-left">Details</th>
            <th class="text-right">U. Cost</th>
            <th class="text-center">N°</th>
            <th class="text-right">Total Costs</th>
        </tr>
        <tr>
            <td class="text-left"><strong>Shelter:</strong></td>
            <td class="text-left" style="color: #475569;">(Per Call)</td>
            <td id="u_shelter" class="text-right">${formatNum(pda.portDues.shelterUnitEUR)}</td>
            <td class="text-center"><input type="number" class="qty-input" id="n_shelter" value="${pda.portDues.nShelter}" step="1" onchange="recalculate()"></td>
            <td id="tot_shelter" class="text-right" style="font-weight: 700;">${formatNum(pda.portDues.totShelter)}</td>
        </tr>
        <tr>
            <td class="text-left"><strong>Stay Dues:</strong></td>
            <td class="text-left" style="color: #475569;">(Per Day)</td>
            <td id="u_stay" class="text-right">${formatNum(pda.portDues.stayUnitEUR)}</td>
            <td class="text-center"><input type="number" class="qty-input" id="n_stay_table" value="${pda.portDues.nStay}" step="1" onchange="document.getElementById('n_stay').value=this.value; recalculate();"></td>
            <td id="tot_stay" class="text-right" style="font-weight: 700;">${formatNum(pda.portDues.totStay)}</td>
        </tr>
        <tr>
            <td class="text-left"><strong>Pilotage:</strong></td>
            <td class="text-left" style="color: #475569;">(Per hour)</td>
            <td id="u_pilot" class="text-right">${formatNum(pda.portDues.pilotUnitEUR)}</td>
            <td class="text-center"><input type="number" class="qty-input" id="n_pilot" value="${pda.portDues.nPilot}" step="1" onchange="recalculate()"></td>
            <td id="tot_pilot" class="text-right" style="font-weight: 700;">${formatNum(pda.portDues.totPilot)}</td>
        </tr>
        <tr>
            <td class="text-left"><strong>Tug Boat:</strong></td>
            <td class="text-left" style="color: #475569;">(Per hour)</td>
            <td id="u_tug" class="text-right">${formatNum(pda.portDues.tugUnitEUR)}</td>
            <td class="text-center"><input type="number" class="qty-input" id="n_tug" value="${Math.round(pda.portDues.nTug)}" step="1" onchange="recalculate()"></td>
            <td id="tot_tug" class="text-right" style="font-weight: 700;">${formatNum(pda.portDues.totTug)}</td>
        </tr>
        <tr style="background-color: #fffbeb;">
            <td class="text-left" style="color: #b45309;"><strong>ISPS (Shelter):</strong></td>
            <td class="text-left" style="color: #475569;">5%</td>
            <td id="u_isps_shelter" class="text-right">${formatNum(ispsShelterUnit)}</td>
            <td class="text-center font-mono font-bold">1</td>
            <td id="tot_isps_shelter" class="text-right" style="font-weight: 700;">${formatNum(ispsShelterTot)}</td>
        </tr>
        <tr style="background-color: #fffbeb;">
            <td class="text-left" style="color: #b45309;"><strong>ISPS (Stay Dues):</strong></td>
            <td class="text-left" style="color: #475569;">5%</td>
            <td id="u_isps_stay" class="text-right">${formatNum(ispsStayUnit)}</td>
            <td class="text-center font-mono font-bold">1</td>
            <td id="tot_isps_stay" class="text-right" style="font-weight: 700;">${formatNum(ispsStayTot)}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
            <td colspan="4" class="text-right"><strong>PORT DUES SUB TOTAL (Euro)</strong></td>
            <td id="sub_port_dues" class="text-right" style="font-weight: 800;">${formatNum(pda.portDues.subtotalPortDuesEUR)}</td>
        </tr>
    </tbody></table>

    <!-- TABLE 2: PORT EXPENSES -->
    <div class="section-header">Port Expenses (Euro)</div>
    <table class="data-table">
        <colgroup>
            <col style="width: 26%;">
            <col style="width: 22%;">
            <col style="width: 18%;">
            <col style="width: 10%;">
            <col style="width: 24%;">
        </colgroup>
        <tbody><tr>
            <th class="text-left">Item</th>
            <th class="text-left">Details</th>
            <th class="text-right">U. Costs</th>
            <th class="text-center">Nbr</th>
            <th class="text-right">Total Costs</th>
        </tr>
        <tr>
            <td class="text-left"><strong>Mooring & Unmooring:</strong></td>
            <td class="text-left" style="color: #475569;">( In&Out )</td>
            <td class="text-right"><input type="number" value="${(pda.portExpenses.uMooringEUR ?? pda.portDues.combinedMooringTotalEUR ?? 249.90).toFixed(3)}" step="0.001" id="u_mooring" class="unit-price-input" onchange="recalculate()"></td>
            <td class="text-center"><input type="number" class="qty-input" id="n_mooring" value="${pda.portExpenses.nMooring ?? 2}" step="1" onchange="recalculate()"></td>
            <td id="tot_mooring" class="text-right" style="font-weight: 700;">${formatNum(pda.portExpenses.totMooring ?? ((pda.portExpenses.uMooringEUR ?? pda.portDues.combinedMooringTotalEUR ?? 249.90) * (pda.portExpenses.nMooring ?? 2)))}</td>
        </tr>
        <tr>
            <td class="text-left">Watchmen:</td>
            <td class="text-left" style="color: #475569;">(Per Day)</td>
            <td class="text-right"><input type="number" value="${pda.portExpenses.uWatchEUR.toFixed(3)}" step="0.001" id="u_watch" class="unit-price-input" onchange="recalculate()"></td>
            <td class="text-center"><input type="number" class="qty-input" id="n_watch" value="${pda.portExpenses.nWatch}" step="1" onchange="recalculate()"></td>
            <td id="tot_watch" class="text-right" style="font-weight: 700;">${formatNum(pda.portExpenses.totWatch)}</td>
        </tr>
        <tr>
            <td class="text-left">Garbage Removal:</td>
            <td class="text-left" style="color: #475569;">(Per Voyage)</td>
            <td class="text-right"><input type="number" value="${pda.portExpenses.uGarbEUR.toFixed(3)}" step="0.001" id="u_garb" class="unit-price-input" onchange="recalculate()"></td>
            <td class="text-center"><input type="number" class="qty-input" id="n_garb" value="${pda.portExpenses.nGarb}" step="1" onchange="recalculate()"></td>
            <td id="tot_garb" class="text-right" style="font-weight: 700;">${formatNum(pda.portExpenses.totGarb)}</td>
        </tr>
        <!-- TOTALS SECTION: Bank Details on the Left (Col 1-2) side-by-side with Totals on the Right (Col 3-5) -->
        <!-- Row 1: Subtotal Port Expenses -->
        <tr style="background-color: #f8fafc;">
            <td colspan="2" rowspan="5" style="vertical-align: top; text-align: left; background: #f8fafc; padding: 6px 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 8.5px; line-height: 1.35;">
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: var(--primary-color); font-size: 9px; text-transform: uppercase;">🏛️ Bank Details</strong>
                        <span style="font-size: 8px; color: #1e3a8a; font-family: monospace;">SOCOTU Account</span>
                    </div>
                    <div style="color: #334155; font-size: 8.5px;">
                        <div><span style="color: #64748b; font-weight: 600;">COMPANY:</span> <strong>${pda.bankDetails.companyName}</strong></div>
                        <div><span style="color: #64748b; font-weight: 600;">BANK:</span> <strong>${pda.bankDetails.bankName}</strong></div>
                        <div><span style="color: #64748b; font-weight: 600;">BRANCH:</span> ${pda.bankDetails.branch}</div>
                        <div><span style="color: #64748b; font-weight: 600;">SWIFT:</span> <span style="font-family: monospace; font-weight: 700; color: #0f2c59;">${pda.bankDetails.swift}</span> | <span style="color: #64748b; font-weight: 600;">ACC N°:</span> <span style="font-family: monospace;">${pda.bankDetails.accNum}</span></div>
                        <div><span style="color: #64748b; font-weight: 600;">IBAN:</span> <span style="font-family: monospace; font-weight: 700; color: #0f2c59;">${pda.bankDetails.iban}</span></div>
                    </div>
                </div>
            </td>
            <td colspan="2" class="text-right" style="font-size: 9.5px;"><strong>Port Expenses Sub Total: (Euro)</strong></td>
            <td id="sub_port_expenses" class="text-right" style="font-weight: 800; font-size: 10.5px;">${formatNum(pda.portExpenses.subtotalPortExpensesEUR)}</td>
        </tr>
        <!-- Row 2: Agency Fees -->
        <tr style="background-color: #f8fafc;">
            <td colspan="2" class="text-right" style="font-size: 9.5px;"><strong>Agency Fees: (Euro)</strong></td>
            <td class="text-right"><input type="number" id="agency_fees" value="${pda.portExpenses.agencyFeesEUR.toFixed(3)}" step="0.001" class="unit-price-input" style="width:75px; font-weight:bold; text-align:right; height:19px;" onchange="recalculate()"></td>
        </tr>
        <!-- Row 3: Currency Control -->
        <tr style="background-color: #fff7ed; font-size: 9.5px;">
            <td class="text-right" style="color: #9a3412;"><strong>Currency Control:</strong></td>
            <td class="text-center">
                <select id="currency_control_rate" class="tariff-select" onchange="recalculate()" style="width:55px; height: 18px; padding: 0; font-size: 9px;">
                    <option value="0" ${pda.portExpenses.currencyControlRate === 0 ? 'selected' : ''}>0%</option>
                    <option value="1" ${pda.portExpenses.currencyControlRate === 1 ? 'selected' : ''}>1%</option>
                    <option value="2" ${pda.portExpenses.currencyControlRate === 2 ? 'selected' : ''}>2%</option>
                    <option value="3" ${pda.portExpenses.currencyControlRate === 3 ? 'selected' : ''}>3%</option>
                </select>
            </td>
            <td id="currency_control_charge" class="text-right" style="color: #9a3412; font-weight: bold;">${formatNum(pda.portExpenses.currencyControlChargeEUR)}</td>
        </tr>
        <!-- Row 4: Total Euro -->
        <tr style="background-color: #eff6ff; font-size: 10.5px;">
            <td colspan="2" class="text-right" style="color: #0f2c59;"><strong>TOTAL: (Euro)</strong></td>
            <td id="grand_total_eur" class="text-right" style="color: #0f2c59; font-weight: 800;">${formatNum(pda.portExpenses.grandTotalEUR)}</td>
        </tr>
        <!-- Row 5: Total Target Currency -->
        <tr style="background-color: #dbeafe; font-size: 10.5px; border-top: 2px solid #1d4ed8;">
            <td colspan="2" class="text-right" style="color: #0f2c59;"><strong id="curr_label_total">TOTAL: (${pda.targetCurrency})</strong></td>
            <td id="grand_total_curr" class="text-right" style="color: #1d4ed8; font-weight: 900; font-size: 11px;">${formatNum(pda.portExpenses.grandTotalTargetCurr)}</td>
        </tr>
    </tbody></table>

    <!-- PORT RESTRICTIONS & REGULATIONS - Full-width compact box -->
    <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 4px; padding: 4px 8px; margin-top: 5px; font-size: 8px; line-height: 1.25;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 2px;">
            <strong style="color: var(--primary-color); text-transform: uppercase;">Restrictions / Port Regulations (${pda.port})</strong>
        </div>
        <div style="color: #334155;">
            ${branch.restrictions.replace(/\n/g, '<br>')}
        </div>
    </div>

    <div class="page-footer">
        <span>SOCIETE COMMERCIALE TUNISIENNE - Proforma Disbursement Account</span>
        <span>SOCOTU Maritime Agency</span>
    </div>

    <div class="btn-container">
        <button class="btn-print" onclick="window.print()">🖨️ Imprimer</button>
        <button class="btn-save" onclick="saveDataToFile()">💾 Sauvegarder</button>
    </div>
</div>

<script>
function formatNum(val) {
    if (isNaN(val)) return "0,000";
    let parts = val.toFixed(3).split('.');
    let integerPart = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
    return integerPart + "," + parts[1];
}

function formatInt(val) {
    if (isNaN(val)) return "0";
    let rounded = Math.ceil(val);
    return rounded.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
}

function onPortChange() {
    let port = document.getElementById('port_selector').value;
    document.getElementById('port_label_date').innerText = port;
    document.getElementById('agency_subtitle').innerText = "Agence " + port;
    let branchText = "SOCIETE COMMERCIALE TUNISIENNE - Agence " + port;
    document.getElementById('branch_name').value = branchText;
    recalculate();
}

function recalculate() {
    let loa = parseFloat(document.getElementById('loa').value) || 0;
    let beam = parseFloat(document.getElementById('beam').value) || 0;
    let draft = parseFloat(document.getElementById('draft').value) || 0;
    let ex_rate_raw = (document.getElementById('ex_rate').value || '1.20').replace(',', '.');
    let ex_rate = parseFloat(ex_rate_raw) || 1.20;
    let curr_symbol = document.getElementById('curr_selector').value;

    document.getElementById('curr_label_total').innerText = "TOTAL: (" + curr_symbol + ")";

    let min_draft = 0.14 * Math.sqrt(loa * beam);
    document.getElementById('theor_draft').value = min_draft.toFixed(3);

    let actual_draft = Math.max(draft, min_draft);
    let volume = Math.ceil(loa * beam * actual_draft);

    document.getElementById('vol_display').innerText = formatInt(volume);

    let bracketName = "";
    if (volume <= 1000) {
        bracketName = "Bracket 1 (0 - 1,000 m³)";
    } else if (volume <= 10000) {
        bracketName = "Bracket 2 (1,001 - 10,000 m³)";
    } else if (volume <= 25000) {
        bracketName = "Bracket 3 (10,001 - 25,000 m³)";
    } else if (volume <= 40000) {
        bracketName = "Bracket 4 (25,001 - 40,000 m³)";
    } else if (volume <= 75000) {
        bracketName = "Bracket 5 (40,001 - 75,000 m³)";
    } else {
        bracketName = "Bracket 6 (> 75,000 m³)";
    }

    function getDefaultMooringLines(v) {
        if (v <= 1000) return 6;
        if (v <= 10000) return 8;
        if (v <= 25000) return 12;
        if (v <= 40000) return 16;
        if (v <= 75000) return 20;
        if (v <= 150000) return 24;
        return 30;
    }

    if (!window._userModifiedMooring) {
        let nMooringEl = document.getElementById('n_mooring');
        if (nMooringEl) nMooringEl.value = getDefaultMooringLines(volume);
    }

    let shelter_base = 0;
    let stay_unit = 0;
    let pilot_unit = 0;

    if (volume <= 10000) {
        shelter_base = volume * 0.0876;
        stay_unit = volume * 0.059;
        let calc_pilot = volume * 0.1104;
        pilot_unit = (volume <= 1000) ? Math.max(calc_pilot, 110.400) : 110.4 + 0.0107 * (volume - 1000);
    } else if (volume <= 25000) {
        shelter_base = 876 + 0.0804 * (volume - 10000);
        stay_unit = 590 + 0.0536 * (volume - 10000);
        pilot_unit = 206.4 + 0.0096 * (volume - 10000);
    } else if (volume <= 40000) {
        shelter_base = 2082 + 0.0732 * (volume - 25000);
        stay_unit = 1394 + 0.0496 * (volume - 25000);
        pilot_unit = 350.4 + 0.0091 * (volume - 25000);
    } else if (volume <= 75000) {
        shelter_base = 3180 + 0.0696 * (volume - 40000);
        stay_unit = 2138 + 0.047 * (volume - 40000);
        pilot_unit = 487.2 + 0.0086 * (volume - 40000);
    } else if (volume <= 150000) {
        shelter_base = 5616 + 0.0648 * (volume - 75000);
        stay_unit = 3783 + 0.044 * (volume - 75000);
        pilot_unit = 781.2 + 0.0084 * (volume - 75000);
    } else {
        shelter_base = 10476 + 0.0624 * (volume - 150000);
        stay_unit = 7083 + 0.0415 * (volume - 150000);
        pilot_unit = 1419.6 + 0.0077 * (volume - 150000);
    }

    const bracketElem = document.getElementById('bracket_display');
    if (bracketElem) bracketElem.innerText = bracketName;

    let n_stay = parseFloat(document.getElementById('n_stay').value) || 0;
    document.getElementById('n_stay_table').value = n_stay;

    let n_shelter = parseFloat(document.getElementById('n_shelter').value) || 0;
    let n_pilot = parseFloat(document.getElementById('n_pilot').value) || 0;
    let n_tug = parseFloat(document.getElementById('n_tug').value) || 0;
    let n_mooring = parseFloat(document.getElementById('n_mooring').value) || 0;

    let shelter_unit_ttc = shelter_base * 1.19;
    let tot_shelter = shelter_unit_ttc * n_shelter;
    document.getElementById('u_shelter').innerText = formatNum(shelter_unit_ttc);
    if (document.getElementById('tot_shelter')) document.getElementById('tot_shelter').innerText = formatNum(tot_shelter);

    let stay_unit_ttc = stay_unit * 1.19;
    let tot_stay = stay_unit_ttc * n_stay;
    document.getElementById('u_stay').innerText = formatNum(stay_unit_ttc);
    if (document.getElementById('tot_stay')) document.getElementById('tot_stay').innerText = formatNum(tot_stay);

    let pilot_unit_ttc = pilot_unit * 1.19;
    let tot_pilot = pilot_unit_ttc * n_pilot;
    document.getElementById('u_pilot').innerText = formatNum(pilot_unit_ttc);
    if (document.getElementById('tot_pilot')) document.getElementById('tot_pilot').innerText = formatNum(tot_pilot);

    // REMORQUAGE — JORT N°67 du 22.08.2017
    let tug_unit = 0, tug_bracket = '';
    if (volume <= 1000) { tug_unit = 114; tug_bracket = '0–1 000 m³ : 114 EUR/h'; }
    else if (volume <= 10000) { tug_unit = 114 + 0.03034 * (volume - 1000); tug_bracket = '1 001–10 000 : 114 + 0,03034 × excédent'; }
    else if (volume <= 25000) { tug_unit = 387 + 0.0266 * (volume - 10000); tug_bracket = '10 001–25 000 : 387 + 0,0266 × excédent'; }
    else if (volume <= 40000) { tug_unit = 786 + 0.0240 * (volume - 25000); tug_bracket = '25 001–40 000 : 786 + 0,0240 × excédent'; }
    else if (volume <= 75000) { tug_unit = 1146 + 0.0236 * (volume - 40000); tug_bracket = '40 001–75 000 : 1 146 + 0,0236 × excédent'; }
    else if (volume <= 150000) { tug_unit = 1972 + 0.0068 * (volume - 75000); tug_bracket = '75 001–150 000 : 1 972 + 0,0068 × excédent'; }
    else { tug_unit = 2210 + 0.0061 * (volume - 150000); tug_bracket = '>150 000 : 2 210 + 0,0061 × excédent'; }
    document.getElementById('tug_bracket').innerText = tug_bracket;
    let tug_unit_ttc = tug_unit * 1.19;
    let tot_tug = tug_unit_ttc * n_tug;
    document.getElementById('u_tug').innerText = formatNum(tug_unit_ttc);
    if (document.getElementById('tot_tug')) document.getElementById('tot_tug').innerText = formatNum(tot_tug);

    // ISPS APRÈS REMORQUAGE (Exonéré de TVA / 0% TVA)
    // Ligne 1 : 5% du Shelter HT
    let t_shelter_ht = shelter_base * n_shelter;
    let isps_shelter_unit = t_shelter_ht * 0.05;
    let tot_isps_shelter = isps_shelter_unit;

    if (document.getElementById('u_isps_shelter')) document.getElementById('u_isps_shelter').innerText = formatNum(isps_shelter_unit);
    if (document.getElementById('tot_isps_shelter')) document.getElementById('tot_isps_shelter').innerText = formatNum(tot_isps_shelter);

    // Ligne 2 : 5% de Stay Dues HT
    let t_stay_ht = stay_unit * n_stay;
    let isps_stay_unit = t_stay_ht * 0.05;
    let tot_isps_stay = isps_stay_unit;

    if (document.getElementById('u_isps_stay')) document.getElementById('u_isps_stay').innerText = formatNum(isps_stay_unit);
    if (document.getElementById('tot_isps_stay')) document.getElementById('tot_isps_stay').innerText = formatNum(tot_isps_stay);

    let tot_isps = tot_isps_shelter + tot_isps_stay;

    let sub_port_dues = tot_shelter + tot_stay + tot_pilot + tot_isps + tot_tug;
    document.getElementById('sub_port_dues').innerText = formatNum(sub_port_dues);

    // LAMANAGE / AMARRAGE-DESAMARRAGE JORT N°90 du 04/09/2020:
    // Formule: Embarcation 90 € HT + (taux amarre × nbr amarres) HT + 19% TVA
    let def_amarres = 10;
    let rate_amarre = 12;
    if (volume <= 1000) { def_amarres = 6; rate_amarre = 6; }
    else if (volume <= 10000) { def_amarres = 8; rate_amarre = 6; }
    else if (volume <= 25000) { def_amarres = 10; rate_amarre = 12; }
    else if (volume <= 40000) { def_amarres = 12; rate_amarre = 15; }
    else if (volume <= 75000) { def_amarres = 15; rate_amarre = 18; }
    else if (volume <= 150000) { def_amarres = 20; rate_amarre = 20; }
    else { def_amarres = 24; rate_amarre = 25; }

    let default_mooring_u = Math.round((90.0 + rate_amarre * def_amarres) * 1.19 * 1000) / 1000;
    let u_mooring_el = document.getElementById('u_mooring');
    let u_mooring = default_mooring_u;
    if (u_mooring_el) {
        u_mooring_el.value = default_mooring_u.toFixed(2);
    }
    let n_mooring = document.getElementById('n_mooring') ? (parseFloat(document.getElementById('n_mooring').value) || 0) : 2;
    let tot_mooring = u_mooring * n_mooring;

    if (document.getElementById('tot_mooring')) document.getElementById('tot_mooring').innerText = formatNum(tot_mooring);

    let u_watch = parseFloat(document.getElementById('u_watch').value) || 0;
    let n_watch = parseFloat(document.getElementById('n_watch').value) || 0;
    let tot_watch = u_watch * n_watch;
    if (document.getElementById('tot_watch')) document.getElementById('tot_watch').innerText = formatNum(tot_watch);

    let u_garb = parseFloat(document.getElementById('u_garb').value) || 0;
    let n_garb = parseFloat(document.getElementById('n_garb').value) || 0;
    let tot_garb = u_garb * n_garb;
    if (document.getElementById('tot_garb')) document.getElementById('tot_garb').innerText = formatNum(tot_garb);

    let sub_port_expenses = tot_mooring + tot_watch + tot_garb;
    document.getElementById('sub_port_expenses').innerText = formatNum(sub_port_expenses);

    let agency_fees = parseFloat(document.getElementById('agency_fees').value) || 0;
    let proforma_before_currency_control = sub_port_dues + sub_port_expenses + agency_fees;
    let currency_control_rate = parseFloat(document.getElementById('currency_control_rate')?.value) || 0;
    let currency_control_charge = proforma_before_currency_control * currency_control_rate / 100;
    document.getElementById('currency_control_charge').innerText = formatNum(currency_control_charge);

    let grand_total_eur = proforma_before_currency_control + currency_control_charge;
    document.getElementById('grand_total_eur').innerText = formatNum(grand_total_eur);

    let grand_total_curr = grand_total_eur * ex_rate;
    document.getElementById('grand_total_curr').innerText = formatNum(grand_total_curr);
}

function saveDataToFile() {
    let htmlContent = document.documentElement.outerHTML;
    let blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'SOCOTU_PDA_${pda.ref}.html';
    a.click();
}
</script>
</body>
</html>`;
}
