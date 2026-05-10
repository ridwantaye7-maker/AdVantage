import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Transaction } from '../types';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  CreditCard,
  CreditCard as GPayIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';

export const Wallet: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      const path = 'transactions';
      try {
        const q = query(
          collection(db, path),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const handleAddFunds = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        const depositAmount = parseFloat(amount);
        const newTransaction: Omit<Transaction, 'id'> = {
          userId: user.uid,
          amount: depositAmount,
          type: 'deposit',
          method: 'google_pay',
          status: 'completed',
          description: `Google Pay Top-up - ${formatCurrency(depositAmount)}`,
          createdAt: Date.now()
        };

        const txPath = 'transactions';
        let txRef;
        try {
          txRef = await addDoc(collection(db, txPath), newTransaction);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, txPath);
        }
        
        // Update user balance
        const userPath = `users/${user.uid}`;
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            balance: (profile?.balance || 0) + depositAmount
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, userPath);
        }

        setTransactions([{ id: txRef.id, ...newTransaction } as Transaction, ...transactions]);
        setShowAddFunds(false);
        setAmount('');
      } catch (error) {
        console.error('Wallet Error:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Billing & Wallet</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Manage funds and view statements</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent</span>
              <span className="font-mono text-sm font-bold text-slate-900">$2,450.00</span>
           </div>
           <button 
             onClick={() => setShowAddFunds(true)}
             className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-orange-600 transition shadow-xl active:scale-95"
           >
             <Plus className="h-5 w-5" /> Add Funds
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative group overflow-hidden bg-slate-900 rounded-[56px] p-10 text-white shadow-2xl">
            <div className="absolute top-0 right-0 p-12 bg-orange-600/20 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
               <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
                     <WalletIcon className="h-7 w-7 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                     <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Available Balance</p>
                  <p className="text-6xl font-black tracking-tighter italic leading-none">{formatCurrency(profile?.balance || 0)}</p>
               </div>
               <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Instant Deposits</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/40" />
               </div>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white border border-black/5 space-y-6">
             <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-600" /> Payment Methods
             </h4>
             <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-black/5">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight text-slate-700">Google Pay</span>
                   </div>
                   <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-3xl border border-dashed border-black/10 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
                   <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add New Method
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Recent Movements</h3>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition">Download Statements</button>
          </div>

          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse" />)}
             </div>
          ) : transactions.length === 0 ? (
             <div className="py-24 text-center space-y-6 bg-white border border-black/5 rounded-[48px] shadow-sm">
                <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                   <History className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                   <p className="text-slate-900 font-black uppercase tracking-widest">No history yet</p>
                   <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Your financial activity will appear here</p>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 bg-white border border-black/5 rounded-[32px] hover:shadow-xl hover:shadow-black/5 transition-all">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                        tx.type === 'deposit' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase italic">{tx.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{tx.method}</span>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={cn(
                        "text-lg font-black tracking-tighter",
                        tx.type === 'deposit' ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Successful</p>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {showAddFunds && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowAddFunds(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[48px] p-10 shadow-2xl space-y-8"
            >
              <div className="text-center space-y-4">
                 <div className="mx-auto h-20 w-20 rounded-[32px] bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-600/30">
                    <TrendingUp className="h-10 w-10" />
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Add Funds</h3>
                 <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Secure injection via Google Pay</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Amount (USD)</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                    disabled={isProcessing}
                    className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border border-black/5 text-2xl font-black tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-center"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                   {['25', '50', '100'].map(val => (
                     <button 
                       key={val}
                       onClick={() => setAmount(val)}
                       disabled={isProcessing}
                       className="py-3 rounded-2xl bg-white border border-black/5 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-orange-500/20 transition-all"
                     >
                       +${val}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={handleAddFunds}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest transition-all hover:bg-orange-600 hover:shadow-2xl disabled:opacity-50 active:scale-95 shadow-xl shadow-black/10"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                       <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <GPayIcon className="h-5 w-5" />
                      <span>Pay with GPay</span>
                    </>
                  )}
                </button>
                
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Trusted by 2,000+ top communities. <br/>
                  Encrypted transactions. 100% Secure.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
