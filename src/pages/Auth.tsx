import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl shadow-black/5">
          <div className="bg-slate-900 px-8 py-10 text-white">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Secure Access</h1>
            <p className="mt-2 text-slate-400">Join the next generation of digital marketing.</p>
          </div>
          
          <div className="p-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 italic">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition-all hover:border-orange-200 hover:bg-orange-50/30 active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg" alt="Google" className="h-5 w-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-white px-4 text-slate-300">Enterprise Ready</span></div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Verification</h4>
                  <p className="text-xs text-slate-500 leading-tight">All accounts are verified for maximum platform safety.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Trusted by 10,000+ Advertisers
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
