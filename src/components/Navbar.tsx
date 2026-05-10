import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { 
  Home, 
  LayoutDashboard, 
  Megaphone, 
  Wallet, 
  User, 
  LogOut, 
  Shield, 
  PlusCircle, 
  Search,
  Bell,
  Menu,
  X,
  CreditCard,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

export const Navbar: React.FC = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Explore', path: '/ads', icon: Search },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, protected: true },
    { label: 'Wallet', path: '/wallet', icon: Wallet, protected: true },
    { label: 'Notifications', path: '/notifications', icon: Bell, protected: true, badge: 2 },
  ];

  const bottomNavItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/ads', icon: Search },
    { label: 'Campaigns', path: '/dashboard', icon: LayoutGrid, protected: true },
    { label: 'Wallet', path: '/wallet', icon: CreditCard, protected: true },
    { label: 'Profile', path: '/auth', icon: User },
  ];

  const filteredNavItems = navItems.filter(item => !item.protected || user);

  return (
    <>
      {/* Desktop Navbar - Sticky Top */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-slate-900 rounded-[12px] flex items-center justify-center text-white font-black group-hover:bg-orange-600 transition-colors shadow-lg shadow-black/5 rotate-3 group-hover:rotate-0 transition-transform">
              A
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">AdVantage</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50 flex items-center gap-2",
                    isActive ? "text-orange-600 bg-orange-50/50" : "text-slate-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && !isActive && (
                    <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-orange-600" />
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-orange-100/30 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
               <div className="flex items-center gap-6">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory</span>
                    <span className="text-sm font-black text-slate-900 italic tracking-tighter">{formatCurrency(profile?.balance || 0)}</span>
                 </div>
                 
                 <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="h-12 w-12 rounded-[18px] bg-slate-50 border border-black/5 overflow-hidden hover:border-orange-500/20 transition-all flex items-center justify-center p-0.5"
                    >
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="" className="h-full w-full object-cover rounded-[15px]" />
                      ) : (
                        <User className="h-6 w-6 text-slate-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] border border-black/5 shadow-2xl z-50 p-6 space-y-4"
                          >
                            <div className="pb-4 border-b border-black/5 flex items-center gap-4">
                               <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-black/5 overflow-hidden">
                                  {profile?.photoURL ? <img src={profile.photoURL} alt="" /> : <User className="h-7 w-7 text-slate-300" />}
                               </div>
                               <div className="min-w-0">
                                  <p className="font-black text-slate-900 truncate uppercase italic tracking-tight">{profile?.displayName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 truncate tracking-widest">{profile?.email}</p>
                               </div>
                            </div>
                            
                            <div className="space-y-1">
                               {isAdmin && (
                                 <Link to="/admin" className="flex items-center gap-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                                   <Shield className="h-4 w-4" /> Overseer Console
                                 </Link>
                               )}
                               <Link to="/dashboard" className="flex items-center gap-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                                  <LayoutDashboard className="h-4 w-4" /> Performance
                               </Link>
                               <Link to="/wallet" className="flex items-center gap-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                                  <CreditCard className="h-4 w-4" /> Treasury
                               </Link>
                            </div>

                            <button 
                              onClick={logout}
                              className="flex items-center gap-3 w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" /> Terminate Session
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                 </div>
               </div>
            ) : (
               <Link to="/auth" className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-xl shadow-black/10 active:scale-95 flex items-center gap-2">
                 Join Network <ArrowRight className="h-4 w-4" />
               </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Technical Recipe */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-[60] px-4 pb-4">
        <div className="mx-auto max-w-lg bg-white/90 backdrop-blur-2xl border border-black/[0.05] rounded-[32px] shadow-2xl h-18 flex items-center justify-around px-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
            if (item.protected && !user) return null;
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                  isActive ? "text-orange-600 -translate-y-1 scale-110" : "text-slate-400"
                )}
              >
                <Icon className={cn("h-6 w-6 mb-0.5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 h-1 w-6 bg-orange-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
