import React, { useEffect, useState } from 'react';
import { 
  Megaphone, 
  Search, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  Globe2, 
  ChevronDown,
  LayoutGrid,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Advertisement } from '../types';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'All',
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

export const Ads: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCountry, setActiveCountry] = useState('Worldwide');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const q = query(
          collection(db, 'ads'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
        const snapshot = await getDocs(q);
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ad.category === activeCategory;
    const matchesCountry = activeCountry === 'Worldwide' || ad.targeting?.country === activeCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col space-y-8">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Ad Explorer</h1>
           <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Connect with the world's most active digital tribes</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search channels, bots, groups..." 
              className="w-full pl-16 pr-6 py-5 rounded-[28px] border border-black/5 bg-white text-base focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold placeholder:text-slate-300 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center justify-center gap-3 px-8 py-5 rounded-[28px] border font-black uppercase tracking-widest text-xs transition-all active:scale-95",
              isFilterOpen ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-black/5 text-slate-600 hover:border-orange-500/20"
            )}
          >
            <Filter className="h-5 w-5" /> 
            <span>Advanced Filters</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isFilterOpen && "rotate-180")} />
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50 rounded-[40px] border border-black/5"
            >
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                       <LayoutGrid className="h-4 w-4" /> Market Segments
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {CATEGORIES.map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={cn(
                             "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                             activeCategory === cat ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-white border border-black/5 text-slate-500 hover:border-orange-500/30"
                           )}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                       <Globe2 className="h-4 w-4" /> Geo-Targeting
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {COUNTRIES.map(country => (
                         <button 
                           key={country}
                           onClick={() => setActiveCountry(country)}
                           className={cn(
                             "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                             activeCountry === country ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-black/5 text-slate-500 hover:border-orange-500/30"
                           )}
                         >
                           {country}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-80 rounded-[48px] bg-white border border-black/5 animate-pulse" />
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[56px] border border-black/5 shadow-sm space-y-8">
           <div className="mx-auto h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
              <Search className="h-12 w-12" />
           </div>
           <div className="space-y-2">
              <p className="text-xl font-black uppercase tracking-widest text-slate-900 italic">No matches found</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Try adjusting your segment or geo-filters</p>
           </div>
           <button 
             onClick={() => { setActiveCategory('All'); setActiveCountry('Worldwide'); setSearchTerm(''); }}
             className="px-8 py-4 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition"
           >
             Clear All Filters
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredAds.map((ad, i) => (
            <motion.div 
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative flex flex-col p-10 bg-white border border-black/5 rounded-[48px] shadow-sm hover:shadow-2xl hover:shadow-orange-600/5 transition-all hover:-translate-y-2"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="h-14 w-14 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden relative border border-black/5">
                  {ad.mediaUrl ? (
                    <img src={ad.mediaUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Megaphone className="h-7 w-7" />
                  )}
                </div>
                {ad.budget >= 200 && (
                  <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-[10px] font-black text-orange-600 uppercase tracking-widest shadow-sm">
                    <Zap className="h-4 w-4 fill-orange-600" /> Premium
                  </div>
                )}
              </div>
              
              <div className="space-y-4 flex-1">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">
                    {ad.category}
                 </div>
                 <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-tight uppercase italic">{ad.title}</h3>
                 <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{ad.description}</p>
              </div>
              
              <div className="mt-10 pt-8 border-t border-black/5 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Flag className="h-3.5 w-3.5 text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ad.targeting?.country || 'Global'}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                      <TrendingUp className="h-4 w-4" /> {ad.stats?.clicks || 0} hits
                   </div>
                </div>
                
                <a 
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 rounded-[24px] bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all hover:shadow-xl active:scale-95"
                >
                  Join Tribe <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
