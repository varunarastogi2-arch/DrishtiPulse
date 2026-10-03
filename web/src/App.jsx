import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import RiskHeatmap from './components/RiskHeatmap';
import AIActionDrafter from './components/AIActionDrafter';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';

const steps = [
  { eyebrow: "PREDICTIVE ENGINE", title: "Predictive ML Engine", body: "Every active case gets scored continuously, from 0 to 100 percent, on how likely it is to slip into delay.", color: "#ff2d9a" },
  { eyebrow: "EXPLAINABLE AI", title: "See the why, not just the score", body: "SHAP-based explanations surface the top two or three drivers behind every risk score. Officers never work from a black box.", color: "#34f0b5" },
  { eyebrow: "CENTRALIZED PLATFORM", title: "One platform for every case", body: "Land acquisition data that today lives across scattered systems comes together in a single place officers actually use.", color: "#4dd0ff" },
  { eyebrow: "ACCESS CONTROL", title: "Secure registration and verification", body: "Officer accounts go through safe authentication and profile checks before anyone touches a case.", color: "#ff2d9a" },
  { eyebrow: "BOTTLENECK HEATMAP", title: "See where delays cluster", body: "A district and state-wise visual map shows exactly where cases are getting stuck, at a glance.", color: "#34f0b5" },
  { eyebrow: "AI CHATBOT", title: "Ask, don't dig", body: "Officers get instant answers to questions like 'Why is Case X high-risk?' or 'What's still pending?' — no digging through case files.", color: "#4dd0ff" },
  { eyebrow: "ROLE-BASED LOGIN", title: "Built for the whole chain of command", body: "Separate authenticated views for officers, district collectors, and admins, each seeing what's relevant to their role.", color: "#ff2d9a" },
  { eyebrow: "WHAT-IF SIMULATOR", title: "Test a change before you make it", body: "Officers tweak a variable, like consent percentage, and watch the risk score update in real time before committing to a decision.", color: "#34f0b5" }
];

const CardSlider = ({ steps }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, steps.length - itemsPerPage);
  const totalPages = Math.ceil(steps.length / itemsPerPage);

  const nextSlide = () => setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(prev => Math.max(prev - 1, 0));
  const goToSlide = (idx) => setCurrentIndex(Math.min(idx * itemsPerPage, maxIndex));

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-12 z-10">
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{ transform: `translateX(calc(-${currentIndex * (100 / itemsPerPage)}%))` }}
        >
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerPage}% - ${((itemsPerPage - 1) * 24) / itemsPerPage}px)` }}
            >
              <div className="bg-[#0a0e27] rounded-xl overflow-hidden shadow-2xl h-full flex flex-col border border-white/5 group hover:border-white/10 transition-colors">
                <div
                  className="h-28 w-full relative p-5 flex items-end justify-start opacity-90 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}22 0%, #05070f 100%)`,
                    borderBottom: `2px solid ${step.color}`
                  }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  <div className="flex items-center gap-3 relative z-10 bg-[#05070f]/80 px-4 py-2 rounded-full border border-white/5">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: step.color, boxShadow: `0 0 12px ${step.color}` }}></span>
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: step.color }}>{step.eyebrow}</span>
                  </div>
                </div>

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">{step.title}</h3>
                  <p className="text-[#8b93b8] text-sm leading-relaxed mb-6 flex-1 font-light">{step.body}</p>
                  <button
                    className="self-start px-5 py-2.5 rounded-md text-white text-xs font-bold tracking-widest uppercase transition-all hover:bg-white/5"
                    style={{ border: `1px solid ${step.color}40`, borderLeft: `4px solid ${step.color}` }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-[#0a0e27] border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex items-center gap-3">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = Math.floor(currentIndex / itemsPerPage) === idx;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${isActive ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            )
          })}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className="w-12 h-12 rounded-full bg-[#0a0e27] border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [windowHeight, setWindowHeight] = useState(1000);

  const [formData, setFormData] = useState({
    case_id: "CASE-00045",
    state: "",
    sector: "",
    num_landowners: 24,
    pending_approvals: 5,
    consent_pct: 58,
    consent_growth_rate: 1.2,
    compensation_gap_pct: 33,
    days_since_notification: 407,
    litigation_flag: true,
    title_dispute_flag: false
  });
  const [healthData, setHealthData] = useState({ states_supported: [], sectors_supported: [] });
  const [overviewData, setOverviewData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/analytics/overview')
      .then(res => res.json())
      .then(data => setOverviewData(data))
      .catch(err => console.error("Could not fetch overview data", err));


    fetch('http://127.0.0.1:8000/health')
      .then(res => res.json())
      .then(data => {
        setHealthData(data);
        if (data.states_supported?.length > 0) {
          setFormData(prev => ({ ...prev, state: data.states_supported[0] }));
        }
        if (data.sectors_supported?.length > 0) {
          setFormData(prev => ({ ...prev, sector: data.sectors_supported[0] }));
        }
      })
      .catch(err => console.error("Could not fetch health data", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setPredictionResult(null);

    const payload = {
      ...formData,
      num_landowners: Number(formData.num_landowners),
      pending_approvals: Number(formData.pending_approvals),
      consent_pct: Number(formData.consent_pct),
      consent_growth_rate: Number(formData.consent_growth_rate),
      compensation_gap_pct: Number(formData.compensation_gap_pct),
      days_since_notification: Number(formData.days_since_notification),
      litigation_flag: formData.litigation_flag ? 1 : 0,
      title_dispute_flag: formData.title_dispute_flag ? 1 : 0,
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setPredictionResult(data);
    } catch (err) {
      setErrorMsg("Couldn't reach the prediction engine — is the backend running on port 8000?");
    } finally {
      setIsLoading(false);
    }
  };

  const [activeNav, setActiveNav] = useState('');
  const [isDrafterOpen, setIsDrafterOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Initial setup
    setWindowHeight(window.innerHeight);

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Intersection Observer for nav active sections
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    }, { rootMargin: "-100px 0px -60% 0px" });

    document.querySelectorAll('section[id]').forEach(el => navObserver.observe(el));

    // Intersection Observer for simple reveals
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      revealObserver.disconnect();
      navObserver.disconnect();
    };
  }, []);

  // Scroll progress for other elements can be kept if needed, but not for hero.

  return (
    <div className="font-sans text-[#f4f6fb] bg-[#05070f] min-h-[200vh] w-full">

      {/* Header / Nav (Global & Sticky) */}
      <header
        className={`fixed top-0 left-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 z-50 transition-colors duration-300 ${hasScrolled ? 'bg-[#05070f]/70 backdrop-blur-md border-b border-white/10' : 'bg-transparent border-b border-transparent'
          }`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="DrishtiPulse Logo"
            className="h-10 mix-blend-screen"
          />
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
            DrishtiPulse
          </span>
        </div>

        {/* Navigation & Login Section */}
        <div className="flex flex-wrap justify-center md:flex-nowrap items-center gap-4">
          <nav className="flex flex-wrap items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg">
            {['Dashboard', 'Analysis', 'Heatmap', 'Action'].map((item) => (
              <button
                key={item}
                onClick={(e) => {
                  e.preventDefault();
                  if (item === 'Dashboard') {
                    const el = document.getElementById('risk');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                  } else if (item === 'Analysis') {
                    const el = document.getElementById('analysis');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                  } else if (item === 'Heatmap') {
                    const el = document.getElementById('heatmap');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
                  } else if (item === 'Action') {
                    setIsDrafterOpen(true);
                  }
                }}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium transition-all duration-300 relative ${(activeNav === 'analysis' && item === 'Analysis') || (activeNav === 'heatmap' && item === 'Heatmap')
                  ? 'text-white font-bold after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-[#ff2d9a] after:to-[#4dd0ff] after:rounded-full'
                  : 'text-[#8b93b8] hover:text-white'
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-5 py-2.5 rounded-full text-xs md:text-sm font-medium text-white border border-white/20 hover:border-[#ff2d9a]/50 bg-white/5 backdrop-blur-md transition-colors shadow-lg"
          >
            Operator Login
          </button>
        </div>
      </header>

      {/* SECTION 1 — HERO */}
      <div className="h-screen relative overflow-hidden z-0">

        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/diorama.webp"
            alt="Hero Background"
            width="1920"
            height="1080"
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient Overlay for Legibility */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(5,7,15,0.55) 0%, rgba(5,7,15,0.35) 40%, rgba(5,7,15,0.9) 100%)'
          }}
        ></div>



        {/* Center Headline */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-xl">
            <span className="block text-white">Early Warning</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d9a] to-[#4dd0ff]">for Land Risk</span>
          </h1>
          <p className="mt-6 text-[#8b93b8] text-base md:text-xl max-w-2xl font-light drop-shadow-md">
            An AI-driven ecosystem designed to identify, analyze, and preempt land acquisition delays before they impact your physical assets.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[#34f0b5] text-[10px] md:text-xs font-bold uppercase tracking-widest bg-[#0a0e27]/80 backdrop-blur-sm border border-[#34f0b5]/20 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(52,240,181,0.15)] pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-[#34f0b5] animate-pulse"></span>
            SYSTEM ONLINE • MODEL ACTIVE
          </div>
        </div>
      </div>

      {/* SECTION 2 — CONTENT SLIDER */}
      <div id="features" className="relative z-10 bg-[#05070f] border-t border-white/5 pt-12">
        <div className="absolute inset-0 bg-[#05070f]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] pointer-events-none"></div>
        </div>

        <div className="relative text-center max-w-3xl mx-auto px-4 z-20 pt-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">One platform for every case</h2>
          <p className="text-[#8b93b8] text-lg font-light">Land acquisition data that today lives across scattered systems comes together in a single place officers actually use.</p>
        </div>

        <CardSlider steps={steps} />
      </div>

      {/* SECTION 3 — RISK ENGINE */}
      <section id="risk" className="scroll-mt-24 relative z-10 bg-[#05070f] pt-24 pb-32 px-4 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Risk Engine</h2>
            <p className="text-[#8b93b8] text-lg">Score any case in real time using the trained model.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT COLUMN - Form */}
            <div className="bg-[#0a0e27]/90 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff2d9a]"></span> Case Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                {/* Inputs */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Case ID</label>
                  <input type="text" name="case_id" value={formData.case_id} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">State</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors appearance-none">
                    {healthData.states_supported.map(s => <option key={s} value={s} className="bg-[#0a0e27] text-white">{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Sector</label>
                  <select name="sector" value={formData.sector} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors appearance-none">
                    {healthData.sectors_supported.map(s => <option key={s} value={s} className="bg-[#0a0e27] text-white">{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Num Landowners</label>
                  <input type="number" name="num_landowners" value={formData.num_landowners} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Consent %</label>
                  <input type="number" name="consent_pct" value={formData.consent_pct} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Consent Growth Rate</label>
                  <input type="number" step="0.1" name="consent_growth_rate" value={formData.consent_growth_rate} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Comp Gap %</label>
                  <input type="number" name="compensation_gap_pct" value={formData.compensation_gap_pct} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Pending Approvals</label>
                  <input type="number" name="pending_approvals" value={formData.pending_approvals} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider">Days Since Notification</label>
                  <input type="number" name="days_since_notification" value={formData.days_since_notification} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4dd0ff] transition-colors" />
                </div>

                {/* Toggles */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
                    <span className="text-sm text-white font-medium">Litigation Flag</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="litigation_flag" checked={formData.litigation_flag} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#05070f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff2d9a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] peer-checked:shadow-[0_0_12px_rgba(255,45,154,0.6)] border border-white/10"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
                    <span className="text-sm text-white font-medium">Title Dispute</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="title_dispute_flag" checked={formData.title_dispute_flag} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#05070f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff2d9a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] peer-checked:shadow-[0_0_12px_rgba(255,45,154,0.6)] border border-white/10"></div>
                    </label>
                  </div>
                </div>

              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="mt-8 w-full py-4 rounded-xl font-bold text-white uppercase tracking-widest bg-gradient-to-r from-[#ff2d9a] to-[#4dd0ff] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,45,154,0.4)]"
              >
                {isLoading ? 'Running Prediction...' : 'Run Prediction'}
              </button>
            </div>

            {/* RIGHT COLUMN - Results */}
            <div className="flex flex-col gap-6">

              {/* Risk Output Panel */}
              <div className="bg-[#0a0e27]/90 border border-white/10 p-8 rounded-3xl shadow-xl flex-1 flex flex-col justify-center items-center relative overflow-hidden min-h-[250px]">
                {/* Background glow based on risk */}
                <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{
                  background: predictionResult ? `radial-gradient(circle at 50% 50%, ${predictionResult.risk_band === 'High' ? '#ff2d9a' : predictionResult.risk_band === 'Medium' ? '#f59e0b' : '#34f0b5'} 0%, transparent 70%)` : 'none'
                }}></div>

                {errorMsg ? (
                  <div className="text-[#ff2d9a] text-center border border-[#ff2d9a]/30 bg-[#ff2d9a]/10 p-4 rounded-xl relative z-10 w-full">
                    {errorMsg}
                  </div>
                ) : !predictionResult ? (
                  <div className="text-[#8b93b8] text-center relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-[#8b93b8]/30 rounded-full flex items-center justify-center font-bold">?</div>
                    Run a prediction to see the risk score
                  </div>
                ) : (
                  <div className="text-center relative z-10 w-full animate-in fade-in duration-500">
                    <div
                      className="text-6xl md:text-7xl font-black mb-4 tracking-tighter transition-colors duration-500"
                      style={{ color: predictionResult.risk_band === 'High' ? '#ff2d9a' : predictionResult.risk_band === 'Medium' ? '#f59e0b' : '#34f0b5' }}
                    >
                      {predictionResult.risk_pct.toFixed(1)}%
                    </div>

                    <div
                      className="inline-block px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border shadow-lg transition-colors duration-500"
                      style={{
                        color: predictionResult.risk_band === 'High' ? '#ff2d9a' : predictionResult.risk_band === 'Medium' ? '#f59e0b' : '#34f0b5',
                        borderColor: predictionResult.risk_band === 'High' ? 'rgba(255,45,154,0.3)' : predictionResult.risk_band === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(52,240,181,0.3)',
                        backgroundColor: predictionResult.risk_band === 'High' ? 'rgba(255,45,154,0.1)' : predictionResult.risk_band === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(52,240,181,0.1)'
                      }}
                    >
                      {predictionResult.risk_band} RISK
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[#f4f6fb] text-base md:text-lg bg-white/5 border border-white/10 rounded-xl py-3 px-6 mx-auto max-w-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4dd0ff]"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span>Estimated delay: <strong className="text-white">{predictionResult.estimated_delay_days} days</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Risk Drivers Panel */}
              <div className="bg-[#0a0e27]/90 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex-1 flex flex-col min-h-[250px]">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4dd0ff]"></span> Top Risk Drivers
                </h4>

                <div className="flex-1 flex flex-col justify-center">
                  {!predictionResult || errorMsg ? (
                    <div className="text-[#8b93b8] text-center text-sm opacity-50">
                      Drivers will appear here
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-500">
                      {predictionResult.top_drivers.map((driver, idx) => {
                        const isPositive = driver.impact >= 0;
                        const impactColor = isPositive ? '#ff2d9a' : '#4dd0ff';
                        // Normalize width for the chart (max absolute impact among top drivers)
                        const maxAbsImpact = Math.max(...predictionResult.top_drivers.map(d => Math.abs(d.impact)));
                        const widthPct = Math.max(5, (Math.abs(driver.impact) / maxAbsImpact) * 100);

                        return (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-medium uppercase tracking-wide">
                              <span className="text-white">{driver.feature.replace(/_/g, ' ')}</span>
                              <span style={{ color: impactColor }}>{isPositive ? '+' : ''}{driver.impact.toFixed(3)}</span>
                            </div>
                            {/* Bar container */}
                            <div className="w-full bg-[#05070f] rounded-full h-2.5 overflow-hidden border border-white/5 relative">
                              <div
                                className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${widthPct}%`,
                                  backgroundColor: impactColor,
                                  boxShadow: `0 0 10px ${impactColor}`
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Auto-Draft Notice Button */}
                  <button
                    onClick={() => setIsDrafterOpen(true)}
                    disabled={!predictionResult}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff2d9a]/10 to-[#4dd0ff]/10 border border-[#4dd0ff]/30 hover:border-[#4dd0ff]/60 text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 text-xs shadow-[0_0_15px_rgba(77,208,255,0.1)] hover:shadow-[0_0_20px_rgba(77,208,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4dd0ff] group-hover:scale-110 transition-transform"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H5"></path><path d="M14 20h-2"></path><path d="M17 18h-2"></path></svg>
                    Auto-Draft Notice
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — METHODOLOGY */}
      <section id="methodology" className="relative z-10 bg-[#05070f] pt-24 pb-32 px-4 md:px-12 border-t border-white/5 overflow-hidden">

        {/* Background Atmospheric Graphics */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="absolute w-[800px] h-[800px] rounded-full border border-[#34f0b5]/10 bg-[radial-gradient(circle_at_center,rgba(52,240,181,0.02)_0%,transparent_70%)]"></div>
          <div className="absolute w-[1200px] h-[1200px] rounded-full border border-[#4dd0ff]/5 bg-[radial-gradient(circle_at_center,rgba(77,208,255,0.01)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4dd0ff]/10 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center mb-20 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100">
            <span className="text-[#34f0b5] text-xs md:text-sm font-bold uppercase tracking-widest mb-4 block">How DrishtiPulse Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">From Land Data to Early Warning</h2>
            <p className="text-[#8b93b8] text-lg max-w-3xl mx-auto font-light">
              DrishtiPulse transforms acquisition data into explainable risk signals, actionable insights, and timely alerts.
            </p>
          </div>

          {/* 5-Stage Pipeline */}
          <div className="relative mb-24">

            {/* Desktop Horizontal Line Connector */}
            <div className="hidden lg:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#34f0b5]/20 via-[#4dd0ff]/40 to-[#34f0b5]/20 z-0">
              <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-transparent via-[#34f0b5] to-transparent animate-data-flow opacity-70"></div>
            </div>

            {/* Mobile Vertical Line Connector */}
            <div className="lg:hidden absolute top-[10%] bottom-[10%] left-[3.25rem] w-[2px] bg-gradient-to-b from-[#34f0b5]/20 via-[#4dd0ff]/40 to-[#34f0b5]/20 z-0">
              <div className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-transparent via-[#34f0b5] to-transparent animate-data-flow-vertical opacity-70"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">

              {/* Stage 1 */}
              <div className="flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 group reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-150 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1219]/90 backdrop-blur-md border border-[#34f0b5]/20 flex items-center justify-center shrink-0 group-hover:-translate-y-1 group-hover:border-[#34f0b5]/50 group-hover:shadow-[0_0_20px_rgba(52,240,181,0.2)] transition-all duration-300 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#34f0b5] group-hover:drop-shadow-[0_0_8px_rgba(52,240,181,0.8)] transition-all duration-300"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#34f0b5] shadow-[0_0_10px_#34f0b5] hidden lg:block"></div>
                </div>
                <div className="bg-[#0a1219]/65 backdrop-blur-md border border-[#34f0b5]/10 p-5 rounded-2xl text-left lg:text-center flex-1 lg:w-full group-hover:-translate-y-1 group-hover:border-[#34f0b5]/30 transition-all duration-300">
                  <span className="text-[10px] font-bold text-[#34f0b5] uppercase tracking-wider mb-2 block">Input</span>
                  <h4 className="text-white font-bold text-base mb-2">Data Sources</h4>
                  <p className="text-[#8b93b8] text-xs font-light leading-relaxed">LACRRIS, MoSPI, e-Courts, Parliament & project records</p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 group reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1219]/90 backdrop-blur-md border border-[#4dd0ff]/20 flex items-center justify-center shrink-0 group-hover:-translate-y-1 group-hover:border-[#4dd0ff]/50 group-hover:shadow-[0_0_20px_rgba(77,208,255,0.2)] transition-all duration-300 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4dd0ff] group-hover:drop-shadow-[0_0_8px_rgba(77,208,255,0.8)] transition-all duration-300"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4dd0ff] shadow-[0_0_10px_#4dd0ff] hidden lg:block"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4dd0ff] shadow-[0_0_10px_#4dd0ff] hidden lg:block"></div>
                </div>
                <div className="bg-[#0a1219]/65 backdrop-blur-md border border-[#4dd0ff]/10 p-5 rounded-2xl text-left lg:text-center flex-1 lg:w-full group-hover:-translate-y-1 group-hover:border-[#4dd0ff]/30 transition-all duration-300">
                  <span className="text-[10px] font-bold text-[#4dd0ff] uppercase tracking-wider mb-2 block">Process</span>
                  <h4 className="text-white font-bold text-base mb-2">Feature Engineering</h4>
                  <p className="text-[#8b93b8] text-xs font-light leading-relaxed">Consent %, litigation flags, compensation gaps, delay signals & project indicators</p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 group reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1219]/90 backdrop-blur-md border border-[#ff2d9a]/20 flex items-center justify-center shrink-0 group-hover:-translate-y-1 group-hover:border-[#ff2d9a]/50 group-hover:shadow-[0_0_20px_rgba(255,45,154,0.2)] transition-all duration-300 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff2d9a] group-hover:drop-shadow-[0_0_8px_rgba(255,45,154,0.8)] transition-all duration-300"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff2d9a] shadow-[0_0_10px_#ff2d9a] hidden lg:block"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff2d9a] shadow-[0_0_10px_#ff2d9a] hidden lg:block"></div>
                </div>
                <div className="bg-[#0a1219]/65 backdrop-blur-md border border-[#ff2d9a]/10 p-5 rounded-2xl text-left lg:text-center flex-1 lg:w-full group-hover:-translate-y-1 group-hover:border-[#ff2d9a]/30 transition-all duration-300">
                  <span className="text-[10px] font-bold text-[#ff2d9a] uppercase tracking-wider mb-2 block">Predict</span>
                  <h4 className="text-white font-bold text-base mb-2">AI Risk Engine</h4>
                  <p className="text-[#8b93b8] text-xs font-light leading-relaxed">Risk classification + regression + explainable AI (SHAP)</p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 group reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1219]/90 backdrop-blur-md border border-[#34f0b5]/20 flex items-center justify-center shrink-0 group-hover:-translate-y-1 group-hover:border-[#34f0b5]/50 group-hover:shadow-[0_0_20px_rgba(52,240,181,0.2)] transition-all duration-300 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#34f0b5] group-hover:drop-shadow-[0_0_8px_rgba(52,240,181,0.8)] transition-all duration-300"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#34f0b5] shadow-[0_0_10px_#34f0b5] hidden lg:block"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#34f0b5] shadow-[0_0_10px_#34f0b5] hidden lg:block"></div>
                </div>
                <div className="bg-[#0a1219]/65 backdrop-blur-md border border-[#34f0b5]/10 p-5 rounded-2xl text-left lg:text-center flex-1 lg:w-full group-hover:-translate-y-1 group-hover:border-[#34f0b5]/30 transition-all duration-300">
                  <span className="text-[10px] font-bold text-[#34f0b5] uppercase tracking-wider mb-2 block">Insight</span>
                  <h4 className="text-white font-bold text-base mb-2">Officer Dashboard</h4>
                  <p className="text-[#8b93b8] text-xs font-light leading-relaxed">Risk score, heatmaps, bottlenecks, chatbot & what-if simulation</p>
                </div>
              </div>

              {/* Stage 5 */}
              <div className="flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 group reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-500 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0a1219]/90 backdrop-blur-md border border-[#ff2d9a]/20 flex items-center justify-center shrink-0 group-hover:-translate-y-1 group-hover:border-[#ff2d9a]/50 group-hover:shadow-[0_0_20px_rgba(255,45,154,0.2)] transition-all duration-300 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff2d9a] group-hover:drop-shadow-[0_0_8px_rgba(255,45,154,0.8)] transition-all duration-300"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff2d9a] shadow-[0_0_10px_#ff2d9a] hidden lg:block"></div>
                </div>
                <div className="bg-[#0a1219]/65 backdrop-blur-md border border-[#ff2d9a]/10 p-5 rounded-2xl text-left lg:text-center flex-1 lg:w-full group-hover:-translate-y-1 group-hover:border-[#ff2d9a]/30 transition-all duration-300">
                  <span className="text-[10px] font-bold text-[#ff2d9a] uppercase tracking-wider mb-2 block">Act</span>
                  <h4 className="text-white font-bold text-base mb-2">Alerts & Actions</h4>
                  <p className="text-[#8b93b8] text-xs font-light leading-relaxed">Priority alerts, LLM-assisted notices & recommended interventions</p>
                </div>
              </div>

            </div>
          </div>

          {/* Secondary Loop Section */}
          <div className="text-center mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-700">
            <h3 className="text-xl font-bold text-white mb-8">One Intelligence Loop</h3>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold tracking-widest text-[#8b93b8]">
              <span className="text-[#34f0b5] px-4 py-2 rounded-full bg-[#34f0b5]/10 border border-[#34f0b5]/20 shadow-[0_0_15px_rgba(52,240,181,0.05)]">DATA</span>
              <span className="text-white/20">→</span>
              <span className="text-[#4dd0ff] px-4 py-2 rounded-full bg-[#4dd0ff]/10 border border-[#4dd0ff]/20 shadow-[0_0_15px_rgba(77,208,255,0.05)]">PREDICT</span>
              <span className="text-white/20">→</span>
              <span className="text-[#34f0b5] px-4 py-2 rounded-full bg-[#34f0b5]/10 border border-[#34f0b5]/20 shadow-[0_0_15px_rgba(52,240,181,0.05)]">EXPLAIN</span>
              <span className="text-white/20">→</span>
              <span className="text-[#ff2d9a] px-4 py-2 rounded-full bg-[#ff2d9a]/10 border border-[#ff2d9a]/20 shadow-[0_0_15px_rgba(255,45,154,0.05)]">ALERT</span>
              <span className="text-white/20">→</span>
              <span className="text-[#4dd0ff] px-4 py-2 rounded-full bg-[#4dd0ff]/10 border border-[#4dd0ff]/20 shadow-[0_0_15px_rgba(77,208,255,0.05)]">ACT</span>
              <span className="text-white/20">→</span>
              <span className="text-[#34f0b5] px-4 py-2 rounded-full bg-[#34f0b5]/10 border border-[#34f0b5]/20 shadow-[0_0_15px_rgba(52,240,181,0.05)]">FEEDBACK</span>
            </div>

            <p className="mt-8 text-[#8b93b8] text-sm md:text-base font-light italic max-w-lg mx-auto">
              "Every intervention creates better signals for the next prediction."
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="max-w-3xl mx-auto bg-[#0a1219]/90 border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-[800ms] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d9a]/5 via-transparent to-[#34f0b5]/5 opacity-50"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 relative z-10 leading-tight">
              See the risk. Understand the cause. <br className="hidden md:block" /> Act before the delay.
            </h3>
            <button className="relative z-10 px-8 py-4 rounded-full font-bold text-[#05070f] uppercase tracking-widest text-sm bg-gradient-to-r from-[#34f0b5] to-[#4dd0ff] hover:shadow-[0_0_20px_rgba(52,240,181,0.6)] transition-all duration-300 group">
              Explore Risk Intelligence <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 5 — AI INTELLIGENCE & ANALYSIS */}
      <section id="analysis" className="relative z-10 bg-[#05070f] pt-24 pb-32 px-4 md:px-12 border-t border-white/5 overflow-hidden">

        {/* Background Atmospheric Graphics */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <div className="absolute w-[1000px] h-[1000px] rounded-full border border-[#4dd0ff]/10 bg-[radial-gradient(circle_at_center,rgba(77,208,255,0.02)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Section 1: AI Intelligence Overview */}
          <div className="text-center mb-16 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <span className="text-[#34f0b5] text-xs md:text-sm font-bold uppercase tracking-widest mb-4 block">AI Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Where Are Land Acquisition Delays Coming From?</h2>
            <p className="text-[#8b93b8] text-lg max-w-3xl mx-auto font-light">
              DrishtiPulse analyzes acquisition-stage signals to identify where delays accumulate, which factors contribute most to risk, and where intervention may be required.
            </p>
          </div>

          {/* Section 2: Key Intelligence Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#34f0b5]/10 rounded-[20px] p-6 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 hover:border-[#34f0b5]/30 hover:shadow-[0_0_20px_rgba(52,240,181,0.1)] transition-all">
              <h5 className="text-[10px] text-[#8b93b8] font-bold tracking-widest uppercase mb-4">Avg. Acquisition Delay</h5>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-white">{overviewData?.avg_days_delay || '...'}</span>
                <span className="text-[#34f0b5] text-sm font-bold">days</span>
              </div>
              <p className="text-[10px] text-[#8b93b8] uppercase tracking-wide">Across analyzed cases</p>
            </div>

            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#ff2d9a]/10 rounded-[20px] p-6 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 hover:border-[#ff2d9a]/30 hover:shadow-[0_0_20px_rgba(255,45,154,0.1)] transition-all">
              <h5 className="text-[10px] text-[#8b93b8] font-bold tracking-widest uppercase mb-4">Cases At High Risk</h5>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-white">
                  {overviewData ? ((overviewData.risk_concentration?.High || 0) + (overviewData.risk_concentration?.Critical || 0)).toLocaleString() : '...'}
                </span>
              </div>
              <p className="text-[10px] text-[#8b93b8] uppercase tracking-wide">Current risk threshold</p>
            </div>

            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#4dd0ff]/10 rounded-[20px] p-6 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300 hover:border-[#4dd0ff]/30 hover:shadow-[0_0_20px_rgba(77,208,255,0.1)] transition-all">
              <h5 className="text-[10px] text-[#8b93b8] font-bold tracking-widest uppercase mb-4">Avg. Risk Score</h5>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-white">{overviewData?.avg_risk_score || '...'}</span>
                <span className="text-[#4dd0ff] text-xl font-bold">%</span>
              </div>
              <p className="text-[10px] text-[#8b93b8] uppercase tracking-wide">Across active cases</p>
            </div>

            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#a855f7]/10 rounded-[20px] p-6 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400 hover:border-[#a855f7]/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all">
              <h5 className="text-[10px] text-[#8b93b8] font-bold tracking-widest uppercase mb-4">Top Bottleneck</h5>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-xl md:text-2xl font-black text-white leading-tight px-2">{overviewData?.top_bottleneck || '...'}</span>
              </div>
              <p className="text-[10px] text-[#8b93b8] uppercase tracking-wide mt-1">Highest contribution to delay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

            {/* Section 3: State-wise Delay Risk */}
            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#34f0b5]/10 rounded-[22px] p-8 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-2">State-wise Acquisition Risk</h3>
              <p className="text-[#8b93b8] text-sm font-light mb-8">Average predicted delay risk across analyzed states.</p>

              <div className="space-y-5">
                {(overviewData?.state_wise_risk || []).map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-1.5">
                      <span className="text-white group-hover:text-[#34f0b5] transition-colors">{item.state}</span>
                      <span className="text-[#34f0b5]">{item.score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#05070f] rounded-full h-2 overflow-hidden border border-white/5 relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#34f0b5]/40 to-[#34f0b5] rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(52,240,181,0.8)]" style={{ width: `${item.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Case Volume / Risk Distribution */}
            <div className="bg-[#080f16]/70 backdrop-blur-md border border-[#4dd0ff]/10 rounded-[22px] p-8 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200 relative overflow-hidden flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Where Risk Is Concentrated</h3>
              <p className="text-[#8b93b8] text-sm font-light mb-8">Distribution of case volumes by risk severity.</p>

              <div className="flex-1 flex items-end justify-between gap-2 h-48 pb-4 border-b border-white/10 mt-auto">
                {[
                  { label: "Low", value: overviewData?.risk_concentration?.Low || 0, color: "#34f0b5" },
                  { label: "Medium", value: overviewData?.risk_concentration?.Medium || 0, color: "#4dd0ff" },
                  { label: "High", value: overviewData?.risk_concentration?.High || 0, color: "#a855f7" },
                  { label: "Critical", value: overviewData?.risk_concentration?.Critical || 0, color: "#ff2d9a" }
                ].map((bar, idx) => {
                  const maxVal = Math.max(
                    overviewData?.risk_concentration?.Low || 1,
                    overviewData?.risk_concentration?.Medium || 1,
                    overviewData?.risk_concentration?.High || 1,
                    overviewData?.risk_concentration?.Critical || 1
                  );
                  const height = `${Math.max((bar.value / maxVal) * 100, 5)}%`;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 w-1/4 group cursor-pointer h-full justify-end relative">
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">{bar.value}</span>
                      <div className="w-full max-w-[40px] rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-125" style={{ height, backgroundColor: bar.color, boxShadow: `0 0 15px ${bar.color}30` }}></div>
                      <span className="text-[10px] text-[#8b93b8] uppercase font-bold tracking-wider group-hover:text-white transition-colors">{bar.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-sm text-[#8b93b8] bg-white/5 p-4 rounded-xl border border-white/5 italic flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4dd0ff] shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>High and critical-risk cases represent <strong className="text-white">{overviewData?.high_critical_pct || 0}%</strong> of analyzed cases (n={overviewData?.total_cases?.toLocaleString() || 0}).</span>
              </div>
            </div>

          </div>

          {/* Section 5: Bottleneck Analysis */}
          <div className="bg-[#080f16]/90 border border-[#ff2d9a]/10 rounded-[24px] p-8 md:p-12 mb-24 shadow-2xl reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff2d9a]/5 to-transparent pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">What Is Actually Delaying Land Acquisition?</h3>
                <p className="text-[#8b93b8] text-base font-light">Model-derived contribution of major delay factors.</p>
              </div>
              <div className="mt-4 md:mt-0 text-left md:text-right">
                <span className="text-[9px] md:text-[10px] text-[#ff2d9a] border border-[#ff2d9a]/30 bg-[#ff2d9a]/10 px-3 py-1.5 rounded-full uppercase tracking-widest font-bold">Research-Based analysis</span>
                <p className="text-[9px] text-[#8b93b8] mt-2 italic">Not an official government statistic.</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { factor: "Court litigation", pct: 34, type: "legal" },
                { factor: "Compensation gap disputes", pct: 22, type: "legal" },
                { factor: "Police case / law & order", pct: 14, type: "legal" },
                { factor: "Title / ownership disputes", pct: 11, type: "legal" },
                { factor: "Pending approvals", pct: 9, type: "other" },
                { factor: "Low landowner consent", pct: 6, type: "other" },
                { factor: "Other factors", pct: 4, type: "other" }
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-xs md:text-sm font-bold uppercase tracking-wide mb-2">
                    <span className="text-white flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.type === 'legal' ? 'bg-[#ff2d9a]' : 'bg-[#a855f7]'}`}></span>
                      {item.factor}
                    </span>
                    <span className="text-white text-lg font-black">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-[#05070f] rounded-r-md h-5 overflow-hidden border border-white/5 relative">
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out`}
                      style={{
                        width: `${item.pct * 2.5}%`, // Scaled for visual fit (max 34 * 2.5 = 85%)
                        backgroundColor: item.type === 'legal' ? '#ff2d9a' : '#a855f7',
                        boxShadow: `0 0 15px ${item.type === 'legal' ? 'rgba(255,45,154,0.6)' : 'rgba(168,85,247,0.6)'}`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-6 items-center justify-center text-xs font-bold tracking-widest uppercase text-[#8b93b8]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#ff2d9a]"></span> Procedural / Legal Bottlenecks
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#a855f7]"></span> Other Project Factors
              </div>
            </div>
          </div>

          {/* Section 6 & 7: Evidence / Accountability Layer */}
          <div className="mb-24 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <div className="text-center mb-12">
              <span className="text-[#4dd0ff] text-xs md:text-sm font-bold uppercase tracking-widest mb-4 block">Evidence-Based Bottlenecks</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Which Delays Are Process-Controlled?</h2>
              <p className="text-[#8b93b8] text-lg max-w-2xl mx-auto font-light">
                Separate model signals from documented audit evidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

              <div className="bg-[#080f16]/70 backdrop-blur-md border border-white/10 rounded-[20px] p-8 text-center relative overflow-hidden group hover:border-[#4dd0ff]/30 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4dd0ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 mx-auto mb-6 bg-[#4dd0ff]/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4dd0ff]"><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                </div>
                <span className="inline-block mb-4 text-[9px] text-[#4dd0ff] border border-[#4dd0ff]/30 bg-[#4dd0ff]/10 px-2 py-1 rounded uppercase tracking-widest font-bold">AI Analysis</span>
                <h4 className="text-lg font-bold text-white mb-3">Model Signal</h4>
                <p className="text-[#8b93b8] text-sm leading-relaxed">DrishtiPulse identifies recurring delay factors from acquisition and project records.</p>
              </div>

              <div className="bg-[#080f16]/70 backdrop-blur-md border border-white/10 rounded-[20px] p-8 text-center relative overflow-hidden group hover:border-[#34f0b5]/30 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#34f0b5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 mx-auto mb-6 bg-[#34f0b5]/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#34f0b5]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <span className="inline-block mb-4 text-[9px] text-[#34f0b5] border border-[#34f0b5]/30 bg-[#34f0b5]/10 px-2 py-1 rounded uppercase tracking-widest font-bold">Verified Source</span>
                <h4 className="text-lg font-bold text-white mb-3">Documented Evidence</h4>
                <p className="text-[#8b93b8] text-sm leading-relaxed">Audited records can be linked to specific delays in acquisition, approvals, awards, clearances and inter-department coordination.</p>
              </div>

              <div className="bg-[#080f16]/70 backdrop-blur-md border border-white/10 rounded-[20px] p-8 text-center relative overflow-hidden group hover:border-[#ff2d9a]/30 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ff2d9a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 mx-auto mb-6 bg-[#ff2d9a]/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff2d9a]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle></svg>
                </div>
                <span className="inline-block mb-4 text-[9px] text-[#ff2d9a] border border-[#ff2d9a]/30 bg-[#ff2d9a]/10 px-2 py-1 rounded uppercase tracking-widest font-bold">Actionable</span>
                <h4 className="text-lg font-bold text-white mb-3">Officer Action</h4>
                <p className="text-[#8b93b8] text-sm leading-relaxed">Convert the identified bottleneck into a responsible-office alert and intervention.</p>
              </div>

            </div>

            {/* Evidence Timeline */}
            <div className="bg-[#080f16]/70 backdrop-blur-md border border-white/10 rounded-[24px] p-8 md:p-10">
              <h3 className="text-2xl font-bold text-white mb-2">Documented Delay Evidence</h3>
              <p className="text-[#8b93b8] text-sm font-light mb-10">Examples from official audit and government records.</p>

              <div className="space-y-6">
                {[
                  { source: "CAG Audit Report", date: "2021-22", project: "Highway Expansion Sector 4", factor: "Delays in finalising land awards", impact: "24-month delay in possession", type: "gov" },
                  { source: "Departmental Review", date: "2023", project: "Irrigation Canal Network", factor: "Inter-department coordination issues", impact: "Forest clearance pending 14 months", type: "gov" },
                  { source: "High Court Records", date: "2020-23", project: "Industrial Corridor Zone B", factor: "Land ownership disputes", impact: "Stay order placed on 45 hectares", type: "ext" }
                ].map((ev, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 items-start bg-white/5 p-5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="shrink-0 w-32">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">{ev.source}</span>
                      <span className="text-xs text-[#8b93b8]">{ev.date}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">{ev.project}</h4>
                      <p className="text-[#34f0b5] text-xs font-bold uppercase tracking-wider mb-2">{ev.factor}</p>
                      <p className="text-[#8b93b8] text-sm">{ev.impact}</p>
                    </div>
                    <div className="shrink-0 mt-2 md:mt-0">
                      <span className={`text-[9px] px-2 py-1 rounded uppercase tracking-widest font-bold border ${ev.type === 'gov' ? 'text-[#ff2d9a] border-[#ff2d9a]/30 bg-[#ff2d9a]/10' : 'text-[#4dd0ff] border-[#4dd0ff]/30 bg-[#4dd0ff]/10'}`}>
                        {ev.type === 'gov' ? 'Process-Controlled' : 'External Factor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>



          {/* Section 10: AI Insight Panel */}
          <div className="bg-gradient-to-br from-[#34f0b5]/10 via-[#080f16]/90 to-[#4dd0ff]/10 border border-[#34f0b5]/20 rounded-[24px] p-8 md:p-12 mb-8 shadow-2xl reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#34f0b5] shadow-[0_0_10px_#34f0b5]"></span>
              DrishtiPulse Intelligence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <span className="text-[#34f0b5] font-black text-3xl opacity-30 block mb-2">01</span>
                <p className="text-white text-base leading-relaxed">Litigation is the dominant delay signal in the analyzed sample.</p>
              </div>
              <div>
                <span className="text-[#4dd0ff] font-black text-3xl opacity-30 block mb-2">02</span>
                <p className="text-white text-base leading-relaxed">Cases with unresolved compensation issues show elevated predicted risk.</p>
              </div>
              <div>
                <span className="text-[#ff2d9a] font-black text-3xl opacity-30 block mb-2">03</span>
                <p className="text-white text-base leading-relaxed">Early intervention at the approval stage can prioritize cases before delays compound.</p>
              </div>
            </div>
          </div>

          {/* Section 11: Evidence Legend */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#8b93b8] reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out delay-100 pb-12">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4dd0ff]"></span> AI-derived</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#34f0b5]"></span> Dataset-derived</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff2d9a]"></span> Official-source evidence</div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — HEATMAP */}
      <section id="heatmap" className="relative z-10 bg-[#05070f] pt-24 pb-32 px-4 md:px-12 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <span className="text-[#34f0b5] text-xs md:text-sm font-bold uppercase tracking-widest mb-4 block">National Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">State-level Risk Heatmap</h2>
            <p className="text-[#8b93b8] text-lg max-w-3xl mx-auto font-light">
              Interactive visualization of land acquisition delays and active bottlenecks across India.
            </p>
          </div>

          <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out">
            <RiskHeatmap />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer onActionClick={() => setIsDrafterOpen(true)} />

      {/* MODALS */}
      <AIActionDrafter
        isOpen={isDrafterOpen}
        onClose={() => setIsDrafterOpen(false)}
        targetDepartment={predictionResult ? (predictionResult.top_drivers[0]?.feature.includes("litigation") || predictionResult.top_drivers[0]?.feature.includes("dispute") ? "Ministry of Law & Justice / State Legal Dept" : "Ministry of Environment, Forest and Climate Change") : "Relevant Department"}
        caseId={formData.case_id}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
