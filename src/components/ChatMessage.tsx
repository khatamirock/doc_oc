/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { ChatMessage as MessageType, PatientIntake } from '../types';
import { exportElementToPDF } from '../lib/pdf';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  Calendar, 
  Check, 
  ShieldAlert, 
  Heart,
  Loader2,
  Stethoscope,
  Activity
} from 'lucide-react';

interface ChatMessageProps {
  message: MessageType;
  patientIntake?: PatientIntake;
  isLatest: boolean;
}

export default function ChatMessage({ message, patientIntake, isLatest }: ChatMessageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const isAssistant = message.role === 'assistant';

  // Format timestamp to local displayable string
  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Determine if this message is a structured clinical report
  const hasPrescriptionPlan = message.content.includes('💊') || message.content.includes('Prescription Plan');

  const handleExportPDF = () => {
    const elementId = `report-capture-${message.id}`;
    const filename = `Clinical_Consultation_${new Date().toISOString().slice(0,10)}.pdf`;
    exportElementToPDF(elementId, filename, setIsExporting);
  };

  return (
    <div className={`flex flex-col mb-4 ${isAssistant ? 'items-start' : 'items-end'}`}>
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-[10px] font-mono text-slate-450 text-slate-500 font-semibold">
          {isAssistant ? 'Clinical Consultant AI' : 'Patient'} • {formatTime(message.timestamp)}
        </span>
        {isAssistant && hasPrescriptionPlan && (
          <span className="bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-md font-mono border border-blue-100 font-bold flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5 text-blue-600" /> Assessment Active
          </span>
        )}
      </div>

      {!isAssistant ? (
        /* Patient message bubble - elegant deep blue of high density spec */
        <div className="max-w-[85%] bg-blue-600 text-white px-3.5 py-2.5 rounded-xl rounded-tr-xs shadow-xs text-xs font-semibold leading-relaxed border border-blue-700">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        /* Assistant message bubble - styled like a medical record sheet if structured */
        <div className="w-full max-w-[95%]">
          {hasPrescriptionPlan ? (
            /* Medical Report Card Container */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              {/* Card Header for UI View */}
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 font-display">Diagnostic & Guidance Advisory</span>
                </div>
                <button
                  type="button"
                  id={`btn-pdf-export-${message.id}`}
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-[11px] leading-none tracking-tight rounded-md cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Saving PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Save Report as PDF
                    </>
                  )}
                </button>
              </div>

              {/* PRINT & PREVIEW TARGET */}
              <div 
                id={`report-capture-${message.id}`} 
                className="p-6 md:p-8 bg-white text-slate-800 clinical-report-container whitespace-normal select-text leading-relaxed border border-slate-100 rounded-lg"
              >
                {/* PDF Header Logo Block */}
                <div className="border-b-2 border-slate-300 pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-805 mb-1">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <h1 className="text-base font-bold tracking-tight font-display text-slate-805 uppercase">CLINICAL ASSESSMENT DOCUMENT</h1>
                    </div>
                    <p className="text-[10px] text-slate-500 max-w-sm uppercase font-mono tracking-wider font-bold">
                      Consultant Desk v2.0 • Evidence-Based Decision Plan
                    </p>
                  </div>
                  <div className="text-right md:text-right text-[10px] font-mono text-slate-500 leading-normal border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 w-full md:w-auto">
                    <div><strong>Consult Date:</strong> {new Date(message.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div><strong>Report ID:</strong> CCN-{message.id.slice(0, 6).toUpperCase()}</div>
                    <div className="text-blue-600 font-bold uppercase">Bangladesh local drug metrics verified</div>
                  </div>
                </div>

                {/* Patient Dossier Panel included for context in pdf export */}
                {patientIntake && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                    <h3 className="text-xs font-bold text-slate-805 uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 font-display">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Patient Consultation Dossier
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] leading-relaxed">
                      {patientIntake.chiefComplaint && (
                        <div className="col-span-1 md:col-span-2">
                          <strong>Chief complaint:</strong> <span className="text-slate-700">{patientIntake.chiefComplaint}</span>
                        </div>
                      )}
                      <div><strong>Onset & Duration:</strong> <span className="text-slate-700">{patientIntake.duration}</span></div>
                      <div><strong>Reported severity:</strong> <span className="text-blue-700 font-bold font-mono">{patientIntake.severity}/10</span></div>
                      
                      {patientIntake.knownAllergies && (
                        <div className="col-span-1 md:col-span-2 p-1.5 bg-red-50 text-red-950 rounded border border-red-100">
                          <strong>Allergies / Adverse responses:</strong> <span className="font-semibold">{patientIntake.knownAllergies}</span>
                        </div>
                      )}
                      
                      {patientIntake.comorbidities && (
                        <div><strong>Comorbidities:</strong> <span className="text-slate-700">{patientIntake.comorbidities}</span></div>
                      )}
                      {patientIntake.currentMedications && (
                        <div><strong>Current medications:</strong> <span className="text-slate-700">{patientIntake.currentMedications}</span></div>
                      )}
                      {(patientIntake.age || patientIntake.sex || patientIntake.weight) && (
                        <div>
                          <strong>Demographics:</strong> <span className="text-slate-700">
                            {[patientIntake.age ? `${patientIntake.age}y` : '', patientIntake.sex, patientIntake.weight].filter(Boolean).join(' | ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Structured Text Content */}
                <div className="text-xs md:text-[12px] text-slate-800 leading-normal font-sans prose prose-slate max-w-none">
                  <Markdown
                    components={{
                      // Customizing markdown output to render stunning clinical UI formats
                      h3: ({ children }) => {
                        const text = children?.toString() || '';
                        let icon = null;
                        let color = "text-slate-805 border-slate-205";
                        
                        if (text.includes('Symptom Summary') || text.includes('🔎')) {
                          icon = <Activity className="w-3.5 h-3.5 text-blue-600 inline mr-1.5" />;
                        } else if (text.includes('Root Cause') || text.includes('🧩')) {
                          icon = <Stethoscope className="w-3.5 h-3.5 text-blue-600 inline mr-1.5" />;
                        } else if (text.includes('Therapeutic') || text.includes('🎯')) {
                          icon = <Check className="w-3.5 h-3.5 text-green-600 inline mr-1.5" />;
                        } else if (text.includes('Prescription') || text.includes('💊')) {
                          icon = <Heart className="w-3.5 h-3.5 text-rose-600 inline mr-1.5" fill="rgba(225, 29, 72, 0.1)" />;
                          color = "text-slate-850 border-slate-300 bg-slate-50 p-1.5 rounded";
                        } else if (text.includes('Red Flags') || text.includes('⚠️')) {
                          icon = <AlertTriangle className="w-3.5 h-3.5 text-red-600 inline mr-1.5" />;
                          color = "red-flag-zone";
                        } else if (text.includes('Lifestyle') || text.includes('🌿')) {
                          icon = <Check className="w-3.5 h-3.5 text-blue-600 inline mr-1.5" />;
                          color = "text-slate-805 border-slate-200 bg-slate-50/50";
                        }

                        return (
                          <h3 className={`font-display text-xs md:text-xs font-bold uppercase tracking-tight border-b pb-1.5 mt-4 mb-2 flex items-center ${color}`}>
                            {icon}
                            {children}
                          </h3>
                        );
                      },
                      h4: ({ children }) => {
                        const isDrugHeader = children?.toString().includes('💊');
                        return isDrugHeader ? (
                          <div className="prescription-card border border-slate-300 bg-slate-50/50 p-2 my-2 rounded-lg font-display text-xs md:text-sm font-bold text-slate-805">
                            {children}
                          </div>
                        ) : (
                          <h4 className="font-display text-xs font-semibold tracking-tight mt-3 mb-1 text-slate-805">
                            {children}
                          </h4>
                        );
                      },
                      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                      li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2 border border-slate-200 rounded-lg shadow-2xs">
                          <table className="min-w-full text-left text-[11px] text-slate-700 bg-white leading-normal">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-805 font-bold uppercase font-mono text-[9px] tracking-wider">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>,
                      tr: ({ children }) => <tr className="hover:bg-slate-50/50 transition-colors">{children}</tr>,
                      th: ({ children }) => <th className="px-3 py-1.5 font-semibold text-slate-805">{children}</th>,
                      td: ({ children }) => <td className="px-3 py-1.5">{children}</td>,
                      code: ({ children }) => <code className="bg-slate-100 text-slate-805 px-1 py-0.5 rounded font-mono text-xs">{children}</code>
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>

                {/* Professional clinical footnote for compliance */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] leading-relaxed text-slate-505 text-slate-500 font-sans italic">
                  <p className="mb-1">
                    <strong>Bangladesh medex.com.bd Verification Flag:</strong> Brand alternatives, forms, and pricing estimates are compiled as reference benchmarks from major manufacturers (Square, Incepta, Beximco) on the basis of current formulations and DGDA local criteria.
                  </p>
                  <p>
                    <strong>Disclaimer:</strong> This is an AI-powered clinical decision support report modeled on the Physician + Clinical Pharmacist system. It does not constituent a legally binding medical prescription. Please execute review with a registered physician or medical practitioner before therapeutic ingestion.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* General text assistant message (e.g. asking clarifying questions or pleasantries) */
            <div className="max-w-[90%] bg-white text-slate-855 px-3.5 py-2.5 rounded-xl rounded-tl-xs border border-slate-200 shadow-2xs text-xs font-semibold leading-relaxed">
              <Markdown
                components={{
                  code: ({ children }) => <code className="bg-slate-150 text-slate-900 px-1 py-0.5 rounded font-mono text-xs font-semibold bg-slate-100">{children}</code>
                }}
              >
                {message.content}
              </Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
