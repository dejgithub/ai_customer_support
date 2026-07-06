'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

const features = [
  { icon: '🤖', title: 'AI Support 24/7', desc: 'Never miss a customer inquiry. Our AI handles support round the clock with human-like accuracy.' },
  { icon: '🌍', title: 'Multi-Language', desc: 'Speak your customers\' language. Supports English, Amharic, Oromo, and more.' },
  { icon: '📚', title: 'Smart Knowledge Base', desc: 'Upload your business documents and the AI learns your products, policies, and services instantly.' },
  { icon: '📅', title: 'Appointment Booking', desc: 'Let customers book appointments naturally through conversation. Syncs with your calendar.' },
  { icon: '📦', title: 'Order Management', desc: 'Track orders, process returns, and send updates — all through the chat interface.' },
  { icon: '📱', title: 'Multi-Channel', desc: 'Meet customers where they are — web widget, WhatsApp, Telegram, Messenger, and more.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Understand your support performance with beautiful charts, trends, and actionable insights.' },
  { icon: '🔌', title: 'Easy Integration', desc: 'Embed our widget with a single script tag. No complex setup required.' },
];

const steps = [
  { num: '01', title: 'Connect', desc: 'Create your account and connect your business in under 2 minutes.' },
  { num: '02', title: 'Train', desc: 'Upload your documents, set your preferences, and let AI learn your business.' },
  { num: '03', title: 'Go Live', desc: 'Embed the chat widget on your website and start automating support.' },
];

const plans = [
  { name: 'Free', price: '$0', period: 'forever', features: ['Up to 100 conversations/mo', 'Basic AI responses', 'Single channel', 'Email support'], cta: 'Get Started', popular: false },
  { name: 'Starter', price: '$29', period: '/month', features: ['Up to 1,000 conversations/mo', 'Advanced AI with knowledge base', '2 channels', 'Chat & email support', 'Basic analytics'], cta: 'Start Free Trial', popular: true },
  { name: 'Business', price: '$99', period: '/month', features: ['Up to 10,000 conversations/mo', 'Full AI customization', 'All channels', 'Priority support', 'Advanced analytics', 'Team accounts'], cta: 'Start Free Trial', popular: false },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited conversations', 'Dedicated AI model', 'Custom integrations', 'SLA guarantee', 'Dedicated account manager', 'On-premise option'], cta: 'Contact Sales', popular: false },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="font-bold text-xl text-gray-900">SmartSupport AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary">Dashboard</Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-gray-600 hover:text-primary-600 transition-colors">Sign In</Link>
                  <Link href="/register" className="btn-primary">Get Started</Link>
                </div>
              )}
            </nav>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              {isAuthenticated ? (
                <Link href="/dashboard" className="block px-3 py-2 text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link href="/register" className="block px-3 py-2 text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-50 to-transparent opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              AI-Powered Customer Support
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              AI-Powered Customer Support<br />
              <span className="text-primary-600">For Your Small Business</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Automate customer support with Gemini AI. Handle inquiries, bookings, orders, and more — 24/7, in multiple languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-3">Get Started Free</Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-3">Live Demo</a>
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div><div className="text-3xl font-bold text-gray-900">10K+</div><div className="text-sm text-gray-500">Businesses</div></div>
              <div><div className="text-3xl font-bold text-gray-900">1M+</div><div className="text-sm text-gray-500">Conversations</div></div>
              <div><div className="text-3xl font-bold text-gray-900">98%</div><div className="text-sm text-gray-500">Satisfaction</div></div>
              <div><div className="text-3xl font-bold text-gray-900">24/7</div><div className="text-sm text-gray-500">Support</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Powerful features designed to help small businesses deliver enterprise-grade customer support.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-lg text-gray-600">From setup to live — faster than you think.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">{s.num}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <div key={i} className={`bg-white rounded-xl p-6 border ${p.popular ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'} shadow-sm relative`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
                <div className="mb-4"><span className="text-3xl font-bold text-gray-900">{p.price}</span><span className="text-gray-500 ml-1">{p.period}</span></div>
                <ul className="space-y-3 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-medium transition-colors ${p.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div><span className="font-bold text-xl text-white">SmartSupport AI</span></div>
              <p className="text-sm">AI-powered customer support platform for small businesses.</p>
            </div>
            <div><h4 className="font-semibold text-white mb-4">Product</h4><div className="space-y-2 text-sm"><p>Features</p><p>Pricing</p><p>Integrations</p><p>API</p></div></div>
            <div><h4 className="font-semibold text-white mb-4">Company</h4><div className="space-y-2 text-sm"><p>About</p><p>Blog</p><p>Careers</p><p>Contact</p></div></div>
            <div><h4 className="font-semibold text-white mb-4">Support</h4><div className="space-y-2 text-sm"><p>Documentation</p><p>Status</p><p>Privacy</p><p>Terms</p></div></div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">© 2026 SmartSupport AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
