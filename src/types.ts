/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PatientIntake {
  // Mandatory
  chiefComplaint: string;
  duration: string;
  severity: string; // 1-10 or descriptive
  knownDiagnosis: string;
  currentMedications: string;
  knownAllergies: string;
  comorbidities: string;

  // Contextual
  age: string;
  sex: string;
  weight: string;
  dietHydration: string;
  occupationActivity: string;
  substanceUse: string; // smoking, alcohol, etc.
  recentExposures: string; // travel, infections, etc.
  familyHistory: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  // If this message contains a complete clinical formulation, flag it so user can save it as PDF
  isClinicalAssessment?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  patientIntake?: PatientIntake;
  createdAt: string;
}
