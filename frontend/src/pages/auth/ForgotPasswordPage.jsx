import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Droplets, Sun, Moon, Mail, ShieldCheck, KeyRound, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  // Steps: 'email' → 'otp' → 'reset' → 'done'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const apiCall = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  // Step 1: Kirim OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { ok, data } = await apiCall('/api/forgot-password/send-otp', { email });
      if (!ok && data.message) {
        setError(data.message);
      } else {
        setMessage(data.message);
        setStep('otp');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { ok, data } = await apiCall('/api/forgot-password/verify-otp', { email, otp });
      if (!ok) {
        setError(data.message || 'Kode OTP tidak valid.');
      } else {
        setMessage('');
        setStep('reset');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiCall('/api/forgot-password/reset', {
        email, otp, password, password_confirmation: passwordConfirmation,
      });
      if (!ok) {
        setError(data.message || 'Gagal mereset password.');
      } else {
        setStep('done');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResend = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { ok, data } = await apiCall('/api/forgot-password/send-otp', { email });
      if (ok) {
        setMessage('Kode OTP baru telah dikirim.');
        setOtp('');
      } else {
        setError(data.message || 'Gagal mengirim ulang.');
      }
    } catch {
      setError('Gagal mengirim ulang. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['email', 'otp', 'reset'].map((s, i) => {
        const isActive = ['email', 'otp', 'reset'].indexOf(step) >= i;
        const isDone = ['email', 'otp', 'reset'].indexOf(step) > i || step === 'done';
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
            }`}>
              {isDone ? '✓' : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${isActive ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <button onClick={toggle} className="absolute top-4 right-4 p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition z-10">
        {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
      </button>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AquaMonitor</h1>
          <p className="text-sm text-slate-400 mt-1">Reset Password</p>
        </div>

        <div className="card p-8">
          {step !== 'done' && stepIndicator}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {message && step === 'otp' && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}

          {/* STEP 1: Input Email */}
          {step === 'email' && (
            <>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-500" /> Masukkan Email
              </h2>
              <p className="text-sm text-slate-400 mb-6">Kami akan mengirimkan kode OTP 6 digit ke email Anda.</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Masukkan email terdaftar" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: Input OTP */}
          {step === 'otp' && (
            <>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" /> Verifikasi OTP
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Masukkan 6 digit kode yang dikirim ke <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kode OTP</label>
                  <input
                    type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl font-mono tracking-[0.5em] font-bold"
                    placeholder="000000" required maxLength={6}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
                  {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => { setStep('email'); setError(''); setMessage(''); }} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Ganti email
                </button>
                <button onClick={handleResend} disabled={loading} className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                  Kirim ulang OTP
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Reset Password */}
          {step === 'reset' && (
            <>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary-500" /> Buat Password Baru
              </h2>
              <p className="text-sm text-slate-400 mb-6">Masukkan password baru untuk akun Anda.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10" placeholder="Minimal 6 karakter" required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Konfirmasi Password</label>
                  <input
                    type={showPass ? 'text' : 'password'} value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="input-field" placeholder="Ulangi password baru" required minLength={6}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Mereset...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* STEP DONE */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Password Berhasil Direset!</h2>
              <p className="text-sm text-slate-400 mb-6">Silakan login dengan password baru Anda.</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Ke Halaman Login
              </button>
            </div>
          )}

          {/* Back to login link */}
          {step !== 'done' && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <Link to="/login" className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">Capstone Project — Universitas Diponegoro</p>
      </div>
    </div>
  );
}
