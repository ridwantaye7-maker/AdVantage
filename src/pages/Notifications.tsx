import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  Zap,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'payment' | 'expiration' | 'system';
  read: boolean;
  createdAt: number;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const path = 'notifications';
      try {
        const q = query(
          collection(db, path),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    const path = `notifications/${id}`;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Notifications</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Updates on your campaigns & account</p>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition">Mark all as read</button>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-32 text-center bg-white border border-black/5 rounded-[56px] shadow-sm space-y-6">
           <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
              <Bell className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <p className="text-slate-900 font-black uppercase tracking-widest">Awaiting signal</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Your inbox is currently empty</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((n) => (
            <motion.div 
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={cn(
                "p-8 rounded-[40px] border transition-all flex items-start gap-6 relative cursor-pointer group",
                n.read ? "bg-white border-black/5 grayscale opacity-70" : "bg-white border-orange-500/20 shadow-xl shadow-orange-600/5"
              )}
            >
              {!n.read && <div className="absolute top-8 right-8 h-2 w-2 rounded-full bg-orange-600 animate-pulse" />}
              
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                n.type === 'approval' ? "bg-emerald-50 text-emerald-600" :
                n.type === 'rejection' ? "bg-red-50 text-red-600" :
                n.type === 'payment' ? "bg-emerald-50 text-emerald-600" :
                n.type === 'expiration' ? "bg-amber-50 text-amber-600" :
                "bg-slate-50 text-slate-600"
              )}>
                {n.type === 'approval' && <CheckCircle2 className="h-7 w-7" />}
                {n.type === 'rejection' && <XCircle className="h-7 w-7" />}
                {n.type === 'payment' && <Wallet className="h-7 w-7" />}
                {n.type === 'expiration' && <Clock className="h-7 w-7" />}
                {n.type === 'system' && <MessageSquare className="h-7 w-7" />}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                   <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{n.title}</h4>
                   <span className="text-[9px] font-mono text-slate-400 uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{n.message}</p>
                <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 group-hover:gap-3 transition-all">
                   Manage Campaign <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
