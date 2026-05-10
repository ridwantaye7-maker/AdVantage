import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  MessageSquare, 
  Briefcase, 
  Gamepad2, 
  Coins, 
  ArrowRight,
  Target,
  BarChart3,
  Search,
  Megaphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Advertisement } from '../types';

const CATEGORIES = [
  { id: 'finance', name: 'Finance & Crypto', icon: Coins, color: 'bg-emerald-500' },
  { id: 'business', name: 'Business & Jobs', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: 'bg-purple-500' },
  { id: 'social', name: 'Groups & Social', icon: MessageSquare, color: 'bg-orange-500' },
  { id: 'tech', name: 'Tech & AI', icon: Zap, color: 'bg-cyan-500' },
  { id: 'global', name: 'Global News', icon: Globe2, color: 'bg-slate-500' },
];

export const Home: React.FC = () => {
  const [featuredAds, setFeaturedAds] = useState<Advertisement[]>([]);
  const [trendingAds, setTrendingAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const featuredQ = query(
          collection(db, 'ads'),
          where('status', '==', 'active'),
          where('budget', '>=', 500),
          limit(5)
        );
        const trendingQ = query(
          collection(db, 'ads'),
          where('status', '==', 'active'),
          orderBy('clicks', 'desc'),
          limit(3)
        );

        const [featuredSnap, trendingSnap] = await Promise.all([
          getDocs(featuredQ).catch(() => ({ docs: [] })),
          getDocs(trendingQ).catch(() => ({ docs: [] }))
        ]);

        // @ts-ignore
        setFeaturedAds(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
        // @ts-ignore
        setTrendingAds(trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
      } catch (error) {
        console.error(error);
      }
    };
    fetchAds();
  }, []);

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* Hero Section - Recipe 2 (Editorial) style */}
      <section className="relative pt-20 pb-40 bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 text-white rounded-b-[64px] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-orange-600/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10"
          >
            <Sparkles className="h-3 w-3 text-orange-400" /> Next-Gen Ad Infrastructure
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 12 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic"
          >
            AMPLIFY YOUR <br/>
            <span className="text-orange-500">REACH.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            The high-precision advertising engine for Telegram, WhatsApp, and global digital communities.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/auth" className="group relative w-full sm:w-auto px-12 py-5 rounded-3xl bg-orange-600 text-white font-black text-xl hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-orange-600/30 active:scale-95 text-center overflow-hidden">
               <span className="relative z-10 uppercase tracking-tighter">Get Started Free</span>
            </Link>
            <Link to="/ads" className="w-full sm:w-auto px-12 py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-white/10 transition active:scale-95 text-center uppercase tracking-tighter">View Ads</Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Marquee Section */}
      <section className="space-y-8 -mt-20 relative z-20">
        <div className="flex items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">Featured Campaigns</h2>
          </div>
          <Link to="/ads" className="text-xs font-black uppercase tracking-widest text-orange-600 hover:underline">Explore More</Link>
        </div>
        <div className="relative overflow-hidden py-8">
          <div className="flex gap-8 px-4 animate-marquee whitespace-nowrap">
            {(featuredAds.length > 0 ? [...featuredAds, ...featuredAds] : [1,2,3,4,5,6]).map((item: any, i) => (
              <div 
                key={i}
                className="inline-flex items-center gap-4 bg-white border border-black/5 rounded-[32px] px-8 py-6 shadow-xl shadow-black/5 min-w-[300px]"
              >
                <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900 truncate max-w-[180px] text-lg tracking-tight uppercase italic">{item.title || 'Premium Ad Spot'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category || 'Featured'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-orange-600">The Network</h2>
          <h3 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">Browse by Tribe</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id}
              to={`/ads?category=${cat.id}`}
              className="group flex flex-col items-center gap-6 p-10 rounded-[48px] bg-white border border-black/5 hover:border-orange-500/20 hover:shadow-2xl hover:shadow-orange-600/5 transition-all text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`relative h-20 w-20 rounded-[32px] ${cat.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-2`}>
                <cat.icon className="h-10 w-10" />
              </div>
              <span className="relative font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                 <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Hot Right Now</h2>
           </div>
           <Link to="/ads" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600">
              Refresh Feed <BarChart3 className="h-4 w-4" />
           </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {(trendingAds.length > 0 ? trendingAds : [1,2,3]).map((item: any, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group p-10 rounded-[56px] bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full group-hover:bg-orange-500/40 transition-all pointer-events-none" />
              <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.25em]">
                        {item.category || 'Campaign'}
                    </div>
                    {item.clicks && (
                      <div className="flex items-center gap-1.5 text-orange-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.clicks} Hits</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-3xl font-black leading-[1] tracking-tight uppercase italic">{item.title || 'Loading Campaign...'}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{item.description || 'Global audience reach via hyper-targeted community placement.'}</p>
              </div>
              <Link to="/ads" className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 hover:text-white transition-colors group/link pt-4">
                Full Specs <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust/Process Section */}
      <section className="bg-white py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-y border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 italic font-black text-2xl shadow-xl shadow-emerald-500/10">01</div>
            <h5 className="font-black uppercase tracking-widest text-slate-900 text-xs text-center">Create</h5>
            <p className="text-xs text-slate-400 font-bold leading-relaxed text-center uppercase tracking-tighter">Draft your ad with our AI-assisted tools in seconds.</p>
          </div>
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 italic font-black text-2xl shadow-xl shadow-orange-500/10">02</div>
            <h5 className="font-black uppercase tracking-widest text-slate-900 text-xs text-center">Moderate</h5>
            <p className="text-xs text-slate-400 font-bold leading-relaxed text-center uppercase tracking-tighter">Our Gemini AI & Human mods verify every kampaign for safety.</p>
          </div>
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 italic font-black text-2xl shadow-xl shadow-blue-500/10">03</div>
            <h5 className="font-black uppercase tracking-widest text-slate-900 text-xs text-center">Deploy</h5>
            <p className="text-xs text-slate-400 font-bold leading-relaxed text-center uppercase tracking-tighter">Ad hits the network across thousands of active groups.</p>
          </div>
          <div className="space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-[24px] bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 italic font-black text-2xl shadow-xl shadow-purple-500/10">04</div>
            <h5 className="font-black uppercase tracking-widest text-slate-900 text-xs text-center">Scale</h5>
            <p className="text-xs text-slate-400 font-bold leading-relaxed text-center uppercase tracking-tighter">Watch your community grow with real-time analytics.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 rounded-[64px] text-white p-16 md:p-32 text-center space-y-12 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">REACH THE UNREACHABLE.</h2>
          <p className="text-xl md:text-2xl text-orange-100 font-medium">Join 5,000+ advertisers dominating the digital community space.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
           <Link to="/auth" className="w-full sm:w-auto px-16 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-lg hover:shadow-2xl hover:bg-black transition-all active:scale-95">Sign Up Now</Link>
           <Link to="/create" className="w-full sm:w-auto px-16 py-6 bg-white text-orange-600 rounded-[32px] font-black uppercase tracking-[0.2em] text-lg hover:shadow-2xl hover:bg-orange-50 transition-all active:scale-95">Start Ad campaign</Link>
        </div>
      </section>
    </div>
  );
};
