import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import { Advertisement, UserProfile } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Megaphone,
  Search,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { Navigate } from 'react-router-dom';

export const AdminList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      try {
        const adsSnapshot = await getDocs(query(collection(db, 'ads'), orderBy('createdAt', 'desc')));
        const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        
        setAds(adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Advertisement)));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserProfile)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleStatusUpdate = async (adId: string, status: 'active' | 'rejected') => {
    try {
      const adRef = doc(db, 'ads', adId);
      await updateDoc(adRef, { 
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        approvedAt: status === 'active' ? Date.now() : null
      });
      
      setAds(ads.map(ad => ad.id === adId ? { ...ad, status, rejectionReason: status === 'rejected' ? rejectionReason : undefined } : ad));
      setSelectedAdId(null);
      setRejectionReason('');
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAdmin) return <Navigate to="/" />;

  const pendingAds = ads.filter(ad => ad.status === 'pending');
  const displayAds = activeTab === 'pending' ? pendingAds : ads;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
             <ShieldCheck className="h-4 w-4" /> Mod Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Admin Oversight</h1>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm">
           <button 
             onClick={() => setActiveTab('pending')}
             className={cn(
               "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
               activeTab === 'pending' ? "bg-slate-900 text-white shadow-lg shadow-black/10" : "text-slate-400 hover:text-slate-600"
             )}
           >
             Queued ({pendingAds.length})
           </button>
           <button 
             onClick={() => setActiveTab('all')}
             className={cn(
               "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
               activeTab === 'all' ? "bg-slate-900 text-white shadow-lg shadow-black/10" : "text-slate-400 hover:text-slate-600"
             )}
           >
             All Ads
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={cn(
               "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
               activeTab === 'users' ? "bg-slate-900 text-white shadow-lg shadow-black/10" : "text-slate-400 hover:text-slate-600"
             )}
           >
             Users
           </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse">
           <div className="mx-auto h-12 w-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Moderation Feed...</p>
        </div>
      ) : activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {users.map(user => (
             <div key={user.uid} className="p-8 bg-white border border-black/5 rounded-[40px] flex items-center gap-6 group hover:shadow-2xl transition-all">
                <div className="h-16 w-16 rounded-[24px] bg-slate-100 flex items-center justify-center overflow-hidden border border-black/5">
                   {user.photoURL ? <img src={user.photoURL} alt="" /> : <Users className="h-8 w-8 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-black text-slate-900 truncate uppercase italic tracking-tight">{user.displayName}</p>
                   <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-900 text-white rounded-md">{user.role}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md">{formatCurrency(user.balance)}</span>
                   </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-red-500 transition-colors" />
             </div>
           ))}
        </div>
      ) : displayAds.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[56px] border border-black/5 space-y-6">
           <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
              <CheckCircle2 className="h-10 w-10" />
           </div>
           <p className="text-sm font-black uppercase tracking-widest text-slate-400">Queue is clear. No items to moderate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {displayAds.map((ad) => (
             <motion.div 
               key={ad.id}
               className="p-8 bg-white border border-black/5 rounded-[48px] flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:shadow-2xl hover:shadow-black/5 transition-all"
             >
                <div className="flex items-start gap-8 flex-1">
                   <div className="h-20 w-20 rounded-[32px] bg-slate-100 flex items-center justify-center text-slate-300 shrink-0 border border-black/5 overflow-hidden">
                      {ad.mediaUrl ? <img src={ad.mediaUrl} className="h-full w-full object-cover" /> : <Megaphone className="h-10 w-10" />}
                   </div>
                   <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full text-slate-500">{ad.category}</span>
                         {ad.status === 'pending' && (
                           <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500">
                              <Clock className="h-3 w-3" /> Awaiting Review
                           </span>
                         )}
                         {ad.status === 'active' && (
                           <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                              <CheckCircle2 className="h-3 w-3" /> Active
                           </span>
                         )}
                         {ad.status === 'rejected' && (
                           <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                              <XCircle className="h-3 w-3" /> Rejected
                           </span>
                         )}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{ad.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 max-w-2xl">{ad.description}</p>
                      <div className="flex items-center gap-6 pt-2">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Targeting</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase">{ad.targeting.country} • {ad.targeting.city || 'Global'}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Budget</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase">{formatCurrency(ad.budget)}</span>
                         </div>
                         <a 
                           href={ad.link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                         >
                            Inspect Link <ExternalLink className="h-3 w-3" />
                         </a>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                   {ad.status === 'pending' ? (
                     <>
                        {selectedAdId === ad.id ? (
                           <div className="flex flex-col gap-3 min-w-[240px]">
                              <input 
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Why reject this ad?"
                                className="w-full px-4 py-2 text-xs border border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleStatusUpdate(ad.id, 'rejected')}
                                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                  Confirm Rejection
                                </button>
                                <button 
                                  onClick={() => setSelectedAdId(null)}
                                  className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                  Cancel
                                </button>
                              </div>
                           </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(ad.id, 'active')}
                              className="px-8 py-5 bg-emerald-600 text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => setSelectedAdId(ad.id)}
                              className="px-8 py-5 bg-red-50 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                     </>
                   ) : (
                     <div className="px-6 py-3 rounded-2xl bg-slate-50 border border-black/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Handled by Mod</p>
                        <p className="text-xs font-bold text-slate-600 uppercase mt-1">{ad.status}</p>
                     </div>
                   )}
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export const Admin = AdminList;
