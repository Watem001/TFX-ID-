import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

/**
 * TFX ID - ULTIMATE TRADING LABORATORY
 * Version: 20.0 (Deployment Ready)
 */
const STORAGE_KEYS = {
  SESSION: 'tfx_id_session_v20',
  USERS: 'tfx_id_users_v20'
};

const CONFIG = {
  APP_NAME: "TFX ID",
  MODELS: {
    ANALYZER: 'gemini-3-flash-preview',
  },
  CONTACT: {
    SUBSCRIPTION: "subscriptions@tfx-id.pro",
    GENERAL: "support@tfx-id.pro"
  }
};

/**
 * TYPES
 */
type View = 'analysis' | 'signals' | 'analyzer' | 'study' | 'account' | 'support';
type Tier = 'Free' | 'Standard' | 'Premium';
type AuthView = 'login' | 'signup';

interface UserProfile {
  name: string;
  tfxId: string;
  email: string;
  tier: Tier;
  password?: string;
  expiryDate: string;
  auditLogs: { action: string; timestamp: string }[];
  studyProgress: {
    completed: number;
    total: number;
    lastLesson: string;
  };
}

interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  timeframe: 'M5' | 'M15' | 'H1' | 'H4';
  confidence: number; 
  strategy: 'Scalp' | 'Intraday' | 'Swing';
  entry: string;
  tp: string;
  sl: string;
  note: string;
}

/**
 * FULL DATASETS
 */
const STUDY_MAP = [
  { level: 1, phase: "PHASE 1", title: "Market Essentials", content: "Forex is the global marketplace for currency exchange. Every professional journey starts with mastering pips, leverage, and margin." },
  { level: 1, phase: "PHASE 1", title: "Market Structure", content: "Prices move in trends. We identify the direction by looking for Higher Highs and Higher Lows in an uptrend, or vice versa." },
  { level: 2, phase: "PHASE 2", title: "Technical Mastery", content: "Price action is the study of how price behaves at specific levels. Patterns like Pin Bars and Engulfing Candles are key signals." },
  { level: 2, phase: "PHASE 2", title: "Institutional Liquidity", content: "Institutions look for liquidity. Smart Money Concepts (SMC) help us identify Order Blocks where big money enters the market." },
  { level: 3, phase: "PHASE 3", title: "Psychology Lab", content: "Trading is 80% mental. Discipline, patience, and emotional control are the tools of a professional." },
  { level: 3, phase: "PHASE 3", title: "Risk Management", content: "Capital preservation is priority #1. Never risk more than 1% of your account on a single trade." },
  { level: 4, phase: "PHASE 4", title: "Strategy Scaling", content: "Learn how to build a consistent trading plan. A strategy without a plan is just a gamble." },
  { level: 5, phase: "PHASE 5", title: "Fundamental Analysis", content: "Understand how interest rates, inflation, and global news impact currency valuations." },
  { level: 6, phase: "PHASE 6", title: "The Pro Mindset", content: "Refining your edge. Successful trading is about repeating high-probability setups over and over." },
  { level: 7, phase: "PHASE 7", title: "Final Mastery", content: "Compounding your gains and managing large institutional funds." }
];

const SIGNALS_DATA: Signal[] = [
  { id: 'SIG-001', pair: 'EUR/USD', type: 'BUY', timeframe: 'M15', confidence: 96, strategy: 'Intraday', entry: '1.08450', tp: '1.09200', sl: '1.08100', note: 'Price rejected daily demand zone.' },
  { id: 'SIG-002', pair: 'XAU/USD', type: 'SELL', timeframe: 'H1', confidence: 94, strategy: 'Swing', entry: '2724.50', tp: '2680.00', sl: '2745.00', note: 'Strong bearish divergence on RSI.' },
  { id: 'SIG-003', pair: 'GBP/JPY', type: 'BUY', timeframe: 'M5', confidence: 98, strategy: 'Scalp', entry: '192.100', tp: '193.500', sl: '191.800', note: 'Institutional buy order block confirmed.' }
];

/**
 * MAIN COMPONENT
 */
const App = () => {
  const [view, setView] = useState<View>('analysis');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<typeof STUDY_MAP[0] | null>(null);
  const [activePair, setActivePair] = useState('EURUSD');
  const [activeTimeframe, setActiveTimeframe] = useState('15');
  const [analyzerPrompt, setAnalyzerPrompt] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState<string>('');
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Auth States
  const [authView, setAuthView] = useState<AuthView>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) {
      try { setUser(JSON.parse(session)); } catch (e) { localStorage.removeItem(STORAGE_KEYS.SESSION); }
    }
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser: UserProfile = {
        name: "Google User",
        email: "user@gmail.com",
        tfxId: `TFX-G-${Math.floor(10000 + Math.random() * 90000)}`,
        tier: "Standard",
        expiryDate: 'Dec 2025',
        auditLogs: [{ action: "Google sign-in successful", timestamp: new Date().toLocaleTimeString() }],
        studyProgress: { completed: 1, total: 10, lastLesson: 'None' }
      };
      setUser(googleUser);
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(googleUser));
      setLoading(false);
      triggerToast("Signed in with Google.", "success");
    }, 1500);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authView === 'signup') {
      if (!authName.trim()) return triggerToast("Name is required.", "error");
      const newUser: UserProfile = {
        name: authName,
        email: authEmail,
        password: authPassword,
        tfxId: `TFX-${Math.floor(10000 + Math.random() * 90000)}`,
        tier: "Free",
        expiryDate: 'N/A',
        auditLogs: [{ action: "Account created", timestamp: new Date().toLocaleTimeString() }],
        studyProgress: { completed: 0, total: 10, lastLesson: 'None' }
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
      triggerToast("Welcome to TFX ID!", "success");
    } else {
      // Mock login for demo
      if (authEmail && authPassword) {
        const mockUser: UserProfile = {
          name: "Trader One",
          email: authEmail,
          tfxId: `TFX-L-${Math.floor(10000 + Math.random() * 90000)}`,
          tier: "Premium",
          expiryDate: 'Jan 2026',
          auditLogs: [{ action: "Login successful", timestamp: new Date().toLocaleTimeString() }],
          studyProgress: { completed: 4, total: 10, lastLesson: 'Institutional Concepts' }
        };
        setUser(mockUser);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(mockUser));
        triggerToast("Welcome back!", "success");
      }
    }
  };

  const analyzeChart = async () => {
    if (!user || user.tier === 'Free') {
      setShowPaymentModal(true);
      return triggerToast("Upgrade required for AI analysis.", "error");
    }
    setAnalyzerLoading(true);
    setAnalyzerResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let parts: any[] = [{ text: analyzerPrompt || "Analyze this chart structure." }];
      if (uploadPreview) parts.push({ inlineData: { data: uploadPreview.split(',')[1], mimeType: 'image/jpeg' } });
      const response = await ai.models.generateContent({ model: CONFIG.MODELS.ANALYZER, contents: { parts } });
      setAnalyzerResult(response.text || "Analysis complete but no text returned.");
      triggerToast("AI Scan Finished.", "success");
    } catch (err) {
      setAnalyzerResult("AI connection failed. Ensure your API Key is valid.");
    } finally {
      setAnalyzerLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#060912] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-sky-500 tracking-[0.4em]">TFX ID LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060912] text-slate-300 flex flex-col lg:flex-row font-sans overflow-x-hidden selection:bg-sky-500/30">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[1000] px-6 py-4 rounded-2xl border backdrop-blur-xl animate-in shadow-2xl ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* Auth View */}
      {!user ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.05),transparent)]">
          <div className="max-w-md w-full space-y-10 animate-in">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-sky-500 rounded-[35px] mx-auto flex items-center justify-center text-5xl font-black italic text-white shadow-bold">ID</div>
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">TFX ID</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">The Institutional Trading Lab</p>
             </div>
             
             <div className="bg-[#0d121f] p-8 rounded-[45px] border border-white/5 shadow-2xl space-y-6">
                <div className="flex p-1 bg-white/5 rounded-2xl">
                   <button onClick={() => setAuthView('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authView === 'login' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Log In</button>
                   <button onClick={() => setAuthView('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authView === 'signup' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Sign Up</button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                   {authView === 'signup' && (
                      <input type="text" placeholder="Full Name" required value={authName} onChange={e => setAuthName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-sky-500 font-bold transition-all" />
                   )}
                   <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-sky-500 font-bold transition-all" />
                   <input type="password" placeholder="Password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-sky-500 font-bold transition-all" />
                   <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-xl">
                      {authView === 'login' ? 'Enter Laboratory' : 'Create Access ID'}
                   </button>
                </form>

                <div className="relative py-2 flex items-center gap-4">
                   <div className="flex-1 h-px bg-white/5"></div>
                   <span className="text-[8px] font-black text-slate-700 uppercase">OR</span>
                   <div className="flex-1 h-px bg-white/5"></div>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                   <span className="text-xl">G</span> Continue with Google
                </button>
             </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Sidebar */}
          <aside className="hidden lg:flex w-80 bg-[#0a0f1d] border-r border-white/5 flex-col p-8 gap-10 sticky top-0 h-screen">
             <div className="space-y-1">
                <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">TFX ID</h2>
                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">{user.tier} Platform</p>
             </div>
             <nav className="flex-1 space-y-1">
                <NavBtn active={view === 'analysis'} label="Market Grid" icon="📊" onClick={() => setView('analysis')} />
                <NavBtn active={view === 'signals'} label="Live Signals" icon="📡" onClick={() => setView('signals')} />
                <NavBtn active={view === 'analyzer'} label="AI Analyzer" icon="🤖" onClick={() => setView('analyzer')} />
                <NavBtn active={view === 'study'} label="Education" icon="📚" onClick={() => setView('study')} />
                <NavBtn active={view === 'support'} label="Support Hub" icon="✉️" onClick={() => setView('support')} />
                <NavBtn active={view === 'account'} label="My Profile" icon="👤" onClick={() => setView('account')} />
             </nav>
             <div className="pt-8 border-t border-white/5 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                Institutional Release v20.0
             </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 lg:p-14 pb-32">
             <header className="mb-14 flex justify-between items-center">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{view.replace('-', ' ')}</h3>
                <div className="flex items-center gap-4">
                   <div className="hidden md:block text-right">
                      <p className="text-[10px] font-black text-emerald-500 uppercase">Status: Connected</p>
                      <p className="text-[8px] font-black text-slate-700 uppercase">{user.tfxId}</p>
                   </div>
                   <div className="w-14 h-14 bg-sky-500 rounded-[20px] flex items-center justify-center text-white font-black italic text-2xl shadow-bold">{user.name[0]}</div>
                </div>
             </header>

             {/* ANALYSIS VIEW */}
             {view === 'analysis' && (
                <div className="space-y-10 animate-in">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <StatSummary label="Sentiment" val="BULLISH" color="text-emerald-500" />
                      <StatSummary label="Volatility" val="HIGH" color="text-sky-500" />
                      <StatSummary label="Asset" val={activePair} color="text-white" />
                      <StatSummary label="Timeframe" val={`M${activeTimeframe}`} color="text-amber-500" />
                   </div>
                   <div className="h-[650px] bg-[#0d121f] rounded-[50px] border border-white/5 overflow-hidden shadow-2xl relative group">
                      <TradingViewWidget symbol={`FX:${activePair}`} interval={activeTimeframe} />
                      <div className="absolute top-6 left-6 flex gap-2">
                        {['EURUSD', 'XAUUSD', 'GBPUSD', 'BTCUSD'].map(p => (
                          <button key={p} onClick={() => setActivePair(p)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all ${activePair === p ? 'bg-sky-500 text-white shadow-lg' : 'bg-black/40 text-slate-500 hover:text-white backdrop-blur-md'}`}>{p}</button>
                        ))}
                      </div>
                   </div>
                </div>
             )}

             {/* SIGNALS VIEW */}
             {view === 'signals' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-in">
                   {SIGNALS_DATA.map(s => <SignalCard key={s.id} signal={s} triggerToast={triggerToast} />)}
                </div>
             )}

             {/* AI ANALYZER VIEW */}
             {view === 'analyzer' && (
                <div className="max-w-3xl mx-auto space-y-10 animate-in">
                   <div className="bg-[#0d121f] p-12 rounded-[55px] border border-white/5 space-y-10 shadow-2xl relative">
                      <textarea value={analyzerPrompt} onChange={e => setAnalyzerPrompt(e.target.value)} placeholder="Ask AI to analyze market structure or levels..." className="w-full h-44 bg-white/5 border border-white/10 rounded-3xl p-8 text-white outline-none focus:border-sky-500 resize-none font-medium text-sm transition-all shadow-inner" />
                      
                      <div onClick={() => document.getElementById('chartInput')?.click()} className="h-56 border-2 border-dashed border-white/10 rounded-4xl flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 transition-all bg-white/[0.01] overflow-hidden group">
                        {uploadPreview ? <img src={uploadPreview} className="h-full w-full object-contain p-4" /> : <div className="text-center"><span className="text-3xl block mb-2 opacity-50">🖼️</span><p className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Upload Screenshot</p></div>}
                        <input type="file" id="chartInput" className="hidden" accept="image/*" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setUploadPreview(reader.result as string);
                              reader.readAsDataURL(file);
                           }
                        }} />
                      </div>

                      <button onClick={analyzeChart} disabled={analyzerLoading} className="w-full py-7 bg-sky-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-bold hover:bg-sky-600 transition-all disabled:opacity-50">
                        {analyzerLoading ? "Processing Institutional Data..." : "Run AI Diagnostic"}
                      </button>

                      {analyzerResult && (
                        <div className="p-10 bg-white/5 rounded-[40px] border border-sky-500/20 text-slate-200 font-medium whitespace-pre-wrap leading-relaxed italic animate-in shadow-xl">
                           <span className="text-sky-500 font-black uppercase text-[10px] block mb-4">AI Insight Report:</span>
                           {analyzerResult}
                        </div>
                      )}
                   </div>
                </div>
             )}

             {/* EDUCATION VIEW */}
             {view === 'study' && (
                <div className="max-w-6xl mx-auto space-y-10 animate-in">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {STUDY_MAP.map(m => (
                        <div key={m.title} className="bg-[#0d121f] p-10 rounded-[45px] border border-white/5 space-y-6 shadow-xl group hover:border-sky-500/20 transition-all">
                           <div className="flex justify-between items-center">
                              <span className="text-sky-500 font-black italic text-lg">{m.phase}</span>
                              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-500">#{m.level}</div>
                           </div>
                           <h5 className="text-xl font-black text-white italic uppercase tracking-tighter">{m.title}</h5>
                           <p className="text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-3">{m.content}</p>
                           <button onClick={() => setSelectedModule(m)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-sky-500 group-hover:text-white transition-all">Launch Training</button>
                        </div>
                      ))}
                   </div>

                   {selectedModule && (
                      <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-in">
                         <div className="max-w-3xl w-full bg-[#0d121f] p-16 rounded-[60px] border border-white/10 space-y-10 relative">
                            <button onClick={() => setSelectedModule(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white text-3xl font-black">×</button>
                            <div className="space-y-4">
                               <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.4em]">{selectedModule.phase} • LEVEL {selectedModule.level}</p>
                               <h4 className="text-5xl font-black text-white italic uppercase tracking-tighter">{selectedModule.title}</h4>
                            </div>
                            <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 relative">
                               <p className="text-2xl text-slate-200 font-medium italic leading-relaxed">{selectedModule.content}</p>
                            </div>
                            <button onClick={() => setSelectedModule(null)} className="w-full py-6 bg-sky-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-bold">Complete & Advance</button>
                         </div>
                      </div>
                   )}
                </div>
             )}

             {/* SUPPORT VIEW */}
             {view === 'support' && (
                <div className="max-w-5xl mx-auto space-y-12 animate-in">
                   <div className="text-center space-y-6">
                      <h4 className="text-5xl font-black text-white italic uppercase tracking-tighter">Support Hub</h4>
                      <p className="text-slate-500 max-w-lg mx-auto italic font-medium">Professional assistance for institutional accounts and platform technicalities.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <SupportActionCard 
                         icon="💳" 
                         title="Subscription Desk" 
                         desc="Billing, plan upgrades, and VIP renewals." 
                         email={CONFIG.CONTACT.SUBSCRIPTION} 
                         color="amber"
                      />
                      <SupportActionCard 
                         icon="🧠" 
                         title="Technical Inquiry" 
                         desc="Software feedback and technical troubleshooting." 
                         email={CONFIG.CONTACT.GENERAL} 
                         color="sky"
                      />
                   </div>
                </div>
             )}

             {/* ACCOUNT VIEW */}
             {view === 'account' && (
                <div className="max-w-4xl mx-auto space-y-10 animate-in">
                   <div className="bg-[#0d121f] p-16 rounded-[60px] border border-white/5 shadow-2xl flex flex-col items-center text-center gap-10">
                      <div className="w-40 h-40 bg-sky-500 rounded-[50px] flex items-center justify-center text-7xl text-white font-black italic shadow-bold">{user.name[0]}</div>
                      <div className="space-y-2">
                        <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">{user.name}</h2>
                        <p className="text-slate-500 italic font-medium text-xl">{user.email}</p>
                      </div>
                      <div className="flex gap-6">
                        <span className="px-6 py-3 bg-sky-500/10 rounded-full text-[10px] font-black text-sky-500 uppercase border border-sky-500/20">ACCESS: {user.tier}</span>
                        <span className="px-6 py-3 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-500 uppercase border border-emerald-500/20">ID: {user.tfxId}</span>
                      </div>
                      <button onClick={() => { localStorage.removeItem(STORAGE_KEYS.SESSION); setUser(null); }} className="px-14 py-5 bg-rose-500/10 text-rose-500 rounded-3xl font-black uppercase text-[11px] border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl">Secure Sign Out</button>
                   </div>
                </div>
             )}
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0f1d] border-t border-white/5 flex justify-around items-center p-5 z-[1500] backdrop-blur-2xl">
            <MobileTab active={view === 'analysis'} icon="📊" onClick={() => setView('analysis')} />
            <MobileTab active={view === 'signals'} icon="📡" onClick={() => setView('signals')} />
            <MobileTab active={view === 'analyzer'} icon="🤖" onClick={() => setView('analyzer')} />
            <MobileTab active={view === 'study'} icon="📚" onClick={() => setView('study')} />
            <MobileTab active={view === 'support'} icon="✉️" onClick={() => setView('support')} />
          </nav>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #060912; margin: 0; }
        .animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .shadow-bold { box-shadow: 0 20px 50px -10px rgba(14, 165, 233, 0.4); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

/**
 * REUSABLE COMPONENTS
 */

const NavBtn = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[28px] transition-all relative group ${active ? 'bg-sky-500 text-white shadow-bold' : 'text-slate-600 hover:bg-white/5 hover:text-white'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const MobileTab = ({ active, icon, onClick }: any) => (
  <button onClick={onClick} className={`p-4 transition-all ${active ? 'text-sky-500 scale-125' : 'text-slate-600 opacity-50'}`}>
    <span className="text-2xl">{icon}</span>
  </button>
);

const StatSummary = ({ label, val, color }: any) => (
  <div className="bg-[#0d121f] p-8 rounded-[35px] border border-white/5 shadow-xl hover:border-white/10 transition-all">
    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-sm font-black italic uppercase ${color}`}>{val}</p>
  </div>
);

const SupportActionCard = ({ icon, title, desc, email, color }: any) => (
  <a href={`mailto:${email}`} className="bg-[#0d121f] p-12 rounded-[55px] border border-white/5 space-y-8 shadow-2xl hover:border-sky-500/30 hover:scale-[1.02] transition-all group block text-left">
     <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-all ${color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'}`}>
        {icon}
     </div>
     <div className="space-y-2">
        <h5 className="text-2xl font-black text-white italic uppercase tracking-tighter">{title}</h5>
        <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">{desc}</p>
     </div>
     <div className="pt-6 border-t border-white/5 text-[10px] font-black text-white opacity-30 group-hover:opacity-100 transition-all">
        {email}
     </div>
  </a>
);

const SignalCard = ({ signal, triggerToast }: any) => {
  const [open, setOpen] = useState(false);
  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    triggerToast("Entry parameters copied.");
  };
  return (
    <div className={`bg-[#0d121f] rounded-[50px] border transition-all duration-500 ${open ? 'border-sky-500/50 shadow-bold' : 'border-white/5 hover:border-white/10'}`}>
       <div className="p-10 flex flex-wrap items-center justify-between gap-8 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-8">
             <div className="w-14 h-14 bg-white/5 rounded-[22px] flex items-center justify-center text-sky-500 font-black italic text-2xl">ID</div>
             <div>
                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{signal.pair} • {signal.type}</h4>
                <p className="text-[10px] font-black text-slate-700 uppercase">{signal.strategy} • {signal.confidence}% Accuracy Rating</p>
             </div>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-700 uppercase mb-1">Execution</p>
            <p className="text-xl font-black text-white font-mono">{signal.entry}</p>
          </div>
       </div>
       {open && (
          <div className="p-10 border-t border-white/5 bg-white/[0.01] animate-in space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-700 uppercase mb-2">Take Profit</p>
                   <p className="text-2xl font-black text-emerald-500 font-mono">{signal.tp}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-700 uppercase mb-2">Stop Loss</p>
                   <p className="text-2xl font-black text-rose-500 font-mono">{signal.sl}</p>
                </div>
             </div>
             <div className="p-8 bg-sky-500/5 rounded-[35px] italic text-sm text-slate-400 border border-sky-500/10">"{signal.note}"</div>
             <button onClick={() => copy(`${signal.pair} ${signal.type} @ ${signal.entry}`)} className="w-full py-6 bg-sky-500 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-bold">Sync to Trading Terminal</button>
          </div>
       )}
    </div>
  );
};

const TradingViewWidget = ({ symbol, interval }: any) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true, "symbol": symbol, "interval": interval, "theme": "dark", "style": "1", "locale": "en", "enable_publishing": false, "backgroundColor": "rgba(13, 18, 31, 1)", "gridColor": "rgba(255, 255, 255, 0.03)", "container_id": "tv_chart_main"
      });
      container.current.appendChild(script);
    }
  }, [symbol, interval]);
  return <div id="tv_chart_main" className="w-full h-full" ref={container} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
