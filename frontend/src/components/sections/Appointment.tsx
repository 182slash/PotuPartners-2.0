'use client';

import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { MessageCircle, Phone } from 'lucide-react';

const PRACTICE_AREAS = [
  'Corporate & Business Law',
  'Mergers & Acquisitions',
  'Immigration & International Law',
  'Litigation / Dispute Resolution',
  'Real Estate & Construction',
  'Intellectual Property Rights Law',
  'Banking & Finance Law',
  'Other',
];

export default function AppointmentSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: formRef, visible: formV } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  const [form, setForm] = useState({
    fullName:     '',
    email:        '',
    phone:        '',
    date:         '',
    practiceArea: '',
    message:      '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.practiceArea) return;
    setLoading(true);
    // Simulate submission — replace with real API call if needed
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="appointment" className="py-32 md:py-44 bg-surface relative overflow-hidden">
      <div className="absolute right-0 top-0 section-number">VII</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              07 — Appointment
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Begin your <span className="italic text-gold">consultation.</span>
          </h2>
          <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-lg leading-relaxed">
            Schedule a confidential consultation with one of our partners. We will respond within one business day.
          </p>
        </div>

        <div
          ref={formRef}
          className={`reveal ${formV ? 'visible' : ''} grid grid-cols-1 md:grid-cols-2 gap-16`}
        >
          {/* Left — contact options */}
          <div className="space-y-8">

            {/* WhatsApp */}
            <div className="border border-divider p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-gold-faint flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={14} className="text-gold" />
                </div>
                <h3 className="font-serif text-base font-light text-text-primary">WhatsApp</h3>
              </div>
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
                Prefer to chat directly? Reach us instantly on WhatsApp for a faster response.
              </p>
              <a
                href="https://wa.me/6281216723060"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex px-6"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Phone */}
            <div className="border border-divider p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-gold-faint flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-gold" />
                </div>
                <h3 className="font-serif text-base font-light text-text-primary">Phone</h3>
              </div>
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
                Available Monday – Friday, 08:30 – 18:00
              </p>
              <p className="font-sans text-xs text-text-muted font-light leading-relaxed">
                Consultations outside regular office hours are available by appointment
              </p>
              <a
                href="tel:+6281216723060"
                className="font-sans text-sm text-gold hover:text-gold-light transition-colors"
              >
                +62 (812) 1672-3060
              </a>
            </div>
          </div>

          {/* Right — form */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center border border-divider p-12 text-center space-y-4">
              <div className="w-10 h-px bg-gold opacity-60 mx-auto" />
              <h3 className="font-serif text-xl font-light text-text-primary">Request Received</h3>
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed max-w-xs">
                Thank you. One of our partners will reach out within one business day.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="input-gold w-full"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Email <span className="text-gold">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-gold w-full"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-gold w-full"
                  placeholder="+62 ..."
                  required
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input-gold w-full"
                />
              </div>

              {/* Practice Area */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Practice Area <span className="text-gold">*</span>
                </label>
                <select
                  name="practiceArea"
                  value={form.practiceArea}
                  onChange={handleChange}
                  className="input-gold w-full"
                  required
                >
                  <option value="">Select a practice area</option>
                  {PRACTICE_AREAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[0.65rem] tracking-[0.1em] uppercase text-text-muted mb-1.5 font-sans">
                  Message / Description
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="input-gold w-full resize-none"
                  placeholder="Briefly describe your matter..."
                />
              </div>

              <p className="font-sans text-xs text-text-muted font-light">
                All consultations are strictly confidential.
              </p>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`btn-gold btn-gold-fill w-full justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span>{loading ? 'Sending…' : 'Send Request'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}