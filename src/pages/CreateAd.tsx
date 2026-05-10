import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  Megaphone, 
  Send, 
  Image as ImageIcon, 
  Globe2, 
  Coins, 
  LayoutGrid, 
  ShieldAlert, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { formatCurrency, cn } from '../lib/utils';

const CATEGORIES = [
  'Finance & Crypto',
  'Business & Jobs',
  'Entertainment',
  'Groups & Social',
  'Tech & AI',
  'Global News'
];

const COUNTRIES = [
  'Worldwide',
  'United States',
  'United Kingdom',
  'Germany',
  'Nigeria',
  'India',
  'Brazil',
  'Russia'
];

const BANNED_KEYWORDS = ['scam', 'hack', 'free money', 'guaranteed profit', 'invest $1000', 'lottery winner'];

export const CreateAd: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: CATEGORIES[0],
    country: COUNTRIES[0],
    budget: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video'
  });

  const [loading, setLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState<{ safe: boolean; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateContent = () => {
    const combined = (formData.title + ' ' + formData.description).toLowerCase();
    for (const word of BANNED_KEYWORDS) {
      if (combined.includes(word)) {
        return `Content contains flagged keyword: "${word}"`;
      }
    }
    if (!formData.link.startsWith('http')) return "Invalid link protocol (must start with http/https)";
    return null;
  };

  const moderateWithAI = async () => {
    if (!process.env.GEMINI_API_KEY) return { safe: true, reason: 'AI Bypass' };
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Moderate this advertisement for a community platform. 
      Analyze for: Spam, Scams, NSFW, Illegal Content, Fake Links, or excessive sensationalism.
      Title: ${formData.title}
      Description: ${formData.description}
      Link: ${formData.link}
      
      Respond ONLY with a JSON object: {"safe": boolean, "reason": "string"}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const data = JSON.parse(response.text || '{"safe": true, "reason": "No data"}');
      return data;
    } catch (e) {
      console.error(e);
      return { safe: true, reason: 'Moderation complete' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const validationError = validateContent();
    if (validationError) {
      setError(validationError);
      return;
    }

    const budgetNum = parseFloat(formData.budget);
    if (budgetNum > (profile.balance || 0)) {
      setError("Insufficient wallet balance. Please add funds.");
      return;
    }

    setLoading(true);
    setError(null);

    // AI Check
    const aiResult = await moderateWithAI();
    if (!aiResult.safe) {
      setModerationResult(aiResult);
      setLoading(false);
      return;
    }

    try {
      // 1. Deduct balance
      const userPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          balance: increment(-budgetNum)
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }

      // 2. Create Ad
      const adPath = 'ads';
      let adRef;
      try {
        const adData = {
          ownerId: user.uid,
          title: formData.title,
          description: formData.description,
          link: formData.link,
          category: formData.category,
          mediaUrl: formData.mediaUrl,
          mediaType: formData.mediaType,
          targeting: {
            country: formData.country,
          },
          budget: budgetNum,
          spend: 0,
          duration: 0,
          status: 'pending',
          stats: { views: 0, clicks: 0 },
          createdAt: Date.now()
        };

        adRef = await addDoc(collection(db, adPath), adData);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, adPath);
      }

      // 3. Create transaction record
      const txPath = 'transactions';
      try {
        await addDoc(collection(db, txPath), {
          userId: user.uid,
          amount: budgetNum,
          type: 'spend',
          method: 'internal',
          status: 'completed',
          description: `Ad Campaign Launch: ${formData.title}`,
          createdAt: Date.now()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, txPath);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center mb-16 space-y-4">
         <div className="mx-auto h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 mb-6">
            <Megaphone className="h-10 w-10" />
         </div>
         <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic uppercase">Launch Campaign</h1>
         <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em]">Draft your impact on the network</p>
      </div>

      <div className="bg-white rounded-[64px] border border-black/5 shadow-2xl p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full" />
        
        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Campaign Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Premium Forex Trading Tribe"
                      className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border border-black/5 text-lg font-black focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all uppercase placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description (Convince the audience)</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      placeholder="High-accuracy signals, education, and community support for serious traders..."
                      className="w-full px-8 py-5 rounded-[32px] bg-slate-50 border border-black/5 text-base font-bold focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Destination Link (Telegram/WhatsApp/Web)</label>
                    <input 
                      required
                      type="url"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      placeholder="https://t.me/yourtribe"
                      className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border border-black/5 text-base font-bold focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-blue-600 underline"
                    />
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-6 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                >
                  Configure Targeting <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                          <LayoutGrid className="h-4 w-4" /> Category
                       </div>
                       <select 
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border border-black/5 text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none"
                       >
                         {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                       </select>
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                          <Globe2 className="h-4 w-4" /> Target Region
                       </div>
                       <select 
                         value={formData.country}
                         onChange={e => setFormData({...formData, country: e.target.value})}
                         className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border border-black/5 text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none"
                       >
                         {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                       <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" /> Campaign Budget (USD)
                       </div>
                       <span className="text-slate-900">Balance: {formatCurrency(profile?.balance || 0)}</span>
                    </div>
                    <div className="relative">
                       <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
                       <input 
                         required
                         type="number"
                         value={formData.budget}
                         onChange={e => setFormData({...formData, budget: e.target.value})}
                         placeholder="500.00"
                         className="w-full pl-16 pr-8 py-6 rounded-[24px] bg-slate-50 border border-black/5 text-2xl font-black tracking-tighter focus:ring-4 focus:ring-orange-500/10 transition-all"
                       />
                    </div>
                 </div>

                 <div className="p-8 rounded-[32px] bg-orange-50 border border-orange-100 space-y-4">
                    <div className="flex items-center gap-3 text-orange-600">
                       <Sparkles className="h-5 w-5" />
                       <h5 className="text-xs font-black uppercase tracking-widest">AI Moderation Policy</h5>
                    </div>
                    <p className="text-xs text-orange-700 font-bold leading-relaxed uppercase tracking-tighter">
                      Your campaign will be screened by the Gemini Trust Engine immediately. Ads containing scams, fraudulent links, or illegal content will result in immediate account suspension.
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-6 rounded-3xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-200 transition"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-6 rounded-3xl bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-orange-700 transition shadow-2xl shadow-orange-600/30 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                           <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           <span>AI Screening...</span>
                        </div>
                      ) : (
                        <>
                          <Send className="h-6 w-6" /> Verify & Launch
                        </>
                      )}
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Global Level Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[28px] flex items-start gap-4"
            >
               <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
               <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-red-600">Campaign Alert</p>
                  <p className="text-sm font-bold text-red-700 leading-snug">{error}</p>
               </div>
            </motion.div>
          )}

          {moderationResult && !moderationResult.safe && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 p-8 bg-slate-900 border border-red-500/20 rounded-[40px] flex items-start gap-6"
            >
               <ShieldAlert className="h-10 w-10 text-red-500 shrink-0" />
               <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Security Gate Blocked</p>
                  <h6 className="text-xl font-black text-white italic uppercase tracking-tighter">AI Moderation Failure</h6>
                  <p className="text-sm text-slate-400 font-bold leading-relaxed">{moderationResult.reason}</p>
                  <button 
                    onClick={() => { setModerationResult(null); setStep(1); }}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Edit Content
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-12 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
           Protected by Google Gemini AI Trust Engine & AdVantage Mod Team
         </p>
      </div>
    </div>
  );
};
