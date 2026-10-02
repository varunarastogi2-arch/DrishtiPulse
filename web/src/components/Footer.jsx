import React from 'react';

const Footer = ({ onActionClick }) => {
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#05070f] pt-16 pb-8 border-t border-white/5 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out z-10 overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff2d9a] via-50% to-[#4dd0ff] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DrishtiPulse Logo" className="h-8 mix-blend-screen" loading="lazy" decoding="async" />
              <span className="text-xl font-bold tracking-tight text-white">DrishtiPulse</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              AI early-warning system for land acquisition delays
            </p>
            <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#4dd0ff]">
              Prototype · Synthetic data
            </div>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Explore</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToId('risk')} className="text-slate-400 hover:text-[#4dd0ff] transition-colors text-sm">Dashboard</button>
              </li>
              <li>
                <button onClick={() => scrollToId('analysis')} className="text-slate-400 hover:text-[#4dd0ff] transition-colors text-sm">Analysis</button>
              </li>
              <li>
                <button onClick={() => scrollToId('heatmap')} className="text-slate-400 hover:text-[#4dd0ff] transition-colors text-sm">Heatmap</button>
              </li>
              <li>
                <button onClick={onActionClick} className="text-slate-400 hover:text-[#4dd0ff] transition-colors text-sm">Action</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Built with */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Vite', 'FastAPI', 'XGBoost', 'SHAP', 'PostgreSQL'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Col 4: Reference sources */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Reference Sources</h4>
            <ul className="space-y-2 mb-4">
              {['PRAGATI', 'LACRRIS (Dept of Land Resources)', 'MoSPI', 'e-Courts'].map(source => (
                <li key={source} className="text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-[#34f0b5] mt-1 text-[10px]">▶</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 italic border-t border-white/5 pt-3">
              Reference sources the system is designed around
            </p>
          </div>
        </div>

        {/* Middle Strip */}
        <div className="w-full border-t border-b border-white/5 py-4 mb-8 text-center text-xs text-slate-400 font-mono tracking-tight flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
          <span>Smart India Hackathon 2026</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>Problem Statement SIH26017</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>Theme: Smart Automation</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>Category: Software</span>
        </div>

        {/* Disclaimer */}
        <div className="text-center mb-8">
          <p className="text-xs text-slate-500 max-w-3xl mx-auto px-4 leading-relaxed">
            Built on research of public land acquisition sources such as PRAGATI and LACRRIS. Real case records are legally sensitive and access-restricted, so this prototype uses a synthetic dataset modelled on those findings. Risk scores are decision-support aids, not legal determinations.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-400">
            © 2026 CodeCrafterz · DrishtiPulse
          </p>
          <button 
            onClick={scrollToTop}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-2 transition-colors group"
          >
            Back to top
            <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4dd0ff]/20 group-hover:text-[#4dd0ff] transition-colors border border-white/10">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
