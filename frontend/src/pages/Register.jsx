import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Plus, X, Loader2, User, Building2, LayoutGrid } from 'lucide-react';
import { createMentor, createCompany, createProgramme } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';

// ── Palette ────────────────────────────────────────────────────────
const ORANGE = '#FF6A00';
const GOLDEN = '#FFD700';
const BEIGE  = '#F0ECDA';
const SF     = '#487F86';
const HB     = '#134C65';
const AQ     = '#00CED1';
const MUTED  = 'rgba(240,236,218,0.50)';

// ── Tag Input ──────────────────────────────────────────────────────
const TagInput = ({ label, tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const remove = (t) => onChange(tags.filter(x => x !== t));

  return (
    <div>
      <label className="block text-[10px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: SF }}>
        {label}
      </label>
      <div
        className="flex flex-wrap gap-2 p-3 min-h-[48px]"
        style={{ border: `1px solid rgba(72,127,134,0.35)`, background: 'rgba(14,30,47,0.60)' }}
      >
        {tags.map(t => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono"
            style={{ background: `${SF}22`, color: AQ, border: `1px solid ${AQ}55` }}
          >
            {t}
            <button onClick={() => remove(t)} className="ml-1 hover:opacity-60">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          placeholder={tags.length === 0 ? placeholder : '+ add more'}
          className="flex-1 min-w-[120px] bg-transparent text-[12px] font-mono outline-none placeholder-opacity-30"
          style={{ color: BEIGE, caretColor: AQ }}
        />
      </div>
      <p className="text-[9px] mt-1 font-mono" style={{ color: MUTED }}>Press Enter or comma to add</p>
    </div>
  );
};

// ── Text Field ─────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', multiline = false }) => (
  <div>
    <label className="block text-[10px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: SF }}>
      {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 text-[13px] font-mono resize-none outline-none transition-colors"
        style={{
          background: 'rgba(14,30,47,0.60)',
          border: `1px solid rgba(72,127,134,0.35)`,
          color: BEIGE,
          caretColor: AQ,
        }}
        onFocus={e => e.target.style.borderColor = `${AQ}88`}
        onBlur={e  => e.target.style.borderColor = 'rgba(72,127,134,0.35)'}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-[13px] font-mono outline-none transition-colors"
        style={{
          background: 'rgba(14,30,47,0.60)',
          border: `1px solid rgba(72,127,134,0.35)`,
          color: BEIGE,
          caretColor: AQ,
        }}
        onFocus={e => e.target.style.borderColor = `${AQ}88`}
        onBlur={e  => e.target.style.borderColor = 'rgba(72,127,134,0.35)'}
      />
    )}
  </div>
);

// ── Select Field ───────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: SF }}>
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 text-[13px] font-mono outline-none transition-colors appearance-none"
      style={{
        background: 'rgba(14,30,47,0.60)',
        border: `1px solid rgba(72,127,134,0.35)`,
        color: value ? BEIGE : MUTED,
      }}
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Success Toast ──────────────────────────────────────────────────
const Toast = ({ type, message, id }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-start gap-3 p-4 mb-4"
    style={{
      border: `1px solid ${type === 'success' ? `${AQ}55` : '#FF606055'}`,
      background: type === 'success' ? `${AQ}10` : '#FF606010',
    }}
  >
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: AQ }} />
      : <AlertCircle  className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF6060' }} />
    }
    <div>
      <p className="text-[12px] font-mono" style={{ color: type === 'success' ? AQ : '#FF6060' }}>
        {message}
      </p>
      {type === 'success' && id && (
        <p className="text-[10px] font-mono mt-1" style={{ color: MUTED }}>
          ID: <span style={{ color: GOLDEN }}>{id}</span>
        </p>
      )}
    </div>
  </motion.div>
);

// ── Mentor Form ────────────────────────────────────────────────────
const MentorForm = () => {
  const init = { name: '', expertise: [], sectors: [], region: '', stage_pref: '', bio: '' };
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setToast({ type: 'error', message: 'Name is required.' });
    setLoading(true); setToast(null);
    try {
      const res = await createMentor({ profile: form });
      setToast({ type: 'success', message: `Mentor "${form.name}" registered successfully!`, id: res.id });
      setForm(init);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full Name *"  value={form.name}       onChange={set('name')}       placeholder="e.g. Ahmad Razif" />
        <Field label="Region"       value={form.region}     onChange={set('region')}     placeholder="e.g. Kuala Lumpur" />
      </div>
      <SelectField label="Stage Preference" value={form.stage_pref} onChange={set('stage_pref')}
        options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']} />
      <TagInput label="Areas of Expertise" tags={form.expertise} onChange={set('expertise')} placeholder="e.g. Product Strategy" />
      <TagInput label="Sectors"            tags={form.sectors}   onChange={set('sectors')}   placeholder="e.g. FinTech" />
      <Field label="Bio" value={form.bio} onChange={set('bio')} placeholder="Short bio about this mentor…" multiline />
      <SubmitBtn loading={loading} onClick={handleSubmit} label="Register Mentor" />
    </div>
  );
};

// ── Company Form ───────────────────────────────────────────────────
const CompanyForm = () => {
  const init = { name: '', stage: '', sector: '', needs: [], region: '', founding_year: '' };
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setToast({ type: 'error', message: 'Company name is required.' });
    setLoading(true); setToast(null);
    try {
      const payload = { ...form, founding_year: form.founding_year ? parseInt(form.founding_year) : null };
      const res = await createCompany({ profile: payload });
      setToast({ type: 'success', message: `Company "${form.name}" registered!`, id: res.id });
      setForm(init);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Company Name *" value={form.name}   onChange={set('name')}   placeholder="e.g. DataCo KL" />
        <Field label="Region"         value={form.region} onChange={set('region')} placeholder="e.g. Kuala Lumpur" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField label="Stage" value={form.stage} onChange={set('stage')}
          options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']} />
        <Field label="Sector" value={form.sector} onChange={set('sector')} placeholder="e.g. Data Analytics" />
      </div>
      <Field label="Founding Year" value={form.founding_year} onChange={set('founding_year')} placeholder="e.g. 2022" type="number" />
      <TagInput label="Mentorship Needs" tags={form.needs} onChange={set('needs')} placeholder="e.g. GTM Strategy" />
      <SubmitBtn loading={loading} onClick={handleSubmit} label="Register Company" />
    </div>
  );
};

// ── Programme Form ─────────────────────────────────────────────────
const ProgrammeForm = () => {
  const init = {
    name: '', cohort_size: '10', region: '', sector_focus: [],
    criteria: { sector_focus: [], stage_required: '', region: '', expertise_needed: [] },
  };
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setCriteria = (k) => (v) => setForm(f => ({ ...f, criteria: { ...f.criteria, [k]: v } }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return setToast({ type: 'error', message: 'Programme name is required.' });
    setLoading(true); setToast(null);
    try {
      const payload = {
        name: form.name,
        cohort_size: parseInt(form.cohort_size) || 10,
        sector_focus: form.sector_focus,
        region: form.region,
        criteria: form.criteria,
      };
      const res = await createProgramme({ profile: payload });
      setToast({ type: 'success', message: `Programme "${form.name}" created!`, id: res.id });
      setForm(init);
    } catch (e) {
      setToast({ type: 'error', message: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Programme Name *" value={form.name}        onChange={set('name')}        placeholder="e.g. SEA Tech Accelerator 2025" />
        <Field label="Region"           value={form.region}      onChange={set('region')}      placeholder="e.g. Malaysia" />
      </div>
      <Field label="Cohort Size" value={form.cohort_size} onChange={set('cohort_size')} type="number" placeholder="10" />
      <TagInput label="Sector Focus" tags={form.sector_focus} onChange={set('sector_focus')} placeholder="e.g. FinTech" />

      {/* Criteria sub-section */}
      <div className="pt-4" style={{ borderTop: `1px solid rgba(72,127,134,0.20)` }}>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-4" style={{ color: GOLDEN }}>
          Matching Criteria
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField label="Stage Required" value={form.criteria.stage_required} onChange={setCriteria('stage_required')}
              options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth']} />
            <Field label="Criteria Region" value={form.criteria.region} onChange={setCriteria('region')} placeholder="e.g. Malaysia" />
          </div>
          <TagInput label="Expertise Needed"   tags={form.criteria.expertise_needed} onChange={setCriteria('expertise_needed')} placeholder="e.g. Fundraising" />
          <TagInput label="Criteria Sectors"   tags={form.criteria.sector_focus}     onChange={setCriteria('sector_focus')}     placeholder="e.g. HealthTech" />
        </div>
      </div>
      <SubmitBtn loading={loading} onClick={handleSubmit} label="Create Programme" />
    </div>
  );
};

// ── Submit Button ──────────────────────────────────────────────────
const SubmitBtn = ({ loading, onClick, label }) => (
  <motion.button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-3 px-8 py-3 text-[12px] font-mono font-bold tracking-[0.25em] uppercase
               transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ background: BEIGE, color: '#0E1E2F', border: `2px solid ${BEIGE}` }}
    whileHover={loading ? {} : { boxShadow: `0 0 32px rgba(240,236,218,0.35)`, y: -1 }}
  >
    {loading
      ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: ORANGE }} />
      : <Plus className="w-4 h-4" style={{ color: ORANGE }} />
    }
    {loading ? 'Registering…' : label}
  </motion.button>
);

// ── Tabs config ────────────────────────────────────────────────────
const TABS = [
  { id: 'mentor',    label: 'Mentor',    Icon: User,        Form: MentorForm,    desc: 'Register an expert who will mentor companies in the programme.', roles: ['super_admin', 'programme_admin', 'mentor'] },
  { id: 'company',  label: 'Company',   Icon: Building2,   Form: CompanyForm,   desc: 'Add a startup or company seeking mentorship and support.', roles: ['super_admin', 'programme_admin', 'company'] },
  { id: 'programme',label: 'Programme', Icon: LayoutGrid,  Form: ProgrammeForm, desc: 'Create a programme — this is required before running a match.', roles: ['super_admin', 'programme_admin'] },
];

// ── Register Page ──────────────────────────────────────────────────
const Register = () => {
  const user = getUser();
  const isAdmin = hasRole('super_admin', 'programme_admin');

  // Filter tabs based on role
  const visibleTabs = TABS.filter(t => {
    if (t.roles) return t.roles.includes(user?.role);
    return true;
  });

  const [active, setActive] = useState(visibleTabs[0]?.id || 'company');
  const tab = visibleTabs.find(t => t.id === active) || visibleTabs[0];

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-[860px] mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase mb-2" style={{ color: GOLDEN }}>
            Entity Registration
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: BEIGE }}>
            Register an Entity
          </h1>
          <p className="text-sm max-w-xl" style={{ color: MUTED }}>
            Add mentors, companies and programmes to the ecosystem.
            A <span style={{ color: ORANGE }}>Programme</span> must exist before you can run a match.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8" style={{ borderBottom: `1px solid rgba(72,127,134,0.25)` }}>
          {visibleTabs.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="relative flex items-center gap-2 px-6 py-3 text-[11px] font-mono tracking-[0.2em] uppercase transition-colors"
                style={{ color: isActive ? AQ : MUTED }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: AQ }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[12px] mb-8 font-mono" style={{ color: MUTED }}>
              {tab.desc}
            </p>

            {/* Card */}
            <div
              className="relative p-8 overflow-hidden"
              style={{
                background: 'rgba(14,30,47,0.70)',
                border: `1px solid rgba(72,127,134,0.30)`,
                boxShadow: `0 0 60px rgba(72,127,134,0.06)`,
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: SF }} />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: SF }} />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: SF }} />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: SF }} />

              <tab.Form />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Register;
