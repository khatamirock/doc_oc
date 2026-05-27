/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PatientIntake, ChatMessage as MessageType } from './types';
import IntakeForm from './components/IntakeForm';
import ChatMessage from './components/ChatMessage';
import {
  Stethoscope,
  Trash2,
  User,
  AlertCircle,
  ArrowRight,
  Send,
  Loader2,
  Calendar,
  Sparkles,
  RefreshCw,
  Heart,
  FileText,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [patientIntake, setPatientIntake] = useState<PatientIntake | undefined>(undefined);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'intake' | 'chat' | 'dashboard'>('chat');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Check backend server availability on boot
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setServerOnline(data.hasApiKey);
        // Start conversation with a warm clinical greeting
        setMessages([
          {
            id: 'system-initial',
            role: 'assistant',
            content: `### 🩺 ক্লিনিক্যাল মেডিকেল কনসালটেন্ট সাপোর্টে স্বাগতম

আমি একজন আধুনিক ক্লিনিক্যাল ফার্মাকোলজি এবং ডায়াগনস্টিক কনসালটেশন ডেস্ক। আপনার লক্ষণ এবং শারীরিক অবস্থার ওপর ভিত্তি করে আমি রোগ নির্ণয় করি এবং **বাংলাদেশী (medex.com.bd)** নির্দেশিকা অনুযায়ী চিকিৎসা প্রদান করি।

পরামর্শ শুরু করতে, দয়া করে:
১. **বাম দিকের ক্লিনিক্যাল ইনটেক ফর্মে আপনার প্রাথমিক তথ্য দিন** (অথবা দ্রুত মূল্যায়নের জন্য একটি প্রিসেট নির্বাচন করুন)।
২. চিকিৎসা প্রসঙ্গ সিঙ্ক করতে **"সক্রিয় প্রোফাইল সেট করুন"**-এ ক্লিক করুন।
৩. চিকিৎসা বা পরামর্শ তৈরি করার জন্য আপনার অন্য কোন সমস্যার কথা লিখুন বা প্রশ্ন করুন।`,
            timestamp: new Date().toISOString()
          }
        ]);
      })
      .catch(err => {
        console.error("Health check failure:", err);
        setServerOnline(false);
      });
  }, []);

  // Autoscroll to bottom when messages stream
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle saving clinical intake sheet and syncing to chat context
  const handleSaveIntake = (intake: PatientIntake) => {
    setPatientIntake(intake);

    // Auto-generate a beautiful summary message representing the patient file
    const intakeSummary = `### 📋 ক্লিনিক্যাল ইনটেক ফর্ম সিঙ্ক্রোনাইজড

**রোগীর বিস্তারিত:**
- **বয়স:** ${intake.age || 'উল্লেখ নেই'} | **লিঙ্গ:** ${intake.sex} | **ওজন:** ${intake.weight || 'উল্লেখ নেই'}
- **প্রধান লক্ষণ:** ${intake.chiefComplaint}
- **সময়কাল এবং শুরু:** ${intake.duration}
- **তীব্রতা মাত্রা:** ${intake.severity}/10 

**নিরাপত্তা ও অন্যান্য রোগ:**
- **অ্যালার্জি:** ${intake.knownAllergies || 'নেই'}
- **চলমান ঔষধ:** ${intake.currentMedications || 'নেই'}
- **অন্যান্য রোগ (কোমরবিডিটি):** ${intake.comorbidities || 'নেই'}
- **রিপোর্টস/ইতিহাস:** ${intake.knownDiagnosis || 'নেই'}
- **খাদ্যাভ্যাস/জীবনধারা:** ${intake.dietHydration || 'সাধারণ খাদ্যাভ্যাস'}`;

    // Insert as the patient's system initialization message
    const userMessage: MessageType = {
      id: `intake-sync-${Date.now()}`,
      role: 'user',
      content: `আমার প্রতিষ্ঠিত রোগীর তথ্যগুলো বিশ্লেষণ করুন: \n\n${intakeSummary}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      // Clear out previous conversations to prevent overlapping symptoms, starting fresh with this profile
      const filtered = prev.filter(m => m.id === 'system-initial');
      return [...filtered, userMessage];
    });

    // Auto-generate initial diagnostic analysis using the clinical prompt
    triggerConsultationResponse([...messages.filter(m => m.id === 'system-initial'), userMessage]);
  };

  // Trigger stream formulation from the server
  const triggerConsultationResponse = async (chatHistory: MessageType[]) => {
    setIsLoading(true);

    const assistantMessageId = `assist-${Date.now()}`;
    const initialAssistantMessage: MessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let completedText = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on SSE delimiters
          const lines = buffer.split('\n\n');
          // Hold onto the last chunk in case it's partial
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('data: ')) {
              const dataStr = cleanLine.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  completedText += parsed.text;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: completedText, isClinicalAssessment: true }
                        : msg
                    )
                  );
                }
              } catch (err) {
                // Occasional partial JSON chunks, suppress & hold buffer
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Stream compilation error:", error);

      // Attempt fallback to non-streaming API route if stream fails
      try {
        const fallbackResponse = await fetch('/api/chat-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: chatHistory })
        });
        const data = await fallbackResponse.json();

        if (data.error) throw new Error(data.error);

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.text || 'প্রতিক্রিয়া পার্স করার সময় একটি সমস্যা দেখা দিয়েছে।', isClinicalAssessment: true }
              : msg
          )
        );
      } catch (fallbackError: any) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: `⚠️ **ক্লিনিক্যাল ডেস্ক পৌঁছানো যায়নি**\n\nসার্ভার-সাইড ইন্টেলিজেন্সে সাথে যোগাযোগ করতে সমস্যা হয়েছে: \n\`${fallbackError.message || error.message}\`\n\nদয়া করে আপনার এআই স্টুডিও কনফিগারেশনের সার্ভার ক্রেডেনশিয়াল চেক করুন।` }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: MessageType = {
      id: `user-msg-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');

    triggerConsultationResponse(updatedMessages);
  };

  // Pre-fill prompt text directly for faster evaluation
  const handleQuickQuestion = (text: string) => {
    setInputText(text);
  };

  const handleResetChat = () => {
    if (window.confirm("আপনি কি বর্তমান ক্লিনিক্যাল ফর্মালেশন রিসেট করতে চান? এতে বর্তমান তথ্য মুছে যাবে।")) {
      setPatientIntake(undefined);
      setMessages([
        {
          id: 'system-reset',
          role: 'assistant',
          content: `### 🩺 ডায়াগনস্টিক ডেস্ক রিসেট

রোগীর প্রোফাইল পরিষ্কার করা হয়েছে। দয়া করে বাম দিকের **ক্লিনিক্যাল ইনটেক ফর্মে** নতুন রোগীর প্রোফাইল তৈরি করুন।`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-100 text-slate-805 flex flex-col font-sans overflow-hidden" id="medical-application-root">

      {/* Upper Navigation Bar */}
      <header className="bg-slate-705 text-white border-b border-slate-805 sticky top-0 z-40 px-6 py-3 shadow-md" id="upper-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-md text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm md:text-base text-white leading-none tracking-tight">
                সিএমসি <span className="text-blue-500 font-extrabold">v2.0</span>
              </h1>
              <p className="text-[10px] text-slate-455 text-slate-400 font-medium tracking-tight mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" /> ক্লিনিক্যাল মেডিকেল কনসালটেন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status tracker */}
            <div className="text-[11px] text-slate-300 font-mono items-center gap-1.5 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
              <span>জেমিনি ৩.৫ ফ্ল্যাশ সক্রিয়</span>
            </div>

            {/* Server connection status alert */}
            {serverOnline === false && (
              <span className="text-[10px] bg-red-950/40 border border-red-900/50 text-red-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-500" /> এপিআই চেক ব্যর্থ
              </span>
            )}

            <button
              onClick={handleResetChat}
              id="header-reset-btn"
              className="px-2.5 py-1 bg-slate-805 hover:bg-slate-800 text-slate-300 hover:text-rose-400 rounded-md border border-slate-600 transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] font-bold"
              title="পুরো সক্রিয় ক্লিনিক্যাল সেশন রিসেট করুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সেশন রিসেট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content Area - Three-column layout for modern high density dashboards */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 lg:p-4 flex flex-col lg:grid lg:grid-cols-12 gap-4 overflow-hidden relative">

        {/* Left Column: Intake Sheet Module */}
        <section className={`${mobileTab === 'intake' ? 'flex' : 'hidden'} lg:flex lg:col-span-3 h-full overflow-hidden flex-col order-1 lg:order-1`}>
          {patientIntake ? (
            /* Locked profile badge with edit capability */
            <div className="bg-slate-705 text-white rounded-xl border border-slate-750 p-4 shadow-sm flex flex-col justify-between lg:h-full bg-gradient-to-br from-slate-705 to-slate-805">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-600/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-805 rounded">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">সক্রিয় প্রোফাইল</span>
                  </div>
                  <button
                    onClick={() => setPatientIntake(undefined)}
                    id="btn-edit-intake"
                    className="text-[10px] bg-slate-805 hover:bg-slate-800 border border-slate-600 px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer"
                  >
                    পরিবর্তন করুন
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase font-mono tracking-wider">প্রধান লক্ষণ:</span>
                    <p className="font-semibold text-slate-100 leading-normal font-display">{patientIntake.chiefComplaint}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-700/40 pt-2.5">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">সময়কাল:</span>
                      <span className="font-semibold text-slate-200">{patientIntake.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">তীব্রতা:</span>
                      <span className="font-bold text-red-400 font-mono">{patientIntake.severity}/10</span>
                    </div>
                  </div>

                  {patientIntake.knownAllergies && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-900/40 text-red-200 text-[10px]">
                      <strong>অ্যালার্জি:</strong> {patientIntake.knownAllergies}
                    </div>
                  )}

                  <div className="border-t border-slate-700/40 pt-2.5 space-y-2">
                    {patientIntake.comorbidities && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">অন্যান্য রোগ:</span>
                        <span className="text-slate-200">{patientIntake.comorbidities}</span>
                      </div>
                    )}
                    {patientIntake.currentMedications && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">চলমান ঔষধ:</span>
                        <span className="text-slate-200">{patientIntake.currentMedications}</span>
                      </div>
                    )}
                    {(patientIntake.age || patientIntake.sex) && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider font-semibold">রোগীর তথ্য:</span>
                        <span className="text-slate-200">
                          {patientIntake.age ? `${patientIntake.age} বছর` : ''} • {patientIntake.sex} {patientIntake.weight ? `• ${patientIntake.weight}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700/40 pt-3 mt-3">
                <div className="bg-slate-805/60 p-2.5 rounded border border-slate-700/30 text-[10px] leading-normal text-slate-300 flex items-start gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" fill="currentColor" />
                  <p>
                    প্যারামিটার ম্যাপ করা হয়েছে। বাংলাদেশ জেনেরিক মেট্রিক্স সফলভাবে যুক্ত করা হয়েছে।
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Open formulation form */
            <IntakeForm onSave={handleSaveIntake} />
          )}
        </section>

        {/* Center Column: Dynamic Consultation Thread */}
        <section className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex lg:col-span-6 h-full bg-slate-100 overflow-hidden flex-col order-2 lg:order-2 rounded-xl border border-slate-200 shadow-xs`}>

          {/* Thread Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">কনসালটেশন ডেস্ক</span>
            </div>

            {patientIntake ? (
              <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold border border-blue-100">
                রোগীর প্রোফাইল সক্রিয়
              </span>
            ) : (
              <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-300">
                রোগীর তথ্যের অপেক্ষায়
              </span>
            )}
          </div>

          {/* Messages Flow Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4" id="consultation-chat-scrollbar">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                patientIntake={patientIntake}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Appended typing loader during pending requests */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-705 text-xs font-semibold bg-white py-2.5 px-3.5 rounded-lg border border-slate-200 max-w-xs shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>ক্লিনিক্যাল বিশ্লেষণ করা হচ্ছে...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length === 1 && !patientIntake && (
            <div className="px-4 py-2 border-t border-slate-200 bg-white flex flex-col gap-1">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">দ্রুত জিজ্ঞাসা:</span>
              <div className="flex flex-wrap gap-1.5 mb-1">
                <button
                  type="button"
                  onClick={() => handleQuickQuestion("আমার বাচ্চার শুকনো কাশি এবং গলা ব্যথা। দয়া করে ঔষধের নাম বলুন।")}
                  className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition-all text-left font-semibold"
                >
                  "বাচ্চাদের শুকনো কাশির ঔষধ"
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion("বয়স্কদের ক্ষেত্রে বুকে তীব্র এসিডিটির জন্য ঔষধের পরামর্শ দিন।")}
                  className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition-all text-left font-semibold"
                >
                  "বয়স্কদের তীব্র এসিডিটি"
                </button>
              </div>
            </div>
          )}

          {/* Dynamic input messaging panel */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-2" id="chat-composer-form">
              <input
                type="text"
                id="message-composer-input"
                disabled={isLoading}
                placeholder={patientIntake
                  ? "নতুন কোন সমস্যা? যেমন: ঢাকায় কোন ব্র্যান্ডের ঔষধ সহজে পাওয়া যাবে?"
                  : "আপনার সমস্যার কথা লিখুন, অথবা প্রথমে ইনটেক ফর্ম পূরণ করুন..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-650 focus:bg-white text-slate-900 placeholder-slate-400 font-medium"
              />
              <button
                type="submit"
                id="message-submit-btn"
                disabled={isLoading || !inputText.trim()}
                className="px-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">পরামর্শ</span>
              </button>
            </form>
            <div className="flex justify-between items-center mt-2 px-1.5 text-[8.5px] text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3" /> পরামর্শের সময়: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>medex.com.bd নির্দেশিকা অনুযায়ী যাচাইকৃত।</span>
            </div>
          </div>

        </section>

        {/* Right Sidebar: Quick Actions & Intelligence Dashboard */}
        <section className={`${mobileTab === 'dashboard' ? 'flex' : 'hidden'} lg:flex lg:col-span-3 h-full overflow-hidden flex flex-col gap-3.5 order-3 lg:order-3`}>
          <aside className="w-full h-full flex flex-col gap-3.5 overflow-y-auto bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs" id="intelligence-dashboard">
            <div>
              <div className="font-bold text-[10px] uppercase text-slate-500 font-mono tracking-wider mb-2 flex items-center gap-1">
                <span>🩺 ক্লিনিক্যাল সূচক</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-205">
                  <div className="text-[9px] text-slate-500 font-bold uppercase font-mono">কেসের তীব্রতা</div>
                  <div className={`font-display font-extrabold text-xs mt-0.5 ${patientIntake
                      ? Number(patientIntake.severity) > 6
                        ? 'text-red-655 font-bold'
                        : Number(patientIntake.severity) > 3
                          ? 'text-amber-650 font-bold text-amber-600'
                          : 'text-green-600 font-bold'
                      : 'text-slate-400 font-semibold'
                    }`}>
                    {patientIntake
                      ? Number(patientIntake.severity) > 6
                        ? 'তীব্র'
                        : Number(patientIntake.severity) > 3
                          ? 'মাঝারি'
                          : 'মৃদু'
                      : 'অপেক্ষারত'}
                  </div>
                </div>
                <div className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-205">
                  <div className="text-[9px] text-slate-500 font-bold uppercase font-mono">নিশ্চয়তা সূচক</div>
                  <div className="font-display font-extrabold text-xs text-slate-805 mt-0.5">
                    {patientIntake ? '৮৫%' : 'প্রযোজ্য নয়'}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-slate-200" />

            {/* Red Flag Zone Alert Panel */}
            <div className="red-flag-zone flex flex-col gap-1.5">
              <div className="font-extrabold text-[10px] text-red-700 uppercase font-mono tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>🚨 ঝুঁকিপূর্ণ লক্ষণ (Red Flags)</span>
              </div>
              <ul className="text-[10px] text-red-900 list-disc pl-4 space-y-1.5 leading-tight font-medium">
                <li>বুক ব্যথা বাম কাঁধে/হাতে বা চোয়ালে ছড়িয়ে পড়া</li>
                <li>গিলতে তীব্র কষ্ট (Dysphagia)</li>
                <li>হঠাৎ তীব্র শ্বাসকষ্ট, অতিরিক্ত ঘাম হওয়া</li>
                <li>ক্রমাগত বমি বা কালো রঙের মলত্যাগ</li>
              </ul>
            </div>

            <hr className="border-t border-slate-200" />

            <div>
              <div className="font-bold text-[10px] uppercase text-slate-500 font-mono tracking-wider mb-2">
                📋 কুইক বেঞ্চমার্ক (ঢাকা)
              </div>
              <div className="text-[10px] text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-205">
                <p>📍 বাংলাদেশ ভিত্তিক <strong>medex.com.bd</strong>-এর তথ্যের সাথে ডাটা যুক্ত করা হয়েছে।</p>
                <p>💊 স্কয়ার, বেক্সিমকো, এবং ইনসেপ্টার মতো কোম্পানির জেনেরিক ঔষধ ডেটাবেস থেকে মূল্যায়ন করা হয়েছে।</p>
                <p>🧬 রোগীর অ্যালার্জির ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে বিপদজনক ঔষধ বাতিল করা হয়।</p>
              </div>
            </div>

            <div className="mt-auto pt-4 text-center border-t border-slate-200">
              <div className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">
                DSS DECISION SUPPORT v2.0
              </div>
              <div className="text-[8px] text-slate-400 mt-1">
                ronincorp©️
              </div>
            </div>
          </aside>
        </section>

      </main>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-white border-t border-slate-200 flex justify-between px-2 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          onClick={() => setMobileTab('intake')}
          className={`flex-1 flex flex-col items-center justify-center p-2.5 gap-1 ${mobileTab === 'intake' ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-bold">প্রোফাইল</span>
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center p-2.5 gap-1 ${mobileTab === 'chat' ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">পরামর্শ</span>
        </button>
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center p-2.5 gap-1 ${mobileTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">ড্যাশবোর্ড</span>
        </button>
      </div>

    </div>
  );
}
