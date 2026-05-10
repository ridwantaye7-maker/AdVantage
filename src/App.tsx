import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Ads } from './pages/Ads';
import { CreateAd } from './pages/CreateAd';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';
import { Wallet, Notifications } from './pages';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-3xl border-4 border-orange-600 border-t-transparent shadow-2xl shadow-orange-600/20"></div>
    </div>
  );

  if (!user) return <Navigate to="/auth" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 selection:text-orange-900 pb-20 md:pb-0">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ads" element={<Ads />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="mt-20 border-t border-black/5 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-orange-600 text-white font-bold tracking-tight">A</div>
                    <span className="text-xl font-bold tracking-tighter">AdVantage</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed uppercase tracking-tighter font-bold">The premier destination for promoting your digital assets, social groups, and business services.</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 italic">Platform</h4>
                  <ul className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <li><Link to="/ads" className="hover:text-orange-600">Privacy Policy</Link></li>
                    <li><Link to="/ads" className="hover:text-orange-600">Terms of Service</Link></li>
                    <li><Link to="/ads" className="hover:text-orange-600">Ad Policy</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 italic">Support</h4>
                  <ul className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <li><a href="#" className="hover:text-orange-600">Help Center</a></li>
                    <li><a href="#" className="hover:text-orange-600">Community Guidelines</a></li>
                    <li><a href="#" className="hover:text-orange-600">Contact Us</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 italic">Network</h4>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center hover:bg-orange-50 transition-colors cursor-pointer text-[10px] font-black">TWITTER</div>
                    <div className="px-4 py-2 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center hover:bg-orange-50 transition-colors cursor-pointer text-[10px] font-black">TELEGRAM</div>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-black/5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                &copy; {new Date().getFullYear()} AdVantage Pro Intelligence. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
