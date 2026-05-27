/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PatientIntake } from '../types';
import { User, ClipboardList, ShieldAlert, Heart, Calendar, HelpCircle } from 'lucide-react';

interface IntakeFormProps {
  onSave: (intake: PatientIntake) => void;
  initialIntake?: PatientIntake;
}

// Medical Case Presets for quick evaluation
const PRESETS: Array<{ name: string; label: string; data: PatientIntake }> = [
  {
    name: 'gastritis',
    label: '৳ Gastric Acid Reflux (Local Context)',
    data: {
      chiefComplaint: 'Burning chest sensation (heartburn), bloating, and sour belching after eating spicy food.',
      duration: '4 days, worsening in the evening',
      severity: '7 out of 10 (Moderate-Severe)',
      knownDiagnosis: 'No formal diagnosis, but occasional mild heartburn in the past.',
      currentMedications: 'None regular. Took one over-the-counter Antacid tablet yesterday with minor relief.',
      knownAllergies: 'Asthma/dust allergy. No known drug allergies.',
      comorbidities: 'Mild chronic anxiety, no liver/kidney impairments.',
      age: '34',
      sex: 'Male',
      weight: '78 kg',
      dietHydration: 'Enjoys hot tea, spicy curry; drinks 1.5 litres of water daily.',
      occupationActivity: 'Software engineer, sits for 8-9 hours daily.',
      substanceUse: 'Light nonsmoker. Occasional tea/coffee.',
      recentExposures: 'No recent travel or exposures.',
      familyHistory: 'Father has type 2 diabetes and hypertension.'
    }
  },
  {
    name: 'cough',
    label: '🗣️ Dry Cough & Sore Throat',
    data: {
      chiefComplaint: 'Frequent dry, hacking cough accompanied by scratchy throat and subfebrile temperature (99.5F).',
      duration: '6 days',
      severity: '5 out of 10 (Moderate discomfort)',
      knownDiagnosis: 'None.',
      currentMedications: 'None.',
      knownAllergies: 'Penicillin allergy (causes hives).',
      comorbidities: 'None.',
      age: '28',
      sex: 'Female',
      weight: '62 kg',
      dietHydration: 'Regular home-cooked meal, warm liquid intake, drinks 2.5L water.',
      occupationActivity: 'High school teacher (demands high vocal usage).',
      substanceUse: 'Nonsmoker, social drinker (none since symptoms).',
      recentExposures: 'Exposed to colleagues at school recovering from a common cold.',
      familyHistory: 'Mother has asthma.'
    }
  },
  {
    name: 'pain',
    label: '🦴 Chronic Lower Back Stiffness',
    data: {
      chiefComplaint: 'Dull ache and stiffness in the lumbar region, radiating slightly to the left glute. Hard to bend down in the morning.',
      duration: '3 months (gradual onset)',
      severity: '6 out of 10 (intermittent moderate pain)',
      knownDiagnosis: 'L4-L5 mild disc bulge diagnosed 1 year ago via MRI.',
      currentMedications: 'Occasional Ibuprofen 400mg when pain is sharp (once or twice a week).',
      knownAllergies: 'No known drug or nutrient allergies.',
      comorbidities: 'Hypertension (well controlled).',
      age: '55',
      sex: 'Female',
      weight: '84 kg',
      dietHydration: 'Balanced diet, trying to limit sodium. Drinks 2L water daily.',
      occupationActivity: 'Bank accountant, sedentary desk work. Little physical exercise.',
      substanceUse: 'None.',
      recentExposures: 'None.',
      familyHistory: 'Maternal history of early-onset osteoarthritis.'
    }
  }
];

export default function IntakeForm({ onSave, initialIntake }: IntakeFormProps) {
  const defaultIntake: PatientIntake = {
    chiefComplaint: '',
    duration: '',
    severity: '5',
    knownDiagnosis: '',
    currentMedications: '',
    knownAllergies: '',
    comorbidities: '',
    age: '',
    sex: 'Male',
    weight: '',
    dietHydration: '',
    occupationActivity: '',
    substanceUse: '',
    recentExposures: '',
    familyHistory: ''
  };

  const [formData, setFormData] = useState<PatientIntake>(initialIntake || defaultIntake);
  const [activeTab, setActiveTab] = useState<'mandatory' | 'contextual'>('mandatory');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (presetData: PatientIntake) => {
    setFormData(presetData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chiefComplaint.trim() || !formData.duration.trim()) {
      alert("Please fill in at least the Chief Complaint and Duration of symptoms.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full" id="clinical-intake-module">
      {/* Module Title */}
      <div className="bg-slate-705 p-3.5 border-b border-slate-200 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-805 rounded-md border border-slate-600/50">
            <ClipboardList className="w-4 h-4 text-slate-100" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm leading-tight tracking-tight">Clinical Intake Sheet</h2>
            <p className="text-[10px] text-slate-350 font-mono font-medium text-slate-400">Information Gathering Protocol</p>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-50 p-3 border-b border-slate-200">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block mb-1.5">🔬 Evaluation Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              id={`preset-btn-${preset.name}`}
              onClick={() => handleApplyPreset(preset.data)}
              className="text-[11px] px-2 py-0.5 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200 text-slate-700 rounded-md shadow-2xs active:scale-95 transition-all text-left font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          id="tab-mandatory"
          onClick={() => setActiveTab('mandatory')}
          className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mandatory'
              ? 'border-blue-600 text-blue-800 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/55'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          Required Core Data
        </button>
        <button
          type="button"
          id="tab-contextual"
          onClick={() => setActiveTab('contextual')}
          className={`flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'contextual'
              ? 'border-blue-600 text-blue-800 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/55'
          }`}
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          Context & Demographics
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4" id="intake-form-element">
        {activeTab === 'mandatory' ? (
          <div className="space-y-3.5">
            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>1. Chief Complaint (Symptoms) <span className="text-red-500">*</span></span>
                <span className="text-[10px] font-mono font-normal text-gray-400">In patient's words</span>
              </label>
              <textarea
                name="chiefComplaint"
                id="input-chief-complaint"
                required
                rows={3}
                placeholder="What is the main physical problem? e.g., Severe burning chest pain after eating curry, acid belching."
                value={formData.chiefComplaint}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white resize-none"
              />
            </div>

            {/* Duration and Onset */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                2. Onset & Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                id="input-duration"
                required
                placeholder="e.g., 3 days, sudden onset; worse inside air-conditioning"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Severity and Intensity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  3. Pain / Severity Level: <span className="text-teal-800 font-bold font-mono">{formData.severity}/10</span>
                </label>
                <span className="text-[10px] text-gray-400">Scale of 1 (Mild) to 10 (Crisis)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                name="severity"
                id="input-severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 px-0.5 mt-1">
                <span>1 - Mild</span>
                <span>5 - Moderate</span>
                <span>10 - Severe/Emergency</span>
              </div>
            </div>

            {/* Known Allergies */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <label className="block text-xs font-semibold text-red-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                4. Known Drug & Nutrient Allergies <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="knownAllergies"
                id="input-allergies"
                placeholder="e.g., Penicillin, hives; shellfish, no drug allergy known"
                value={formData.knownAllergies}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-red-200 bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-400 focus:border-red-400 text-red-950 font-medium"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                5. Current Daily Medications (Prescription or OTC)
              </label>
              <textarea
                name="currentMedications"
                id="input-medications"
                rows={2}
                placeholder="Include supplements, dosage, or 'None'"
                value={formData.currentMedications}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Comorbidities */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-teal-700" />
                6. Core Comorbidities & Chronic Illnesses
              </label>
              <input
                type="text"
                name="comorbidities"
                id="input-comorbidities"
                placeholder="e.g., Type 2 Diabetes, hypertension, kidney disease, none"
                value={formData.comorbidities}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Investigations */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                7. Previous Diagnostics / Recent Investigations
              </label>
              <input
                type="text"
                name="knownDiagnosis"
                id="input-diagnosis"
                placeholder="e.g., CBC or Endoscopy report summary, none"
                value={formData.knownDiagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Demographics row */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  id="input-age"
                  placeholder="Yrs"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  name="sex"
                  id="input-sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  id="input-weight"
                  placeholder="e.g. 70kg"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Diet & Hydration */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dietary Habits & Daily Hydration
              </label>
              <textarea
                name="dietHydration"
                id="input-diet"
                rows={2}
                placeholder="Water intake, heavy spices, junk food, fasting schedules"
                value={formData.dietHydration}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Occupation & Activity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Occupation & Physical Activity
              </label>
              <input
                type="text"
                name="occupationActivity"
                id="input-activity"
                placeholder="e.g. Desk job, sitting 10hrs; walks 3km daily"
                value={formData.occupationActivity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Substance Use */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Habits & Substances
              </label>
              <input
                type="text"
                name="substanceUse"
                id="input-substances"
                placeholder="Smoking, alcohol, high-dose caffeine"
                value={formData.substanceUse}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Exposure data */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                Recent Travel / Exposure / Infections
              </label>
              <input
                type="text"
                name="recentExposures"
                id="input-exposures"
                placeholder="Recent throat virus, family members sick, travel history"
                value={formData.recentExposures}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Family History */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Family Medical History
              </label>
              <input
                type="text"
                name="familyHistory"
                id="input-family"
                placeholder="Early cardiac conditions, asthma, cancer genes"
                value={formData.familyHistory}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="submit"
            id="btn-save-intake"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs leading-none tracking-tight rounded-lg active:scale-[98%] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Establish Patient Profile & Sync Chat
          </button>
        </div>
      </form>
    </div>
  );
}
