import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  ChevronRight, ChevronLeft, Check, Plus, X,
  Upload, FileText, GraduationCap, Code2, Briefcase,
  Heart, Target, AlertCircle, Loader2, MapPin, Sparkles,
  Lightbulb, Compass, Award, Building, DollarSign, Users,
  CheckCircle2, ArrowRight
} from 'lucide-react';

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'PhD'];
const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const WORK_MODES = [
  { id: 'remote', label: 'Remote', desc: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Mix of office and home' },
  { id: 'on-site', label: 'On-site', desc: 'Physical office presence' },
  { id: 'flexible', label: 'Flexible', desc: 'Open to any mode' },
];

const LOCATION_MODES = [
  { id: 'nearby_cities', label: 'My city & nearby / NCR', desc: 'Prioritize Delhi NCR / metro cluster' },
  { id: 'only_my_city', label: 'Only my city', desc: 'Strict local preference' },
  { id: 'anywhere_india', label: 'Anywhere in India', desc: 'Open to opportunities across India' },
  { id: 'remote_only', label: 'Remote only', desc: 'Exclusively remote roles' },
];

const CONTRIBUTION_STYLES = [
  { id: 'ideas', label: 'Generating creative ideas & brainstorming', icon: '💡' },
  { id: 'problem-solving', label: 'Solving real-world & analytical problems', icon: '🧩' },
  { id: 'research', label: 'Researching, case analysis & market data', icon: '🔍' },
  { id: 'design', label: 'Designing user solutions, UI/UX & visuals', icon: '🎨' },
  { id: 'building', label: 'Building, coding & technical implementation', icon: '💻' },
  { id: 'pitching', label: 'Pitching, presentation & communication', icon: '🗣️' },
  { id: 'coordination', label: 'Leading teams & coordinating members', icon: '🤝' },
  { id: 'open', label: 'Open to multiple roles & hybrid contributions', icon: '🌐' },
];

const POPULAR_STRENGTHS = [
  'Problem-solving', 'Creative ideas', 'Brainstorming', 'Research',
  'Case-study analysis', 'Product thinking', 'Market research', 'UI/UX Design',
  'Coding & implementation', 'Presentation & pitching', 'Team leadership',
  'Testing & analysis', 'Documentation', 'Communication', 'Data analysis'
];

const OPPORTUNITY_TRACKS = [
  { id: 'ideathon', label: 'Ideathons & Idea Challenges', tag: 'Non-coding friendly', emoji: '💡' },
  { id: 'case_competition', label: 'Business & Case Competitions', tag: 'Strategy & Analysis', emoji: '📈' },
  { id: 'open_innovation', label: 'Open Innovation Programs', tag: 'Freshers Welcome', emoji: '🌱' },
  { id: 'coding_hackathon', label: 'Coding Hackathons', tag: 'Build Working Prototypes', emoji: '⚡' },
  { id: 'product_challenge', label: 'Product & UI/UX Challenges', tag: 'Design & Features', emoji: '🎨' },
  { id: 'research_fellowship', label: 'Research Internships & Fellowships', tag: 'Deep Domain Learning', emoji: '🔬' },
];

const PRIORITY_OPTIONS = [
  { id: 'paid', label: 'Paid opportunities', desc: 'I want a stipend or salary for my work', emoji: '💰' },
  { id: 'learning', label: 'Learning & exposure', desc: 'Comfortable with unpaid if there is genuine mentorship & learning', emoji: '🌱' },
  { id: 'company_experience', label: 'Company experience', desc: 'Want to understand professional culture at an established org', emoji: '🏢' },
  { id: 'networking', label: 'Networking & mentors', desc: 'I value industry mentors and professional connections', emoji: '🤝' },
  { id: 'skills', label: 'Practical skill development', desc: 'Focus on hands-on live project experience', emoji: '🛠️' },
  { id: 'flexible', label: 'Flexible', desc: 'Open to both paid and high-exposure unpaid roles', emoji: '⚖️' },
];

const EXPOSURE_OPTIONS = [
  { id: 'mentorship', label: 'Mentorship provided', desc: '1-on-1 guidance from seniors' },
  { id: 'certificate', label: 'Certificate of completion', desc: 'Verified credential' },
  { id: 'liveProjects', label: 'Live industry projects', desc: 'Real customer-facing work' },
  { id: 'industryExposure', label: 'Industry exposure', desc: 'Work with established teams' },
  { id: 'ppoOffered', label: 'Pre-placement offer (PPO)', desc: 'Direct pathway to full-time' },
];

const STEPS = [
  { id: 1, label: 'Education & Stage', icon: GraduationCap },
  { id: 2, label: 'Location Preferences', icon: MapPin },
  { id: 3, label: 'Contribution & Strengths', icon: Lightbulb },
  { id: 4, label: 'What Matters Most', icon: Heart },
  { id: 5, label: 'Skills & Resume (Optional)', icon: FileText },
];

// ─── Small utility components ──────────────────────────────────────────────────
function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-charcoal-700">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-charcoal-400">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-lg border border-[#E8E3D8] bg-white text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-rust-600/20 focus:border-rust-600 transition-colors ${className}`}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-lg border border-[#E8E3D8] bg-white text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-rust-600/20 focus:border-rust-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── Step 1: Education & Beginner Stage ─────────────────────────────────────────
function EducationStep({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal-900 mb-1">Tell us about your college & stage</h2>
        <p className="text-charcoal-500 text-sm">
          NextOpp connects you to opportunities matching your current academic year. <span className="font-medium text-rust-700">Freshers and beginners are 100% welcome!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="College / University">
          <Input
            placeholder="e.g. Delhi University, IIT Delhi, DTU, VIT"
            value={data.college}
            onChange={(e) => set('college', e.target.value)}
          />
        </Field>
        <Field label="Degree">
          <Input
            placeholder="e.g. B.Tech, BCA, B.Sc, BBA, B.Com, B.A."
            value={data.degree}
            onChange={(e) => set('degree', e.target.value)}
          />
        </Field>
        <Field label="Branch / Major">
          <Input
            placeholder="e.g. Computer Science, Economics, Design, Mechanical"
            value={data.branch}
            onChange={(e) => set('branch', e.target.value)}
          />
        </Field>
        <Field label="Academic Year">
          <Select value={data.academicYear} onChange={(e) => set('academicYear', e.target.value)}>
            <option value="">Select current year</option>
            {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </Field>
        <Field label="Completed Semester (optional)">
          <Select value={data.semesterCompleted || ''} onChange={(e) => set('semesterCompleted', e.target.value)}>
            <option value="">Select semester</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Expected Graduation Year">
          <Input
            type="number"
            placeholder="e.g. 2026 or 2027"
            min={2022}
            max={2035}
            value={data.graduationYear}
            onChange={(e) => set('graduationYear', e.target.value)}
          />
        </Field>
      </div>

      {/* Beginner Affirmation Box */}
      <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E8E3D8] space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.isBeginner}
            onChange={(e) => set('isBeginner', e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-rust-600 focus:ring-rust-500 accent-rust-600"
          />
          <div>
            <span className="text-sm font-semibold text-charcoal-900 block">
              I am just getting started (1st/2nd year, no prior internship experience)
            </span>
            <span className="text-xs text-charcoal-500 block mt-0.5">
              NextOpp will prioritize beginner-friendly Ideathons, first-year hackathons, and open challenges without resume or coding barriers.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}

// ─── Step 2: Location & Work Mode Preferences ─────────────────────────────────
function LocationStep({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal-900 mb-1">Where do you want to explore?</h2>
        <p className="text-charcoal-500 text-sm">
          We never silently ignore your location. A student in Delhi won't be flooded with on-site Pune or Bangalore internships unless they choose to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Current City">
          <Input
            placeholder="e.g. Delhi, Noida, Gurugram, Bengaluru"
            value={data.city || ''}
            onChange={(e) => set('city', e.target.value)}
          />
        </Field>
        <Field label="State">
          <Input
            placeholder="e.g. Delhi, Karnataka, Maharashtra"
            value={data.state || ''}
            onChange={(e) => set('state', e.target.value)}
          />
        </Field>
        <Field label="Country">
          <Input
            placeholder="India"
            value={data.country || 'India'}
            onChange={(e) => set('country', e.target.value)}
          />
        </Field>
      </div>

      {/* Location Matching Mode */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          How strictly should we filter physical locations?
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {LOCATION_MODES.map((mode) => {
            const isSelected = (data.locationMode || 'nearby_cities') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => set('locationMode', mode.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-rust-600 bg-rust-50/50 text-charcoal-900 shadow-sm'
                    : 'border-[#E8E3D8] bg-white hover:border-charcoal-400 text-charcoal-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{mode.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-rust-600" />}
                </div>
                <p className="text-xs text-charcoal-500 mt-1">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Modes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Preferred Work Modes (select all that fit)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {WORK_MODES.map((wm) => {
            const modes = data.workModes || ['remote', 'hybrid'];
            const isSelected = modes.includes(wm.id);
            return (
              <button
                key={wm.id}
                type="button"
                onClick={() => {
                  const next = isSelected ? modes.filter((m) => m !== wm.id) : [...modes, wm.id];
                  set('workModes', next);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-charcoal-900 bg-charcoal-900 text-white'
                    : 'border-[#E8E3D8] bg-white text-charcoal-700 hover:border-charcoal-400'
                }`}
              >
                <div className="text-xs font-bold">{wm.label}</div>
                <div className={`text-3xs mt-0.5 ${isSelected ? 'text-charcoal-300' : 'text-charcoal-400'}`}>
                  {wm.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relocation toggle */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#E8E3D8] rounded-xl">
        <div>
          <span className="text-sm font-medium text-charcoal-800 block">Are you willing to relocate for the right role?</span>
          <span className="text-xs text-charcoal-400">Allows showing premier on-site internships outside your current city.</span>
        </div>
        <input
          type="checkbox"
          checked={!!data.willingToRelocate}
          onChange={(e) => set('willingToRelocate', e.target.checked)}
          className="w-4 h-4 text-rust-600 rounded accent-rust-600"
        />
      </div>
    </div>
  );
}

// ─── Step 3: Contribution Style & Strengths ───────────────────────────────────
function ContributionStep({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const styles = data.contributionStyles || ['ideas', 'problem-solving'];
  const strengths = data.strengths || [];
  const tracks = data.preferredTracks || ['ideathon', 'case_competition'];

  const toggleStyle = (id) => {
    set('contributionStyles', styles.includes(id) ? styles.filter((s) => s !== id) : [...styles, id]);
  };

  const toggleStrength = (s) => {
    set('strengths', strengths.includes(s) ? strengths.filter((item) => item !== s) : [...strengths, s]);
  };

  const toggleTrack = (id) => {
    set('preferredTracks', tracks.includes(id) ? tracks.filter((t) => t !== id) : [...tracks, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal-900 mb-1">How do you like to contribute?</h2>
        <p className="text-charcoal-500 text-sm">
          NextOpp believes not every student needs to code. If your superpowers are problem-solving, ideas, research, or pitching, we will match you to Ideathons and Case Challenges accordingly!
        </p>
      </div>

      {/* Contribution Styles */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Select your preferred contribution ways:
        </label>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {CONTRIBUTION_STYLES.map((c) => {
            const isSelected = styles.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleStyle(c.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'border-rust-600 bg-rust-50/60 text-charcoal-900 font-medium'
                    : 'border-[#E8E3D8] bg-white text-charcoal-700 hover:border-charcoal-400'
                }`}
              >
                <span className="text-xl flex-shrink-0">{c.icon}</span>
                <span className="text-xs leading-snug">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strengths picker */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Your key strengths & interests (click to add):
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STRENGTHS.map((s) => {
            const isSelected = strengths.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStrength(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-charcoal-900 text-white border-charcoal-900'
                    : 'bg-white text-charcoal-700 border-[#E8E3D8] hover:border-charcoal-400'
                }`}
              >
                {isSelected ? `✓ ${s}` : `+ ${s}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunity tracks */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Opportunity formats you want to see:
        </label>
        <div className="grid sm:grid-cols-3 gap-2.5">
          {OPPORTUNITY_TRACKS.map((tr) => {
            const isSelected = tracks.includes(tr.id);
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => toggleTrack(tr.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-rust-600 bg-rust-50/60 text-charcoal-900'
                    : 'border-[#E8E3D8] bg-white text-charcoal-700 hover:border-charcoal-400'
                }`}
              >
                <div className="text-lg mb-1">{tr.emoji}</div>
                <div className="text-xs font-semibold leading-tight">{tr.label}</div>
                <div className="text-3xs text-rust-600 mt-1 font-medium">{tr.tag}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: What Matters Most (Compensation & Exposure) ──────────────────────
function WhatMattersStep({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const priority = data.opportunityPriority || 'flexible';
  const exposures = data.exposurePriorities || ['mentorship', 'liveProjects', 'industryExposure'];

  const toggleExposure = (id) => {
    set('exposurePriorities', exposures.includes(id) ? exposures.filter((x) => x !== id) : [...exposures, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal-900 mb-1">What matters most in an opportunity?</h2>
        <p className="text-charcoal-500 text-sm">
          NextOpp doesn't assume money is the only goal. Whether you prioritize stipend, industry learning, mentorship, or startup experience, we calibrate recommendations to your priority.
        </p>
      </div>

      {/* Priority Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Your primary focus right now:
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRIORITY_OPTIONS.map((opt) => {
            const isSelected = priority === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => set('opportunityPriority', opt.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-rust-600 bg-rust-50/60 text-charcoal-900'
                    : 'border-[#E8E3D8] bg-white hover:border-charcoal-400 text-charcoal-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-sm font-semibold">{opt.label}</span>
                </div>
                <p className="text-xs text-charcoal-500 mt-1 pl-7">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Stipend if paid */}
      {priority === 'paid' && (
        <div className="p-4 rounded-xl bg-white border border-[#E8E3D8] space-y-2">
          <Field label="Minimum expected stipend per month (INR ₹)" hint="Leave blank if open to reasonable offers">
            <Input
              type="number"
              placeholder="e.g. 15000, 25000"
              value={data.minStipend || ''}
              onChange={(e) => set('minStipend', e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* Exposure Perks Desired */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-charcoal-800">
          Exposure perks that make an opportunity valuable to you:
        </label>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {EXPOSURE_OPTIONS.map((exp) => {
            const isSelected = exposures.includes(exp.id);
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => toggleExposure(exp.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'border-charcoal-900 bg-charcoal-900 text-white'
                    : 'border-[#E8E3D8] bg-white text-charcoal-700 hover:border-charcoal-400'
                }`}
              >
                <div className="flex-1">
                  <div className="text-xs font-semibold">{exp.label}</div>
                  <div className={`text-3xs mt-0.5 ${isSelected ? 'text-charcoal-300' : 'text-charcoal-400'}`}>
                    {exp.desc}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Optional Skills & Optional Resume (No Resume Required) ───────────
function SkillsAndResumeStep({
  skills, setSkills,
  resumeFile, setResumeFile,
  parsedData, setParsedData,
  confirmedSkills, setConfirmedSkills,
  uploadStatus, setUploadStatus
}) {
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState('intermediate');
  const fileRef = useRef(null);

  const addSkill = () => {
    const trimmed = newSkill.trim().toLowerCase();
    if (!trimmed) return;
    if (skills.find((s) => s.skill === trimmed)) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, { skill: trimmed, proficiency: newProficiency }]);
    setNewSkill('');
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s.skill !== skill));

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error('Only PDF, DOCX, or TXT files are supported');
      return;
    }
    setResumeFile(file);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await profileAPI.uploadResume(formData);
      const parsed = res.resume || res;
      setParsedData(parsed);
      const newSkills = (parsed.parsedSkills || []).filter(
        (s) => !skills.find((es) => es.skill.toLowerCase() === s.toLowerCase())
      );
      setConfirmedSkills(newSkills);
      setUploadStatus('done');
      toast.success('Resume parsed! You can add detected skills.');
    } catch (err) {
      setUploadStatus('error');
      toast.error('Could not parse resume. You can still finish without it.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3 h-3 text-emerald-600" /> 100% Optional Step
        </div>
        <h2 className="font-serif text-2xl text-charcoal-900 mb-1">Skills & Resume (Optional)</h2>
        <p className="text-charcoal-500 text-sm">
          <strong className="text-charcoal-800">No resume or prior experience required!</strong> If you already have skills or a CV, you can add them below. If you are a beginner, feel free to skip directly to your dashboard.
        </p>
      </div>

      {/* Manual skills input */}
      <div className="space-y-3 p-4 bg-white border border-[#E8E3D8] rounded-xl">
        <p className="text-sm font-semibold text-charcoal-800">Technical or Soft Skills (optional)</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Python, React, Figma, Public Speaking"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1"
          />
          <Select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value)} className="w-32">
            {PROFICIENCY_LEVELS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-medium hover:bg-charcoal-800"
          >
            Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s) => (
              <span key={s.skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F0] border border-[#E8E3D8] rounded-full text-xs font-medium text-charcoal-800">
                {s.skill} <span className="text-3xs text-charcoal-400">({s.proficiency})</span>
                <button type="button" onClick={() => removeSkill(s.skill)} className="hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Optional Resume Upload */}
      <div className="p-4 bg-white border border-[#E8E3D8] rounded-xl space-y-3">
        <p className="text-sm font-semibold text-charcoal-800 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-rust-600" />
          Upload Resume (optional)
        </p>
        <p className="text-xs text-charcoal-500">
          Extracts keywords into your profile without overwriting your manual selections. You can also upload later.
        </p>

        {!resumeFile ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-[#DDD8CC] hover:border-rust-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#FAF7F0]"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <Upload className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-charcoal-700">Click to attach resume (PDF, DOCX)</p>
            <p className="text-3xs text-charcoal-400 mt-1">Or leave blank and click "Complete Setup"</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border border-[#E8E3D8] rounded-lg bg-emerald-50/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-charcoal-800">{resumeFile.name}</span>
            </div>
            <button
              type="button"
              onClick={() => { setResumeFile(null); setParsedData(null); }}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ──────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Profile Form States
  const [education, setEducation] = useState({
    college: '',
    degree: '',
    branch: '',
    academicYear: '1st Year',
    semesterCompleted: '',
    graduationYear: 2027,
    cgpa: '',
    isBeginner: true,
  });

  const [locationPrefs, setLocationPrefs] = useState({
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    locationMode: 'nearby_cities',
    workModes: ['remote', 'hybrid', 'on-site'],
    willingToRelocate: true,
  });

  const [contributionPrefs, setContributionPrefs] = useState({
    contributionStyles: ['ideas', 'problem-solving'],
    strengths: ['Problem-solving', 'Creative ideas'],
    preferredTracks: ['ideathon', 'case_competition', 'open_innovation'],
  });

  const [mattersPrefs, setMattersPrefs] = useState({
    opportunityPriority: 'flexible',
    minStipend: '',
    exposurePriorities: ['mentorship', 'certificate', 'liveProjects', 'industryExposure'],
  });

  const [skills, setSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [confirmedSkills, setConfirmedSkills] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const allSkills = [...skills];
      for (const s of confirmedSkills) {
        if (!allSkills.find((ex) => ex.skill.toLowerCase() === s.toLowerCase())) {
          allSkills.push({ skill: s.toLowerCase(), proficiency: 'beginner' });
        }
      }

      const preferences = {
        country: locationPrefs.country,
        state: locationPrefs.state,
        city: locationPrefs.city,
        locationMode: locationPrefs.locationMode,
        workModes: locationPrefs.workModes,
        willingToRelocate: locationPrefs.willingToRelocate,
        contributionStyles: contributionPrefs.contributionStyles,
        strengths: contributionPrefs.strengths,
        preferredTracks: contributionPrefs.preferredTracks,
        opportunityPriority: mattersPrefs.opportunityPriority,
        minStipend: mattersPrefs.minStipend ? Number(mattersPrefs.minStipend) : undefined,
        exposurePriorities: mattersPrefs.exposurePriorities,
        isBeginner: education.isBeginner,
        semesterCompleted: education.semesterCompleted,
        locations: [locationPrefs.city, 'Remote'].filter(Boolean),
        opportunityTypes: ['internship', 'hackathon', 'fellowship', 'competition'],
      };

      await profileAPI.saveOnboarding({
        step: 'complete',
        isComplete: true,
        education: {
          institution: education.college,
          degree: education.degree,
          branch: education.branch,
          academicYear: education.academicYear,
          graduationYear: education.graduationYear ? Number(education.graduationYear) : undefined,
          cgpa: education.cgpa ? Number(education.cgpa) : undefined,
          location: locationPrefs.city,
        },
        location: `${locationPrefs.city}, ${locationPrefs.state || locationPrefs.country}`,
        skills: allSkills,
        preferences,
      });

      updateUser({ isOnboarded: true });
      toast.success('Your personalized NextOpp profile is live!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#E8E3D8] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-charcoal-900 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-cream-100" />
            </div>
            <span className="font-serif text-lg text-charcoal-900">NextOpp</span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
            Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1].label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-charcoal-100">
        <div
          className="h-full bg-rust-600 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="border-b border-[#E8E3D8] bg-white/60 hidden sm:block">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="flex items-center gap-1">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isCurrent ? 'text-charcoal-900' :
                    isComplete ? 'text-emerald-600' : 'text-charcoal-400'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isCurrent ? 'border-charcoal-900 bg-charcoal-900 text-white' :
                      isComplete ? 'border-emerald-500 bg-emerald-500 text-white' :
                      'border-charcoal-300 text-charcoal-400'
                    }`}>
                      {isComplete ? <Check className="w-3 h-3" /> : <StepIcon className="w-3 h-3" />}
                    </div>
                    <span>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${isComplete ? 'bg-emerald-300' : 'bg-charcoal-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex items-start justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl border border-[#E8E3D8] shadow-sm p-6 sm:p-8">
            {currentStep === 1 && (
              <EducationStep data={education} onChange={setEducation} />
            )}
            {currentStep === 2 && (
              <LocationStep data={locationPrefs} onChange={setLocationPrefs} />
            )}
            {currentStep === 3 && (
              <ContributionStep data={contributionPrefs} onChange={setContributionPrefs} />
            )}
            {currentStep === 4 && (
              <WhatMattersStep data={mattersPrefs} onChange={setMattersPrefs} />
            )}
            {currentStep === 5 && (
              <SkillsAndResumeStep
                skills={skills}
                setSkills={setSkills}
                resumeFile={resumeFile}
                setResumeFile={setResumeFile}
                parsedData={parsedData}
                setParsedData={setParsedData}
                confirmedSkills={confirmedSkills}
                setConfirmedSkills={setConfirmedSkills}
                uploadStatus={uploadStatus}
                setUploadStatus={setUploadStatus}
              />
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8E3D8]">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-charcoal-300 cursor-not-allowed'
                    : 'text-charcoal-600 hover:bg-charcoal-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-3">
                {currentStep === STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-semibold hover:bg-charcoal-800 transition-colors shadow-sm"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing Match Profile…</>
                    ) : (
                      <><Check className="w-4 h-4" /> Complete & View Matches</>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-charcoal-900 text-white rounded-lg text-sm font-medium hover:bg-charcoal-800 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Skip for Existing Users */}
          <p className="text-center text-xs text-charcoal-400 mt-4">
            Want to explore right away?{' '}
            <button
              type="button"
              onClick={handleComplete}
              className="text-rust-600 hover:text-rust-700 font-semibold underline"
            >
              Skip setup and go straight to Dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
