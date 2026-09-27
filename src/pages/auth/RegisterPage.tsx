import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Zap, ChevronRight, ChevronLeft, Eye, EyeOff,
  CheckCircle2, User, Mail, Lock, GraduationCap,
  Building2, BookOpen, Layers, Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const step1Fields = [
  { id: 'name', label: 'Full name', icon: <User className="h-4 w-4" />, type: 'text', placeholder: 'Alex Kumar', field: 'name' as const },
  { id: 'reg-email', label: 'Email address', icon: <Mail className="h-4 w-4" />, type: 'email', placeholder: 'alex@college.edu', field: 'email' as const },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', university: '', course: '', branch: '',
    year: 3, semester: 5,
  });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((p) => ({ ...p, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateStep2 = () => {
    if (!form.college.trim()) return 'College name is required';
    if (!form.university.trim()) return 'University is required';
    if (!form.course.trim()) return 'Course is required';
    if (!form.branch.trim()) return 'Branch is required';
    return '';
  };

  const nextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        college: form.college, university: form.university,
        course: form.course, branch: form.branch,
        year: form.year, semester: form.semester,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all backdrop-blur-sm";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5";

  return (
    <div className="min-h-screen flex bg-[#060812] text-white">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col relative overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-[#060812]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-700/30 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Student OS</span>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold font-display leading-snug mb-3">
                Your academic workspace{' '}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  starts here
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join 50,000+ students managing their entire semester with Student OS.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-5">
              {[
                { num: '01', title: 'Create your account', desc: 'Set up your email and password', done: step > 1 },
                { num: '02', title: 'Academic profile', desc: 'Tell us about your college & course', done: false },
                { num: '03', title: 'Start tracking', desc: 'Add subjects and get organized', done: false },
              ].map(({ num, title, desc, done }, i) => (
                <div key={num} className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    done ? 'bg-emerald-500 text-white' : i + 1 === step ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-500'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : num}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${i + 1 <= step ? 'text-white' : 'text-slate-600'}`}>{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="mt-10 space-y-2.5">
              {[
                'Timetable & attendance tracking',
                'Assignment & exam planner',
                'Smart notes & task manager',
                'Internship opportunities feed',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <div className="h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-violet-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-700">© 2026 Student OS</p>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex flex-1 items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[#060812]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-base">Student OS</span>
          </div>

          {/* Step pill indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                {step > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '1'}
              </div>
              <span className={`text-xs font-medium ${step === 1 ? 'text-white' : 'text-slate-500'}`}>Account</span>
            </div>
            <div className={`h-0.5 flex-1 max-w-12 rounded-full transition-all ${step > 1 ? 'bg-violet-500' : 'bg-white/10'}`} />
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-violet-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                2
              </div>
              <span className={`text-xs font-medium ${step === 2 ? 'text-white' : 'text-slate-500'}`}>Academic</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display">
              {step === 1 ? 'Create your account' : 'Academic profile'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {step === 1 ? "Let's get you set up with Student OS" : 'Tell us about your education'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ─── Step 1 ─── */}
          {step === 1 ? (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className={labelClass}>Full name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><User className="h-4 w-4" /></span>
                  <input id="name" type="text" placeholder="Alex Kumar" value={form.name} onChange={set('name')} className={inputClass} required />
                </div>
              </div>
              {/* Email */}
              <div>
                <label htmlFor="reg-email" className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Mail className="h-4 w-4" /></span>
                  <input id="reg-email" type="email" placeholder="alex@college.edu" value={form.email} onChange={set('email')} className={inputClass} required />
                </div>
              </div>
              {/* Password */}
              <div>
                <label htmlFor="reg-password" className={labelClass}>Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="h-4 w-4" /></span>
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    className={`${inputClass} pr-11`}
                    required
                  />
                  <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        form.password.length >= i * 2
                          ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-blue-500' : 'bg-emerald-500'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              {/* Confirm */}
              <div>
                <label htmlFor="confirm" className={labelClass}>Confirm password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="h-4 w-4" /></span>
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`${inputClass} pr-11`}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                )}
              </div>
              <button
                type="button"
                id="register-next"
                onClick={nextStep}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* ─── Step 2 ─── */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="year" className={labelClass}>Year</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Calendar className="h-4 w-4" /></span>
                    <select
                      id="year"
                      value={form.year}
                      onChange={set('year')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-3 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none"
                    >
                      {years.map((y, i) => <option key={y} value={i + 1} className="bg-[#1a1d2e] text-white">{y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="semester" className={labelClass}>Semester</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Layers className="h-4 w-4" /></span>
                    <select
                      id="semester"
                      value={form.semester}
                      onChange={set('semester')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-3 text-sm text-white outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none"
                    >
                      {semesters.map((s) => <option key={s} value={s} className="bg-[#1a1d2e] text-white">Semester {s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="course" className={labelClass}>Course</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><GraduationCap className="h-4 w-4" /></span>
                  <input id="course" type="text" placeholder="e.g. B.Tech, B.Sc, BCA" value={form.course} onChange={set('course')} className={inputClass} required />
                </div>
              </div>
              <div>
                <label htmlFor="branch" className={labelClass}>Branch / Major</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><BookOpen className="h-4 w-4" /></span>
                  <input id="branch" type="text" placeholder="e.g. Computer Science" value={form.branch} onChange={set('branch')} className={inputClass} required />
                </div>
              </div>
              <div>
                <label htmlFor="college" className={labelClass}>College name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Building2 className="h-4 w-4" /></span>
                  <input id="college" type="text" placeholder="e.g. IIT Bombay" value={form.college} onChange={set('college')} className={inputClass} required />
                </div>
              </div>
              <div>
                <label htmlFor="university" className={labelClass}>University</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><GraduationCap className="h-4 w-4" /></span>
                  <input id="university" type="text" placeholder="e.g. Mumbai University" value={form.university} onChange={set('university')} className={inputClass} required />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(1); }}
                  className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3.5 rounded-xl transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  id="register-submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
