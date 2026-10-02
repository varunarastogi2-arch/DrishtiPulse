import React, { useState } from 'react';
import { X, UserCheck, Briefcase, Landmark, ArrowLeft, KeyRound } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [step, setStep] = useState('role-selection'); // 'role-selection' | 'credentials'
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('credentials');
  };

  const handleBack = () => {
    setStep('role-selection');
    setSelectedRole(null);
    setCredentials({ id: '', password: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoggingIn(false);
      onClose();
      // Reset state for next open
      setTimeout(() => {
        setStep('role-selection');
        setSelectedRole(null);
        setCredentials({ id: '', password: '' });
      }, 300);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0e27] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4dd0ff] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            {step === 'credentials' && (
              <button onClick={handleBack} className="text-[#8b93b8] hover:text-white transition-colors mr-2">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Operator Portal</h3>
              <p className="text-xs text-[#8b93b8]">DrishtiPulse Secure Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b93b8] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10 min-h-[320px] flex flex-col justify-center">
          {step === 'role-selection' ? (
            <div className="flex flex-col gap-4 animate-in slide-in-from-left-4 duration-300">
              <p className="text-sm text-[#8b93b8] mb-2 text-center">Select your authorization level</p>
              
              <button 
                onClick={() => handleRoleSelect('Land Acquisition Officer (LAO)')}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-[#34f0b5]/10 border border-white/10 hover:border-[#34f0b5]/50 rounded-xl transition-all duration-300 group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#05070f] flex items-center justify-center border border-white/10 group-hover:border-[#34f0b5]/30 group-hover:shadow-[0_0_15px_rgba(52,240,181,0.2)]">
                  <UserCheck size={18} className="text-[#34f0b5]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-[#34f0b5] transition-colors">Land Acquisition Officer (LAO)</h4>
                  <p className="text-[#8b93b8] text-xs">Manage field operations & compensation</p>
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('Line Department Official')}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-[#ff2d9a]/10 border border-white/10 hover:border-[#ff2d9a]/50 rounded-xl transition-all duration-300 group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#05070f] flex items-center justify-center border border-white/10 group-hover:border-[#ff2d9a]/30 group-hover:shadow-[0_0_15px_rgba(255,45,154,0.2)]">
                  <Landmark size={18} className="text-[#ff2d9a]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-[#ff2d9a] transition-colors">Line Department Official</h4>
                  <p className="text-[#8b93b8] text-xs">Clearances, NOCs, & compliance</p>
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('Project Director')}
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-[#4dd0ff]/10 border border-white/10 hover:border-[#4dd0ff]/50 rounded-xl transition-all duration-300 group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#05070f] flex items-center justify-center border border-white/10 group-hover:border-[#4dd0ff]/30 group-hover:shadow-[0_0_15px_rgba(77,208,255,0.2)]">
                  <Briefcase size={18} className="text-[#4dd0ff]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-[#4dd0ff] transition-colors">Project Director</h4>
                  <p className="text-[#8b93b8] text-xs">High-level oversight & interventions</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col animate-in slide-in-from-right-4 duration-300 h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-3">
                  <KeyRound size={20} className="text-[#4dd0ff]" />
                </div>
                <h4 className="text-white font-semibold text-lg">{selectedRole}</h4>
                <p className="text-[#8b93b8] text-xs mt-1">Enter your government credentials</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 flex-1">
                <div>
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider block mb-1.5">Official ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. EMP-10492"
                    value={credentials.id}
                    onChange={(e) => setCredentials({...credentials, id: e.target.value})}
                    className="w-full bg-[#05070f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4dd0ff] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-[#8b93b8] uppercase tracking-wider block mb-1.5">Password / Secure PIN</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full bg-[#05070f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4dd0ff] transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoggingIn || !credentials.id || !credentials.password}
                  className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white uppercase tracking-widest bg-gradient-to-r from-[#ff2d9a] to-[#4dd0ff] shadow-[0_0_20px_rgba(77,208,255,0.3)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Authenticating...
                    </span>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
