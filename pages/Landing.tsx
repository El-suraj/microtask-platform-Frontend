
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { Rocket, Mail, Phone, Linkedin, Twitter, Github, Zap, ShieldCheck, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Landing = () => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleBtnMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btnRef.current.style.setProperty('--x', `${x}`);
    btnRef.current.style.setProperty('--y', `${y}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-primary-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Logo className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Sign In</Link>
            <Link to="/register">
                <Button className="bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center mb-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide border rounded-full px-3 py-1 text-primary-700 bg-primary-50 border-primary-100 font-semibold">
              <Rocket size={14} className="text-primary-600" />
              Start Your Financial Transformation
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-100 fade-in">
            Earn Money Completing <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-emerald-500">
              Simple Digital Tasks
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 animate-in slide-in-from-bottom-6 duration-700 delay-200 fade-in">
            Join thousands of African youth earning daily. Download apps, take surveys, and share content to get paid instantly via Bank Transfer or Crypto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-6 duration-700 delay-300 fade-in">
             <Link to="/register">
                <button 
                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-primary-600 px-8 font-medium text-white transition-all duration-300 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/20"
                >
                    <span className="mr-2">Start Earning Now</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
             </Link>
             <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 px-4 py-2">
                Log In to Account
             </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Why Choose DCTV Earn?</h2>
                <p className="text-slate-500 mt-4 max-w-2xl mx-auto">We connect ambitious workers with top brands looking for engagement.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: <Zap className="text-primary-600" />, title: "Instant Access", desc: "No interviews. Sign up and start working immediately on available tasks." },
                    { icon: <ShieldCheck className="text-emerald-600" />, title: "Secure Payments", desc: "Withdraw your earnings directly to your local bank account or crypto wallet." },
                    { icon: <Globe className="text-blue-600" />, title: "Work Anywhere", desc: "100% remote. All you need is a smartphone and internet connection." }
                ].map((f, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 text-2xl">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                        <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <Logo className="h-10 w-auto" variant="white" />
                    </div>
                    <p className="text-slate-400 max-w-sm mb-6">
                        Empowering African youth through technology and digital opportunities.
                    </p>
                    <div className="flex gap-4 text-slate-400">
                        <Linkedin className="hover:text-white cursor-pointer transition" />
                        <Twitter className="hover:text-white cursor-pointer transition" />
                        <Github className="hover:text-white cursor-pointer transition" />
                    </div>
                </div>
                
                <div>
                    <h4 className="font-bold mb-4">Platform</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-white transition">Browse Tasks</a></li>
                        <li><a href="#" className="hover:text-white transition">For Employers</a></li>
                        <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Support</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                        <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <span>© 2025 Decipher Tech Vision Africa. All rights reserved.</span>
                <span>Designed for Growth</span>
            </div>
        </div>
      </footer>
    </div>
  );
};
