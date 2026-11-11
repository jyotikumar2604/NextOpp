import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  GraduationCap, Code2, Compass, Sliders,
  Save, Sparkles, Plus,
  Globe, Phone, MapPin, Briefcase, Award, Upload, FileText, X, Check, Loader2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'];
const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const OPPORTUNITY_TYPES = [
  { id: 'internship', label: 'Internships', emoji: '💼' },
  { id: 'job', label: 'Full-time Jobs', emoji: '🏢' },
  { id: 'scholarship', label: 'Scholarships', emoji: '🎓' },
  { id: 'hackathon', label: 'Hackathons', emoji: '⚡' },
  { id: 'fellowship', label: 'Fellowships', emoji: '🔬' },
  { id: 'research', label: 'Research', emoji: '📊' },
  { id: 'competition', label: 'Competitions', emoji: '🏆' },
];
const WORK_MODES = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('education'); // 'education' | 'skills' | 'interests' | 'preferences' | 'links' | 'projects' | 'experience' | 'certifications' | 'resume'

  // Form state
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');

  // Education
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    branch: '',
    academicYear: '',
    graduationYear: new Date().getFullYear() + 1,
    gpa: '',
    gpaScale: 10,
    location: '',
  });

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');

  // Career Interests & Goals
  const [careerInterests, setCareerInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [careerGoals, setCareerGoals] = useState('');

  // Links
  const [links, setLinks] = useState({
    github: '',
    linkedin: '',
    portfolio: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    opportunityTypes: [],
    workModes: [],
    locations: [],
    compensationRequired: false,
    minCompensation: '',
    country: 'India',
    state: '',
    city: '',
    locationMode: 'nearby_cities',
    willingToRelocate: true,
    strengths: [],
    contributionStyles: [],
    preferredTracks: [],
    opportunityPriority: 'flexible',
    minStipend: '',
    exposurePriorities: [],
  });
  const [prefLocationInput, setPrefLocationInput] = useState('');

  // AI Profile Tips
  const [aiTips, setAiTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  // Profile completion score
  const [completionScore, setCompletionScore] = useState(0);

  // Projects, Experience, Certifications
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', link: '', role: '' });
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', credentialUrl: '' });

  // Resume
  const resumeFileRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [confirmedResumeSkills, setConfirmedResumeSkills] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await profileAPI.get();
      if (res.success && res.profile) {
        const p = res.profile;
        setBio(p.bio || '');
        setLocation(p.location || '');
        setPhone(p.phone || '');
        setEducation({
          institution: p.education?.institution || '',
          degree: p.education?.degree || '',
          branch: p.education?.branch || '',
          academicYear: p.education?.academicYear || '',
          graduationYear: p.education?.graduationYear || new Date().getFullYear() + 1,
          gpa: p.education?.gpa != null ? p.education.gpa : '',
          gpaScale: p.education?.gpaScale || 10,
          location: p.education?.location || '',
        });
        setSkills(p.skills || []);
        setCareerInterests(p.careerInterests || []);
        setCareerGoals(p.careerGoals || '');
        setLinks({
          github: p.links?.github || '',
          linkedin: p.links?.linkedin || '',
          portfolio: p.links?.portfolio || '',
        });
        setPreferences({
          opportunityTypes: p.preferences?.opportunityTypes || [],
          workModes: p.preferences?.workModes || [],
          locations: p.preferences?.locations || [],
          compensationRequired: p.preferences?.compensationRequired || false,
          minCompensation: p.preferences?.minCompensation || '',
          country: p.preferences?.country || 'India',
          state: p.preferences?.state || '',
          city: p.preferences?.city || '',
          locationMode: p.preferences?.locationMode || 'nearby_cities',
          willingToRelocate: p.preferences?.willingToRelocate !== false,
          strengths: p.preferences?.strengths || [],
          contributionStyles: p.preferences?.contributionStyles || [],
          preferredTracks: p.preferences?.preferredTracks || [],
          opportunityPriority: p.preferences?.opportunityPriority || 'flexible',
          minStipend: p.preferences?.minStipend || '',
          exposurePriorities: p.preferences?.exposurePriorities || [],
        });
        setCompletionScore(p.completionScore || 0);
        setProjects(p.projects || []);
        setExperience(p.experience || []);
        setCertifications(p.certifications || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio,
        location,
        phone,
        education: {
          ...education,
          graduationYear: education.graduationYear ? Number(education.graduationYear) : undefined,
          gpa: education.gpa !== '' ? Number(education.gpa) : undefined,
          gpaScale: Number(education.gpaScale) || 10,
        },
        skills,
        projects,
        experience,
        certifications,
        careerInterests,
        careerGoals,
        links,
        preferences: {
          ...preferences,
          minCompensation: preferences.minCompensation !== '' ? Number(preferences.minCompensation) : undefined,
          minStipend: preferences.minStipend !== '' ? Number(preferences.minStipend) : undefined,
        },
      };

      const res = await profileAPI.update(payload);
      if (res.success) {
        toast.success('Profile saved successfully!');
        if (res.profile?.completionScore != null) {
          setCompletionScore(res.profile.completionScore);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error('Only PDF, DOCX, or TXT files are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setResumeFile(file);
    setResumeUploadStatus('uploading');
    setParsedResumeData(null);
    setConfirmedResumeSkills([]);

    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await profileAPI.uploadResume(formData);
      const parsed = res.resume || res;
      setParsedResumeData(parsed);
      const newSkills = (parsed.parsedSkills || []).filter(
        (s) => !skills.find((es) => (es.skill || es).toLowerCase() === s.toLowerCase())
      );
      setConfirmedResumeSkills(newSkills);
      setResumeUploadStatus('done');
      toast.success('Resume parsed successfully');
    } catch (err) {
      setResumeUploadStatus('error');
      toast.error(err.message || 'Resume upload failed');
    }
  }

  async function fetchAiTips() {
    setLoadingTips(true);
    try {
      const res = await profileAPI.getTips();
      if (res.success) {
        setAiTips(res);
      }
    } catch {
      toast.error('Could not generate profile tips');
    } finally {
      setLoadingTips(false);
    }
  }

  // Skill actions
  function addSkill() {
    const s = newSkillName.trim().toLowerCase();
    if (!s) return;
    if (skills.some((item) => (item.skill || item).toLowerCase() === s)) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, { skill: s, proficiency: newSkillProficiency }]);
    setNewSkillName('');
  }

  function removeSkill(index) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  // Interest actions
  function addInterest() {
    const interest = interestInput.trim();
    if (!interest) return;
    if (careerInterests.includes(interest)) return;
    setCareerInterests([...careerInterests, interest]);
    setInterestInput('');
  }

  function removeInterest(interest) {
    setCareerInterests(careerInterests.filter((i) => i !== interest));
  }

  // Preference location actions
  function addPrefLocation() {
    const loc = prefLocationInput.trim();
    if (!loc) return;
    if (preferences.locations.includes(loc)) return;
    setPreferences({
      ...preferences,
      locations: [...preferences.locations, loc],
    });
    setPrefLocationInput('');
  }

  function removePrefLocation(loc) {
    setPreferences({
      ...preferences,
      locations: preferences.locations.filter((l) => l !== loc),
    });
  }

  function toggleOpportunityType(type) {
    const types = preferences.opportunityTypes.includes(type)
      ? preferences.opportunityTypes.filter((t) => t !== type)
      : [...preferences.opportunityTypes, type];
    setPreferences({ ...preferences, opportunityTypes: types });
  }

  function toggleWorkMode(mode) {
    const modes = preferences.workModes.includes(mode)
      ? preferences.workModes.filter((m) => m !== mode)
      : [...preferences.workModes, mode];
    setPreferences({ ...preferences, workModes: modes });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-charcoal-200 border-t-rust-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header Hero */}
        <div className="bg-[#FEFCF8] rounded-2xl border border-[#E8E3D8] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-charcoal-900 text-cream-100 font-serif text-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div>
                <h1 className="text-2xl font-serif text-charcoal-900">
                  {user?.name}
                </h1>
                <p className="text-xs text-charcoal-500 font-medium">
                  {user?.email} • {education.degree ? `${education.degree} in ${education.branch || 'Engineering'}` : 'Student Profile'}
                </p>
                {location && (
                  <p className="text-xs text-charcoal-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {location}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="w-full sm:w-64 p-4 bg-[#FAF7F0] border border-[#DDD8CC] rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-charcoal-800">
                <span>Profile Strength</span>
                <span className="text-rust-600 font-bold">{completionScore}%</span>
              </div>
              <div className="w-full bg-[#E8E3D8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rust-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <p className="text-2xs text-charcoal-400">
                {completionScore >= 80
                  ? 'Excellent! You unlock accurate matching scores.'
                  : 'Add education and skills to improve your match accuracy.'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E8E3D8] pb-1 scrollbar-none text-xs font-semibold">
          {[
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'skills', label: 'Skills & Tech', icon: Code2 },
            { id: 'projects', label: 'Projects', icon: Globe },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'certifications', label: 'Certifications', icon: Award },
            { id: 'interests', label: 'Interests & Goals', icon: Compass },
            { id: 'preferences', label: 'Preferences', icon: Sliders },
            { id: 'links', label: 'Bio & Links', icon: Globe },
            { id: 'resume', label: 'Resume', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
                  active
                    ? 'border-rust-600 text-rust-600 bg-[#FEFCF8]'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Forms */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* TAB 1: EDUCATION */}
          {activeTab === 'education' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Education Details</h2>
                <p className="text-xs text-charcoal-500">
                  Used by the deterministic matching engine to evaluate academic year and GPA restrictions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                    placeholder="e.g. Indian Institute of Technology, Delhi"
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={education.degree}
                    onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                    placeholder="e.g. B.Tech / B.S. / M.S."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={education.branch}
                    onChange={(e) => setEducation({ ...education, branch: e.target.value })}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Current Academic Year
                  </label>
                  <select
                    value={education.academicYear}
                    onChange={(e) => setEducation({ ...education, academicYear: e.target.value })}
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  >
                    <option value="">Select Academic Year</option>
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={education.graduationYear}
                    onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })}
                    min="2020"
                    max="2035"
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    GPA / CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={education.gpa}
                    onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                    placeholder="e.g. 8.5"
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    GPA Grading Scale
                  </label>
                  <select
                    value={education.gpaScale}
                    onChange={(e) => setEducation({ ...education, gpaScale: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  >
                    <option value="10">10.0 Scale (e.g. Indian CGPA)</option>
                    <option value="4">4.0 Scale (e.g. US GPA)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Skills & Technical Competencies</h2>
                <p className="text-xs text-charcoal-500">
                  Skills account for 55% of the overall NextOpp match score (40% required, 15% preferred).
                </p>
              </div>

              {/* Add Skill Row */}
              <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#DDD8CC] flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-2xs font-bold text-charcoal-600 uppercase mb-1">
                    Skill or Framework
                  </label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Node.js, Python, Docker..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <label className="block text-2xs font-bold text-charcoal-600 uppercase mb-1">
                    Proficiency
                  </label>
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value)}
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500 capitalize"
                  >
                    {PROFICIENCY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>

              {/* Current Skills List */}
              <div>
                <h3 className="text-xs font-bold text-charcoal-600 uppercase mb-3">
                  Your Added Skills ({skills.length})
                </h3>
                {skills.length === 0 ? (
                  <div className="p-6 text-center text-xs text-charcoal-400 border border-dashed border-[#DDD8CC] rounded-xl">
                    No skills added yet. Add languages, frameworks, databases, and tools you know.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, idx) => {
                      const name = typeof s === 'string' ? s : s.skill;
                      const prof = typeof s === 'string' ? 'intermediate' : s.proficiency || 'intermediate';
                      return (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-[#DDD8CC] text-xs font-medium text-charcoal-800 flex items-center gap-2"
                        >
                          <span className="font-semibold">{name}</span>
                          <span className="text-2xs text-rust-600 uppercase font-bold px-1.5 py-0.5 bg-rust-50 rounded">
                            {prof}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSkill(idx)}
                            className="text-charcoal-400 hover:text-charcoal-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INTERESTS & GOALS */}
          {activeTab === 'interests' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Career Interests & Aspirations</h2>
                <p className="text-xs text-charcoal-500">
                  Help NextOpp prioritize opportunities that align with your long-term ambitions.
                </p>
              </div>

              {/* Career Interests Tags */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-charcoal-700">
                  Target Roles & Domains
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    placeholder="e.g. Full Stack Engineering, Machine Learning, Product Design..."
                    className="flex-1 p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="btn-outline text-xs px-4"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {careerInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-charcoal-100 text-charcoal-800 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="text-charcoal-400 hover:text-charcoal-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Goals */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-charcoal-700">
                  Career Statement / Long-term Goal
                </label>
                <textarea
                  rows={4}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="Describe what kind of problems you want to solve, industries you're excited by, or where you see yourself in 3 years..."
                  className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="card p-6 space-y-6 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Personalized Matching Preferences</h2>
                <p className="text-xs text-charcoal-500">
                  Controls your daily "Today's Move", regional matching, contribution tracks (coding vs. ideathons), and exposure calibration.
                </p>
              </div>

              {/* 1. Regional & Location Matching */}
              <div className="space-y-3 p-4 bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rust-600" />
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    Location & Regional Cluster Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Your City</label>
                    <input
                      type="text"
                      value={preferences.city || ''}
                      onChange={(e) => setPreferences({ ...preferences, city: e.target.value })}
                      placeholder="e.g. Delhi, Noida, Bengaluru"
                      className="w-full p-2 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">State</label>
                    <input
                      type="text"
                      value={preferences.state || ''}
                      onChange={(e) => setPreferences({ ...preferences, state: e.target.value })}
                      placeholder="e.g. Delhi, Karnataka, Maharashtra"
                      className="w-full p-2 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={preferences.country || 'India'}
                      onChange={(e) => setPreferences({ ...preferences, country: e.target.value })}
                      placeholder="India"
                      className="w-full p-2 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                </div>

                {/* Location Strictness Mode */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-2xs font-bold uppercase tracking-wider text-charcoal-600">
                    Location Matching Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'nearby_cities', label: 'My city & nearby / NCR', desc: 'Regional metro cluster' },
                      { id: 'only_my_city', label: 'Only my city', desc: 'Strict local preference' },
                      { id: 'anywhere_india', label: 'Anywhere in India', desc: 'National scope' },
                      { id: 'remote_only', label: 'Remote only', desc: 'Work from home' },
                    ].map((mode) => {
                      const active = (preferences.locationMode || 'nearby_cities') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, locationMode: mode.id })}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                            active
                              ? 'bg-rust-50 border-rust-600 text-charcoal-900 font-semibold'
                              : 'bg-white border-[#DDD8CC] text-charcoal-700 hover:border-charcoal-400'
                          }`}
                        >
                          <div className="leading-tight">{mode.label}</div>
                          <div className="text-3xs text-charcoal-400 mt-0.5">{mode.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Willing to relocate */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={preferences.willingToRelocate !== false}
                    onChange={(e) => setPreferences({ ...preferences, willingToRelocate: e.target.checked })}
                    className="w-4 h-4 rounded text-rust-600 accent-rust-600"
                  />
                  <span className="text-xs text-charcoal-700 font-medium">
                    Willing to relocate for high-value on-site internships
                  </span>
                </label>
              </div>

              {/* 2. Contribution Style & Strengths */}
              <div className="space-y-3 p-4 bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    How do you like to contribute? (Coding vs. Ideas)
                  </h3>
                </div>
                <p className="text-2xs text-charcoal-500">
                  Select your contribution superpowers. Students who prefer ideas and problem-solving receive ideathons, case competitions, and innovation challenges.
                </p>

                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'ideas', label: 'Generating ideas & brainstorming', icon: '💡' },
                    { id: 'problem-solving', label: 'Analytical & real-world problem solving', icon: '🧩' },
                    { id: 'research', label: 'Research, market analysis & case studies', icon: '🔍' },
                    { id: 'design', label: 'UI/UX design, visuals & solution sketching', icon: '🎨' },
                    { id: 'building', label: 'Building code & technical implementation', icon: '💻' },
                    { id: 'pitching', label: 'Pitching, presentation & communication', icon: '🗣️' },
                    { id: 'coordination', label: 'Team coordination & leadership', icon: '🤝' },
                  ].map((style) => {
                    const active = (preferences.contributionStyles || []).includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          const current = preferences.contributionStyles || [];
                          const next = active ? current.filter((x) => x !== style.id) : [...current, style.id];
                          setPreferences({ ...preferences, contributionStyles: next });
                        }}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                          active
                            ? 'bg-charcoal-900 text-cream-100 border-charcoal-900 font-medium'
                            : 'bg-white text-charcoal-700 border-[#DDD8CC] hover:border-charcoal-400'
                        }`}
                      >
                        <span>{style.icon}</span>
                        <span>{style.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Compensation vs Exposure Priority */}
              <div className="space-y-3 p-4 bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚖️</span>
                  <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                    What matters most in an opportunity?
                  </h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'paid', label: 'Paid opportunities', desc: 'Stipend required' },
                    { id: 'learning', label: 'Learning & exposure', desc: 'Mentorship focus' },
                    { id: 'company_experience', label: 'Company experience', desc: 'Corporate exposure' },
                    { id: 'networking', label: 'Networking & mentors', desc: 'Industry connections' },
                    { id: 'skills', label: 'Skill development', desc: 'Practical projects' },
                    { id: 'flexible', label: 'Flexible', desc: 'Open to both' },
                  ].map((pri) => {
                    const active = (preferences.opportunityPriority || 'flexible') === pri.id;
                    return (
                      <button
                        key={pri.id}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, opportunityPriority: pri.id })}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          active
                            ? 'bg-rust-50 border-rust-600 text-charcoal-900 font-semibold'
                            : 'bg-white border-[#DDD8CC] text-charcoal-700 hover:border-charcoal-400'
                        }`}
                      >
                        <div>{pri.label}</div>
                        <div className="text-3xs text-charcoal-400 mt-0.5">{pri.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Minimum stipend input if paid priority */}
                {preferences.opportunityPriority === 'paid' && (
                  <div className="pt-2 text-xs">
                    <label className="block font-semibold text-charcoal-700 mb-1">
                      Minimum Desired Stipend (₹/month)
                    </label>
                    <input
                      type="number"
                      value={preferences.minStipend || ''}
                      onChange={(e) => setPreferences({ ...preferences, minStipend: e.target.value })}
                      placeholder="e.g. 20000"
                      className="p-2 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 w-full sm:w-48 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                )}
              </div>

              {/* Types */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                  Interested Opportunity Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OPPORTUNITY_TYPES.map((type) => {
                    const checked = preferences.opportunityTypes.includes(type.id);
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => toggleOpportunityType(type.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                          checked
                            ? 'bg-charcoal-900 text-cream-100 border-charcoal-900 shadow-sm'
                            : 'bg-[#FEFCF8] text-charcoal-700 border-[#DDD8CC] hover:bg-charcoal-100'
                        }`}
                      >
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work modes */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                  Preferred Work Modes
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {WORK_MODES.map((wm) => {
                    const checked = preferences.workModes.includes(wm.id);
                    return (
                      <button
                        type="button"
                        key={wm.id}
                        onClick={() => toggleWorkMode(wm.id)}
                        className={`px-4 py-2 rounded-xl border text-xs font-medium transition ${
                          checked
                            ? 'bg-rust-600 text-white border-rust-600 shadow-sm'
                            : 'bg-[#FEFCF8] text-charcoal-700 border-[#DDD8CC] hover:bg-charcoal-100'
                        }`}
                      >
                        {wm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Locations */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-charcoal-700">
                  Target Locations & Cities
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prefLocationInput}
                    onChange={(e) => setPrefLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrefLocation())}
                    placeholder="e.g. Delhi, Noida, Bengaluru, Remote..."
                    className="flex-1 p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                  <button
                    type="button"
                    onClick={addPrefLocation}
                    className="btn-outline text-xs px-4"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {preferences.locations?.map((loc) => (
                    <span
                      key={loc}
                      className="px-3 py-1 bg-charcoal-100 text-charcoal-800 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-charcoal-400" />
                      {loc}
                      <button
                        type="button"
                        onClick={() => removePrefLocation(loc)}
                        className="text-charcoal-400 hover:text-charcoal-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BIO & LINKS */}
          {activeTab === 'links' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Bio & Professional Links</h2>
                <p className="text-xs text-charcoal-500">
                  Provide your online presence so recruiters and opportunities can inspect your work.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Bio / Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief 2-3 sentence introduction about your background and what you are building..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-400" /> Current City / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-charcoal-400" /> Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-charcoal-800 uppercase text-2xs tracking-wider">
                    Online Portfolios & Profiles
                  </h3>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                      <GithubIcon className="w-4 h-4 text-charcoal-600" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      value={links.github}
                      onChange={(e) => setLinks({ ...links, github: e.target.value })}
                      placeholder="https://github.com/yourusername"
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                      <LinkedinIcon className="w-4 h-4 text-blue-600" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={links.linkedin}
                      onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" /> Personal Portfolio / Resume Link
                    </label>
                    <input
                      type="url"
                      value={links.portfolio}
                      onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                      placeholder="https://yourportfolio.dev"
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB — PROJECTS */}
          {activeTab === 'projects' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif text-charcoal-900">Projects</h2>
                  <p className="text-xs text-charcoal-500">Showcase your builds. Technologies listed here count toward skill matching.</p>
                </div>
                <button type="button" onClick={() => setShowProjectForm(true)} className="flex items-center gap-1.5 text-sm text-rust-600 hover:text-rust-700 font-medium">
                  <Plus className="w-4 h-4" /> Add project
                </button>
              </div>
              {showProjectForm && (
                <div className="border border-[#E8E3D8] rounded-xl p-4 space-y-3 bg-[#FEFCF8]">
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Title *</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="E-commerce Platform" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Your Role</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="Full Stack Developer" value={projectForm.role} onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })} /></div>
                    <div className="md:col-span-2"><label className="block font-semibold text-charcoal-700 mb-1">Technologies (comma-separated)</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="React, Node.js, MongoDB" value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} /></div>
                    <div className="md:col-span-2"><label className="block font-semibold text-charcoal-700 mb-1">Description</label><textarea rows={2} className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500 resize-none" placeholder="What does this project do?" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Project Link</label><input type="url" className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="https://github.com/..." value={projectForm.link} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { if (!projectForm.title.trim()) { toast.error('Title is required'); return; } const tech = projectForm.technologies.split(',').map((t) => t.trim()).filter(Boolean); setProjects([...projects, { ...projectForm, technologies: tech }]); setProjectForm({ title: '', description: '', technologies: '', link: '', role: '' }); setShowProjectForm(false); }} className="px-4 py-2 bg-rust-600 text-white rounded-lg text-sm font-medium hover:bg-rust-700">Save Project</button>
                    <button type="button" onClick={() => setShowProjectForm(false)} className="px-4 py-2 border border-[#DDD8CC] text-charcoal-600 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
              {projects.length === 0 && !showProjectForm && <p className="text-sm text-charcoal-400 italic">No projects added yet.</p>}
              {projects.map((p, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-4 border border-[#E8E3D8] rounded-xl bg-white">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-charcoal-800">{p.title}{p.role && <span className="text-charcoal-400 font-normal"> · {p.role}</span>}</p>
                    {p.description && <p className="text-xs text-charcoal-500 mt-1">{p.description}</p>}
                    {p.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{p.technologies.map((t) => <span key={t} className="px-2 py-0.5 bg-charcoal-100 text-charcoal-600 text-2xs rounded-full">{t}</span>)}</div>}
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-rust-600 hover:underline mt-1 block">View →</a>}
                  </div>
                  <button type="button" onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="text-charcoal-400 hover:text-red-500 mt-0.5"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* TAB — EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif text-charcoal-900">Work & Internship Experience</h2>
                  <p className="text-xs text-charcoal-500">Add past roles, internships, or part-time work.</p>
                </div>
                <button type="button" onClick={() => setShowExpForm(true)} className="flex items-center gap-1.5 text-sm text-rust-600 hover:text-rust-700 font-medium"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {showExpForm && (
                <div className="border border-[#E8E3D8] rounded-xl p-4 space-y-3 bg-[#FEFCF8]">
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Title *</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="Software Engineering Intern" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Company *</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="Google" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Location</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="Remote / Bangalore" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Start Date</label><input type="month" className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} /></div>
                    {!expForm.isCurrent && <div><label className="block font-semibold text-charcoal-700 mb-1">End Date</label><input type="month" className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} /></div>}
                    <div className="flex items-center gap-2 pt-5"><input type="checkbox" id="isCurrent2" checked={expForm.isCurrent} onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })} className="accent-rust-600" /><label htmlFor="isCurrent2" className="text-charcoal-700">Currently working here</label></div>
                    <div className="md:col-span-2"><label className="block font-semibold text-charcoal-700 mb-1">Description</label><textarea rows={2} className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500 resize-none" placeholder="Describe your responsibilities..." value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { if (!expForm.title.trim() || !expForm.company.trim()) { toast.error('Title and company are required'); return; } setExperience([...experience, { ...expForm }]); setExpForm({ title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }); setShowExpForm(false); }} className="px-4 py-2 bg-rust-600 text-white rounded-lg text-sm font-medium hover:bg-rust-700">Save</button>
                    <button type="button" onClick={() => setShowExpForm(false)} className="px-4 py-2 border border-[#DDD8CC] text-charcoal-600 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
              {experience.length === 0 && !showExpForm && <p className="text-sm text-charcoal-400 italic">No experience added yet.</p>}
              {experience.map((e, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-4 border border-[#E8E3D8] rounded-xl bg-white">
                  <div>
                    <p className="font-semibold text-sm text-charcoal-800">{e.title} <span className="text-charcoal-400 font-normal">@ {e.company}</span></p>
                    {e.location && <p className="text-xs text-charcoal-500">{e.location}</p>}
                    {e.startDate && <p className="text-xs text-charcoal-400 mt-0.5">{e.startDate} — {e.isCurrent ? 'Present' : e.endDate}</p>}
                    {e.description && <p className="text-xs text-charcoal-500 mt-1">{e.description}</p>}
                  </div>
                  <button type="button" onClick={() => setExperience(experience.filter((_, j) => j !== i))} className="text-charcoal-400 hover:text-red-500 mt-0.5"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* TAB — CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif text-charcoal-900">Certifications</h2>
                  <p className="text-xs text-charcoal-500">Industry certifications and online course completions.</p>
                </div>
                <button type="button" onClick={() => setShowCertForm(true)} className="flex items-center gap-1.5 text-sm text-rust-600 hover:text-rust-700 font-medium"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {showCertForm && (
                <div className="border border-[#E8E3D8] rounded-xl p-4 space-y-3 bg-[#FEFCF8]">
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Certification Name *</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="AWS Cloud Practitioner" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Issuing Organization</label><input className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="Amazon Web Services" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Date Obtained</label><input type="month" className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} /></div>
                    <div><label className="block font-semibold text-charcoal-700 mb-1">Credential URL</label><input type="url" className="w-full p-2.5 bg-white border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500" placeholder="https://..." value={certForm.credentialUrl} onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { if (!certForm.name.trim()) { toast.error('Name is required'); return; } setCertifications([...certifications, { ...certForm }]); setCertForm({ name: '', issuer: '', date: '', credentialUrl: '' }); setShowCertForm(false); }} className="px-4 py-2 bg-rust-600 text-white rounded-lg text-sm font-medium hover:bg-rust-700">Save</button>
                    <button type="button" onClick={() => setShowCertForm(false)} className="px-4 py-2 border border-[#DDD8CC] text-charcoal-600 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              )}
              {certifications.length === 0 && !showCertForm && <p className="text-sm text-charcoal-400 italic">No certifications added yet.</p>}
              {certifications.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-4 border border-[#E8E3D8] rounded-xl bg-white">
                  <div>
                    <p className="font-semibold text-sm text-charcoal-800">{c.name}</p>
                    {c.issuer && <p className="text-xs text-charcoal-500">{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>}
                    {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-rust-600 hover:underline">View credential →</a>}
                  </div>
                  <button type="button" onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} className="text-charcoal-400 hover:text-red-500 mt-0.5"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {/* TAB — RESUME */}
          {activeTab === 'resume' && (
            <div className="card p-6 space-y-5 animate-fade-in">
              <div className="border-b border-[#F0EBE1] pb-3">
                <h2 className="text-base font-serif text-charcoal-900">Resume</h2>
                <p className="text-xs text-charcoal-500">Upload your resume to extract skills. Parsed skills are shown for confirmation — nothing is added automatically.</p>
              </div>
              {!resumeFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleResumeUpload(f); }}
                  onClick={() => resumeFileRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E3D8] rounded-xl p-10 text-center cursor-pointer hover:border-charcoal-400 transition-colors bg-[#FEFCF8]"
                >
                  <input ref={resumeFileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleResumeUpload(e.target.files[0])} />
                  <Upload className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-600 font-medium mb-1">Drag & drop or click to upload</p>
                  <p className="text-charcoal-400 text-sm">PDF, DOCX, TXT · Max 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-[#E8E3D8] rounded-xl bg-white">
                    <FileText className="w-7 h-7 text-rust-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 truncate">{resumeFile.name}</p>
                      <p className="text-xs text-charcoal-400">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    {resumeUploadStatus === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-rust-600" />}
                    {resumeUploadStatus === 'done' && <Check className="w-5 h-5 text-emerald-500" />}
                    {resumeUploadStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <button type="button" onClick={() => { setResumeFile(null); setParsedResumeData(null); setConfirmedResumeSkills([]); setResumeUploadStatus(null); }} className="text-charcoal-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                  {resumeUploadStatus === 'done' && parsedResumeData?.parsedSkills?.length > 0 && (
                    <div className="border border-[#E8E3D8] rounded-xl p-4 bg-white space-y-3">
                      <p className="text-sm font-medium text-charcoal-800">Skills found — select which to add</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedResumeData.parsedSkills.map((s) => {
                          const already = skills.find((sk) => sk.skill?.toLowerCase() === s.toLowerCase());
                          const checked = confirmedResumeSkills.includes(s);
                          return (
                            <button key={s} type="button" disabled={!!already} onClick={() => !already && setConfirmedResumeSkills(checked ? confirmedResumeSkills.filter((x) => x !== s) : [...confirmedResumeSkills, s])} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${already ? 'bg-charcoal-100 text-charcoal-400 border-charcoal-200 cursor-default' : checked ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-charcoal-500 border-[#E8E3D8] hover:border-charcoal-400'}`}>
                              {already ? <><Check className="w-3 h-3" /> {s} (already added)</> : checked ? <><Check className="w-3 h-3" /> {s}</> : <><Plus className="w-3 h-3" /> {s}</>}
                            </button>
                          );
                        })}
                      </div>
                      {confirmedResumeSkills.length > 0 && (
                        <button type="button" onClick={() => { const newSkills = [...skills]; for (const s of confirmedResumeSkills) { if (!newSkills.find((sk) => sk.skill?.toLowerCase() === s.toLowerCase())) { newSkills.push({ skill: s.toLowerCase(), proficiency: 'beginner' }); } } setSkills(newSkills); setConfirmedResumeSkills([]); toast.success(`${confirmedResumeSkills.length} skill(s) added`); }} className="px-4 py-2 bg-rust-600 text-white rounded-lg text-sm font-medium hover:bg-rust-700">
                          Add {confirmedResumeSkills.length} selected skill(s) to profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sticky Save Bar */}
          <div className="flex items-center justify-between p-4 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl shadow-sm">
            <span className="text-xs text-charcoal-500">
              Save your changes to update your deterministic matching scores across all opportunities.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Profile…' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* AI Profile Suggestions Section */}
        <div className="card p-6 border-rust-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rust-600" />
              <h3 className="font-serif text-base text-charcoal-900">
                NextOpp Profile Advisor
              </h3>
            </div>
            <button
              type="button"
              onClick={fetchAiTips}
              disabled={loadingTips}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-rust-600" />
              {loadingTips ? 'Generating advice…' : 'Get Profile Improvement Tips'}
            </button>
          </div>

          <p className="text-xs text-charcoal-500">
            Analyze your profile completeness and receive personalized advice to stand out for internships and fellowships.
          </p>

          {aiTips && (
            <div className="p-4 bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl text-xs text-charcoal-800 leading-relaxed whitespace-pre-line">
              <div className="font-bold text-charcoal-900 mb-2 flex items-center justify-between">
                <span>Recommendations</span>
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full uppercase bg-charcoal-100 text-charcoal-700">
                  {aiTips.source === 'ai' ? 'Claude AI' : 'Rule Engine'}
                </span>
              </div>
              {aiTips.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
