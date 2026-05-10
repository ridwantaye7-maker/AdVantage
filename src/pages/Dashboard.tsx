import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Advertisement, AdStatus } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer2, 
  Wallet, 
  Clock, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Megaphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

const STATUS_CONFIG: Record<AdStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: 'Reviewing', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  active: { label: 'Running', icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
  expired: { label: 'Expired', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-100' },
};

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAds = async () => {
      const path = 'ads';
      try {
        const q = query(
          collection(db, path),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [user]);

  const totalViews = ads.reduce((acc, ad) => acc + (ad.stats?.views || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.stats?.clicks || 0), 0);
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const totalSpend = ads.reduce((acc, ad) => acc + (ad.spend || 0), 0);

  // Mock chart data based on real stats
  const chartData = [
    { name: 'Mon', clicks: Math.floor(totalClicks * 0.1) },
    { name: 'Tue', clicks: Math.floor(totalClicks * 0.15) },
    { name: 'Wed', clicks: Math.floor(totalClicks * 0.12) },
    { name: 'Thu', clicks: Math.floor(totalClicks * 0.20) },
    { name: 'Fri', clicks: Math.floor(totalClicks * 0.18) },
    { name: 'Sat', clicks: Math.floor(totalClicks * 0.15) },
    { name: 'Sun', clicks: Math.floor(totalClicks * 0.10) },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-black/5" />)}
        </div>
        <div className="h-96 bg-white rounded-3xl border border-black/5" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Campaign Hub</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time performance analytics</p>
        </div>
        <Link to="/create" className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-orange-700 transition shadow-xl shadow-orange-600/20 active:scale-95">
          <PlusCircle className="h-5 w-5" /> Launch New Ad
        </Link>
      </div>

      {/* Stats Cards - Technical Recipe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Impressions" 
          value={totalViews.toLocaleString()} 
          subValue="+12.5% vs last week"
          icon={Eye} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatsCard 
          label="Ad Interactions" 
          value={totalClicks.toLocaleString()} 
          subValue="+8.2% vs last week"
          icon={MousePointer2} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
        <StatsCard 
          label="Avg. CTR" 
          value={`${ctr.toFixed(2)}%`} 
          subValue="Industry avg: 1.2%"
          icon={TrendingUp} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatsCard 
          label="Ad Spend" 
          value={formatCurrency(totalSpend)} 
          subValue={`${ads.length} active campaigns`}
          icon={Wallet} 
          color="text-purple-600" 
          bg="bg-purple-50" 
        />
      </div>

      {/* Main Analytics Chart */}
      <section className="p-8 rounded-[40px] bg-white border border-black/5 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <BarChart3 className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Conversion Trends</h3>
          </div>
          <div className="flex items-center gap-2">
             <button className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-black/5 hover:bg-slate-100 transition">7 Days</button>
             <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">30 Days</button>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stroke="#f97316" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorClicks)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Campaigns List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Your Campaigns</h3>
           <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition">
              <Filter className="h-4 w-4" /> Filter By Status
           </button>
        </div>

        {ads.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white border border-black/5 rounded-[48px] shadow-sm">
             <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <Megaphone className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <p className="text-slate-900 font-black uppercase tracking-widest">No active campaigns</p>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Launch your first ad to see analytics</p>
             </div>
             <Link to="/create" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-black transition">
                Create Ad <ArrowUpRight className="h-4 w-4" />
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ads.map((ad) => {
              const status = STATUS_CONFIG[ad.status];
              const Icon = status.icon;
              return (
                <motion.div 
                  key={ad.id}
                  whileHover={{ scale: 1.005 }}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white border border-black/5 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
                      {ad.mediaUrl ? (
                         <img src={ad.mediaUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                         <Megaphone className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{ad.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ad.category}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{new Date(ad.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</span>
                      <div className={cn("flex items-center gap-1.5 mt-1 font-bold text-xs uppercase", status.color)}>
                        <Icon className="h-3.5 w-3.5" /> {status.label}
                      </div>
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Budget</span>
                      <span className="text-sm font-black text-slate-900 mt-1">{formatCurrency(ad.budget)}</span>
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Total Reach</span>
                      <span className="text-sm font-black text-slate-900 mt-1">{ad.stats?.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Spend</span>
                      <span className="text-sm font-black text-orange-600 mt-1">{formatCurrency(ad.spend || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-black/5 text-slate-400 hover:text-slate-900 transition-colors">
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const StatsCard: React.FC<{ 
  label: string; 
  value: string; 
  subValue: string;
  icon: any; 
  color: string; 
  bg: string;
}> = ({ label, value, subValue, icon: Icon, color, bg }) => (
  <div className="group p-8 rounded-[40px] bg-white border border-black/5 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all">
    <div className="flex items-center justify-between mb-6">
      <div className={cn("h-12 w-12 rounded-[20px] flex items-center justify-center shadow-inner", bg, color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-orange-500 transition-colors">
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">{subValue}</p>
  </div>
);
