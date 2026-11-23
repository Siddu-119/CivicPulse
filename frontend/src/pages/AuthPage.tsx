import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (loading) {
      timer = setTimeout(() => {
        setSlowLoading(true);
      }, 4000);
    } else {
      setSlowLoading(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/citizen', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const signedIn =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register({
              fullName: fullName.trim(),
              email: email.trim(),
              password,
              phone: phone.trim() || undefined,
              ward: ward.trim() || undefined,
            });
      navigate(signedIn.role === 'ADMIN' ? '/admin' : '/citizen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
      setSlowLoading(false);
    }
  };

  const fillDemo = (role: 'citizen' | 'admin') => {
    if (loading) return;
    setMode('login');
    setError('');
    if (role === 'citizen') {
      setEmail('citizen@civicpulse.org');
      setPassword('Citizen@12345');
    } else {
      setEmail('admin@civicpulse.gov');
      setPassword('Admin@12345');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-2.5 rounded-2xl bg-gradient-to-tr from-slate-900 to-[#0B192C] text-cyan-400 shadow-md border border-slate-800">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          {mode === 'login' ? 'Sign In to CivicPulse' : 'Create Citizen Account'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {mode === 'login'
            ? 'Sign in with your Citizen credentials or Municipal Operations login.'
            : 'Register to file geo-tagged infrastructure reports, view live updates, and rate completed work.'}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (loading) return;
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (loading) return;
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicpulse.org"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ward / Area
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward 14 - Central"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {loading && slowLoading && (
            <div className="p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <Loader2 className="w-4 h-4 shrink-0 text-amber-600 animate-spin mt-0.5" />
              <span>
                Connecting to the server... The service may take a little longer to wake up. Please wait.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {slowLoading
                    ? 'Waking up server...'
                    : mode === 'login'
                    ? 'Authenticating...'
                    : 'Creating Account...'}
                </span>
              </>
            ) : (
              <span>
                {mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
              </span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Ribbon for Judges / Reviewers */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Round 2 Reviewer Quick-Fill Credentials</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => fillDemo('citizen')}
              className="p-2 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-colors disabled:opacity-50"
            >
              <span className="text-[11px] font-bold text-slate-900 block">Demo Citizen</span>
              <span className="text-[10px] text-slate-500 block truncate font-mono">
                citizen@civicpulse.org
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => fillDemo('admin')}
              className="p-2 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-colors disabled:opacity-50"
            >
              <span className="text-[11px] font-bold text-cyan-900 block">Demo Admin</span>
              <span className="text-[10px] text-slate-500 block truncate font-mono">
                admin@civicpulse.gov
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
