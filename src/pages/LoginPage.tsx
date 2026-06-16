import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem('ams_remember') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('ams_remember'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('ams_remember', email);
    } else {
      localStorage.removeItem('ams_remember');
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 animate-gradient-shift" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Decorative blur blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo / Branding */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <img
              src="/smb-logo.png"
              alt="Sustainable Medical Billing"
              className="w-20 h-20 rounded-2xl shadow-lg shadow-green-500/30 mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-white tracking-tight">SMB</h1>
            <p className="text-blue-200 text-sm mt-1">Sustainable Medical Billing</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.3 },
              },
            }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15
                             transition-all duration-200 text-sm"
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/60 
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15
                             transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Remember me + Forgot password */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-blue-100">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Sign In button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold
                           shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                           hover:from-blue-600 hover:to-indigo-700
                           active:scale-[0.98] transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </motion.div>
          </motion.form>

          {/* Credentials hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <p className="text-xs text-blue-200/70 text-center leading-relaxed">
              Default credentials:{' '}
              <span className="text-blue-100 font-medium">admin@company.com</span>
              {' / '}
              <span className="text-blue-100 font-medium">admin123</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CSS for animated gradient */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
