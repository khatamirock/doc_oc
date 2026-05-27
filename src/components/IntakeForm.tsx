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
      alert("দয়া করে কমপক্ষে প্রধান লক্ষণ এবং সমস্যার সময়কাল উল্লেখ করুন।");
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
            <h2 className="font-display font-bold text-sm leading-tight tracking-tight">ক্লিনিক্যাল ইনটেক ফর্ম</h2>
            <p className="text-[10px] text-slate-350 font-mono font-medium text-slate-400">তথ্য সংগ্রহ প্রোটোকল</p>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-50 p-3 border-b border-slate-200">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block mb-1.5">🔬 মূল্যায়ন প্রিসেট:</span>
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
          প্রাথমিক তথ্য
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
          অন্যান্য ডেমোগ্রাফিক্স
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4" id="intake-form-element">
        {activeTab === 'mandatory' ? (
          <div className="space-y-3.5">
            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>১. প্রধান লক্ষণ / সমস্যা <span className="text-red-500">*</span></span>
                <span className="text-[10px] font-mono font-normal text-gray-400">রোগীর নিজের ভাষায়</span>
              </label>
              <textarea
                name="chiefComplaint"
                id="input-chief-complaint"
                required
                rows={3}
                placeholder="প্রধান সমস্যা কী? যেমন: অতিরিক্ত মাত্রায় বুক জ্বালাপোড়া বা এসিডিটি।"
                value={formData.chiefComplaint}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white resize-none"
              />
            </div>

            {/* Duration and Onset */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ২. সমস্যা শুরুর সময়কাল <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                id="input-duration"
                required
                placeholder="যেমন: ৩ দিন ধরে, হঠাৎ করে শুরু হয়েছে"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Severity and Intensity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  ৩. তীব্রতা (Severity): <span className="text-teal-800 font-bold font-mono">{formData.severity}/10</span>
                </label>
                <span className="text-[10px] text-gray-400">1 (মৃদু) থেকে 10 (তীব্র অবস্থা) পর্যন্ত</span>
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
                <span>1 - মৃদু</span>
                <span>5 - মাঝারি</span>
                <span>10 - তীব্র/জরুরি</span>
              </div>
            </div>

            {/* Known Allergies */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <label className="block text-xs font-semibold text-red-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                ৪. অ্যালার্জি বা বিরূপ প্রতিক্রিয়া <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="knownAllergies"
                id="input-allergies"
                placeholder="যেমন: পেনিসিলিনে অ্যালার্জি আছে, অথবা কোন অ্যালার্জি নেই"
                value={formData.knownAllergies}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-red-200 bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-400 focus:border-red-400 text-red-950 font-medium"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ৫. বর্তমান নিয়মিত ঔষধ
              </label>
              <textarea
                name="currentMedications"
                id="input-medications"
                rows={2}
                placeholder="যেমন: ক্যালসিয়াম, ভিটামিন, প্যারাসিটামল"
                value={formData.currentMedications}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Comorbidities */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-teal-700" />
                ৬. অন্যান্য রোগ (কোমরবিডিটি)
              </label>
              <input
                type="text"
                name="comorbidities"
                id="input-comorbidities"
                placeholder="যেমন: ডায়াবেটিস, ব্লাড প্রেসার, ইত্যাদি"
                value={formData.comorbidities}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            {/* Investigations */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ৭. পূর্ববর্তী রিপোর্ট / সাম্প্রতিক পরীক্ষা
              </label>
              <input
                type="text"
                name="knownDiagnosis"
                id="input-diagnosis"
                placeholder="যেমন: রক্তের ব্লাড সুগার রিপোর্ট, এন্ডোস্কপি ইত্যাদি"
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
                  বয়স
                </label>
                <input
                  type="number"
                  name="age"
                  id="input-age"
                  placeholder="বছর"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  লিঙ্গ
                </label>
                <select
                  name="sex"
                  id="input-sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                >
                  <option value="Male">পুরুষ</option>
                  <option value="Female">মহিলা</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ওজন
                </label>
                <input
                  type="text"
                  name="weight"
                  id="input-weight"
                  placeholder="যেমন: 70kg"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Diet & Hydration */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                খাদ্যাভ্যাস এবং দৈনিক পানি পান
              </label>
              <textarea
                name="dietHydration"
                id="input-diet"
                rows={2}
                placeholder="পানি, মসলা জাতীয় খাবার, ইত্যাদি"
                value={formData.dietHydration}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Occupation & Activity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পেশা এবং শারীরিক কার্যকলাপ
              </label>
              <input
                type="text"
                name="occupationActivity"
                id="input-activity"
                placeholder="ডেস্ক জব, প্রতিদিন ২ কিমি হাঁটা"
                value={formData.occupationActivity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Substance Use */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ধূমপান ও মদ্যপান
              </label>
              <input
                type="text"
                name="substanceUse"
                id="input-substances"
                placeholder="ধূমপান, অ্যালকোহল, বা অতিরিক্ত কফি পান"
                value={formData.substanceUse}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Exposure data */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                সাম্প্রতিক ঘোরাঘুরি ও সংক্রমণ ঝুঁকি
              </label>
              <input
                type="text"
                name="recentExposures"
                id="input-exposures"
                placeholder="যেমন: সদ্য গ্রামে ভ্রমণ, আশেপাশে ভাইরাল জ্বর রোগী ইত্যাদি"
                value={formData.recentExposures}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Family History */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পারিবারিক স্বাস্থ্য ইতিহাস
              </label>
              <input
                type="text"
                name="familyHistory"
                id="input-family"
                placeholder="পারিবারিকভাবে ডায়াবেটিস, হাঁপানি বা হৃদরোগ আছে কিনা"
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
            রোগীর প্রোফাইল সেট করুন এবং চ্যাট সিঙ্ক করুন
          </button>
        </div>
      </form>
    </div>
  );
}
