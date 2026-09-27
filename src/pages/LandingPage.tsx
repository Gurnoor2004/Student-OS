import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  Zap, BookOpen, Calendar, CheckCircle2, GraduationCap,
  BarChart3, Bell, Clock, ArrowRight, Star, Users, TrendingUp,
  Shield, Sparkles, ChevronRight, Brain, Target, Layers,
  Menu, X,
} from 'lucide-react';

/* ─── tiny hooks ─── */
function useInView(ref: React.RefObject<Element | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function useCounter(target: number, visible: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, visible, duration]);
  return count;
}

/* ─── data ─── */
const features = [
  {
    icon: <Calendar className="h-6 w-6" />,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
    title: 'Smart Timetable',
    desc: 'Auto-detect conflicts, get next-class alerts, and never be late again.',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    color: 'from-blue-500 to-cyan-600',
    glow: 'rgba(59,130,246,0.3)',
    title: 'Assignment Tracker',
    desc: 'Priority queue, deadline countdowns, and status tracking in one view.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
    title: 'Attendance Analytics',
    desc: 'Know exactly how many classes you can miss before you fall below 75%.',
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    color: 'from-orange-500 to-rose-500',
    glow: 'rgba(249,115,22,0.3)',
    title: 'Exam Planner',
    desc: 'Countdown timers, venue maps, study resources — all pre-exam essentials.',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    color: 'from-pink-500 to-fuchsia-600',
    glow: 'rgba(236,72,153,0.3)',
    title: 'Smart Notes',
    desc: 'Markdown-powered notes linked to subjects, searchable in seconds.',
  },
  {
    icon: <Target className="h-6 w-6" />,
    color: 'from-amber-500 to-yellow-500',
    glow: 'rgba(245,158,11,0.3)',
    title: 'Opportunities Feed',
    desc: 'Internships, hackathons, and scholarships curated for your profile.',
  },
];

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'B.Tech CSE · IIT Delhi',
    avatar: 'AM',
    text: "Student OS completely changed how I manage my semester. My attendance never dropped below 85% after I started using it.",
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'MCA · Pune University',
    avatar: 'PS',
    text: "The assignment priority queue is genius. I stopped missing deadlines the moment I started using it. Highly recommend!",
    stars: 5,
  },
  {
    name: 'Rohan Das',
    role: 'B.Sc IT · Mumbai University',
    avatar: 'RD',
    text: "Found my first internship through the Opportunities feed. The whole app feels like it was built specifically for students.",
    stars: 5,
  },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Active Students', float: false },
  { value: 200, suffix: '+', label: 'Colleges', float: false },
  { value: 98, suffix: '%', label: 'Satisfaction', float: false },
  { value: 49, suffix: '★', label: 'Average Rating', float: false },
];

/* ─── sub-components ─── */
function FeatureCard({ feature, delay }: { feature: typeof features[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:-translate-y-1"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s, background 0.3s`,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(300px circle at 50% 0%, ${feature.glow}, transparent 70%)` }}
      />
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg`}>
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

function TestimonialCard({ t, delay }: { t: typeof testimonials[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: t.stars }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.name}</p>
          <p className="text-xs text-slate-500">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string; float: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, 0.3);
  const count = useCounter(value, visible);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Orb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`}
      style={{ animationDuration: '4s' }}
    />
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#060812] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#060812]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Student OS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['features', 'testimonials', 'stats'].map((item) => (
              <a key={item} href={`#${item}`} className="text-sm text-slate-400 hover:text-white transition-colors capitalize">
                {item}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2 rounded-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            >
              Get started <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d0f1e] border-t border-white/10 px-6 py-4 space-y-3">
            {['features', 'testimonials', 'stats'].map((item) => (
              <a key={item} href={`#${item}`} className="block text-sm text-slate-400 hover:text-white py-1 capitalize" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <hr className="border-white/10" />
            <Link to="/login" className="block text-sm text-slate-300 py-1">Sign in</Link>
            <Link to="/register" className="block text-center text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-lg">
              Get started free
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <Orb className="h-[600px] w-[600px] bg-violet-600 -top-40 -left-40" />
        <Orb className="h-[500px] w-[500px] bg-purple-700 top-20 -right-40" />
        <Orb className="h-[400px] w-[400px] bg-blue-700 bottom-0 left-1/3" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">The academic OS every student deserves</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.05] mb-6">
            <span className="block">Your entire</span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              academic life
            </span>
            <span className="block">in one place.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Track attendance, manage assignments, plan exams, and discover
            opportunities — all in a beautifully designed workspace built for students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="hero-cta-register"
              className="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105"
            >
              Start for free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="flex items-center gap-2 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 px-8 py-4 rounded-xl transition-all backdrop-blur-sm hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-500" />
              <span>50,000+ students already using it</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-20 relative mx-auto max-w-4xl">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/50 to-cyan-600/50 blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0d0f1e] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0c18]">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-4 rounded-md bg-white/5 py-1 px-3 text-xs text-slate-500">studentos.app/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Assignments', val: '3', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <BookOpen className="h-4 w-4" /> },
                  { label: 'Upcoming Exams', val: '2', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <GraduationCap className="h-4 w-4" /> },
                  { label: 'Task Rate', val: '87%', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <CheckCircle2 className="h-4 w-4" /> },
                  { label: 'Attendance', val: '91%', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: <BarChart3 className="h-4 w-4" /> },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl ${card.bg} border border-white/5 p-4`}>
                    <div className={`flex items-center gap-1.5 ${card.color} text-xs mb-2`}>{card.icon}<span className="font-medium">{card.label}</span></div>
                    <div className="text-2xl font-bold text-white">{card.val}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2 rounded-xl bg-white/5 border border-white/5 p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-violet-400" /> Priority Queue
                  </p>
                  {['Data Structures Assignment', 'DBMS Mid-Term', 'OS Lab Report'].map((item, i) => (
                    <div key={item} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                      <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <span className="text-xs text-slate-300 flex-1">{item}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${i === 0 ? 'bg-rose-500/20 text-rose-400' : i === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {i === 0 ? 'Critical' : i === 1 ? 'High' : 'Medium'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <p className="text-xs font-semibold text-violet-400 mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Next Class
                  </p>
                  <p className="text-sm font-semibold text-white">Algorithms</p>
                  <p className="text-xs text-slate-400 mt-1">10:30 AM · Room 204</p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Starting in 25 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" ref={statsRef} className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((s) => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 relative">
        <Orb className="h-[400px] w-[400px] bg-violet-700 right-0 top-0" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
              <Layers className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-slate-400">Everything you need</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Built for the{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">modern student</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every feature is designed to reduce cognitive load and let you focus on what matters — learning.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-slate-400">Student love</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">students everywhere</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} t={t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/50 to-purple-900/50" />
        <Orb className="h-[600px] w-[600px] bg-violet-600 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 mb-8">
            <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">Free forever for students</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Ready to ace{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">your semester?</span>
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Join thousands of students who manage their entire academic life with Student OS.
            Set up in under 2 minutes.
          </p>
          <Link
            to="/register"
            id="cta-bottom-register"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105"
          >
            Get started — it is free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in here</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-semibold text-sm">Student OS</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 Student OS. Built for students, by students.</p>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link to="/login" className="hover:text-slate-400 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-slate-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
