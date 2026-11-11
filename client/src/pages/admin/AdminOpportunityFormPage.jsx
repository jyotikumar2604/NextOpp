import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesAPI } from '../../api';
import { TagInput } from '../../components/ui/SharedComponents';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'internship', label: 'Internship' },
  { id: 'job', label: 'Full-time Job' },
  { id: 'scholarship', label: 'Scholarship' },
  { id: 'hackathon', label: 'Hackathon' },
  { id: 'fellowship', label: 'Fellowship' },
  { id: 'research', label: 'Research' },
  { id: 'competition', label: 'Competition' },
];

const WORK_MODES = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site' },
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'];

export default function AdminOpportunityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'internship',
    workMode: 'remote',
    location: '',
    compensation: '',
    compensationNumeric: '',
    isPaid: true,
    duration: '',
    deadline: '',
    startDate: '',
    applicationUrl: '',
    sourceUrl: '',
    description: '',
    responsibilities: '',
    requiredSkills: [],
    preferredSkills: [],
    tags: [],
    benefits: '',
    status: 'published',
    isVerified: true,
    isFeatured: false,
    eligibility: {
      minGPA: '',
      gpaScale: 10,
      academicYears: [],
      graduationYearMin: '',
      graduationYearMax: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      async function loadOpportunity() {
        setLoading(true);
        try {
          const res = await opportunitiesAPI.get(id);
          if (res.success && res.opportunity) {
            const opp = res.opportunity;
            setFormData({
              title: opp.title || '',
              organization: opp.organization || '',
              category: opp.category || 'internship',
              workMode: opp.workMode || 'remote',
              location: opp.location || '',
              compensation: opp.compensation || '',
              compensationNumeric: opp.compensationNumeric != null ? opp.compensationNumeric : '',
              isPaid: opp.isPaid ?? true,
              duration: opp.duration || '',
              deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
              startDate: opp.startDate ? opp.startDate.split('T')[0] : '',
              applicationUrl: opp.applicationUrl || '',
              sourceUrl: opp.sourceUrl || '',
              description: opp.description || '',
              responsibilities: (opp.responsibilities || []).join('\n'),
              requiredSkills: opp.requiredSkills || [],
              preferredSkills: opp.preferredSkills || [],
              tags: opp.tags || [],
              benefits: (opp.benefits || []).join(', '),
              status: opp.status || 'published',
              isVerified: opp.isVerified ?? true,
              isFeatured: opp.isFeatured ?? false,
              eligibility: {
                minGPA: opp.eligibility?.minGPA != null ? opp.eligibility.minGPA : '',
                gpaScale: opp.eligibility?.gpaScale || 10,
                academicYears: opp.eligibility?.academicYears || [],
                graduationYearMin: opp.eligibility?.graduationYearMin != null ? opp.eligibility.graduationYearMin : '',
                graduationYearMax: opp.eligibility?.graduationYearMax != null ? opp.eligibility.graduationYearMax : '',
              },
            });
          }
        } catch (err) {
          toast.error(err.message || 'Failed to load opportunity');
        } finally {
          setLoading(false);
        }
      }
      loadOpportunity();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.organization) {
      toast.error('Title and Organization are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        compensationNumeric: formData.compensationNumeric !== '' ? Number(formData.compensationNumeric) : undefined,
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
          : [],
        benefits: formData.benefits
          ? formData.benefits.split(',').map((b) => b.trim()).filter(Boolean)
          : [],
        eligibility: {
          ...formData.eligibility,
          minGPA: formData.eligibility.minGPA !== '' ? Number(formData.eligibility.minGPA) : undefined,
          gpaScale: Number(formData.eligibility.gpaScale) || 10,
          graduationYearMin: formData.eligibility.graduationYearMin !== '' ? Number(formData.eligibility.graduationYearMin) : undefined,
          graduationYearMax: formData.eligibility.graduationYearMax !== '' ? Number(formData.eligibility.graduationYearMax) : undefined,
        },
      };

      if (isEdit) {
        await opportunitiesAPI.update(id, payload);
        toast.success('Opportunity updated successfully');
      } else {
        await opportunitiesAPI.create(payload);
        toast.success('Opportunity published successfully');
      }
      navigate('/admin/opportunities');
    } catch (err) {
      toast.error(err.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const toggleAcademicYear = (yr) => {
    const years = formData.eligibility.academicYears.includes(yr)
      ? formData.eligibility.academicYears.filter((y) => y !== yr)
      : [...formData.eligibility.academicYears, yr];
    setFormData({
      ...formData,
      eligibility: { ...formData.eligibility, academicYears: years },
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-2 border-charcoal-700 border-t-rust-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-6">
        <div>
          <button
            onClick={() => navigate('/admin/opportunities')}
            className="flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 font-medium mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to listings
          </button>
          <h1 className="text-2xl font-serif text-charcoal-900 tracking-tight">
            {isEdit ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Details */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-serif font-semibold text-charcoal-900 border-b border-[#F0EBE1] pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal-700 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Software Engineering Intern — Summer 2026"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Organization / Company *
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. Google, Microsoft, NextOpp Labs..."
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500 font-medium"
              >
                {WORK_MODES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore, India (or Remote)"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>
          </div>
        </div>

        {/* Compensation & Dates */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-serif font-semibold text-charcoal-900 border-b border-[#F0EBE1] pb-2">
            Compensation, Timeline & Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Compensation Label
              </label>
              <input
                type="text"
                value={formData.compensation}
                onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                placeholder="e.g. ₹50,000/month or $2,000"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 3 months, 6 months"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-charcoal-700 mb-1">
                Official Application URL *
              </label>
              <input
                type="url"
                required
                value={formData.applicationUrl}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                placeholder="https://company.com/jobs/apply"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500 uppercase font-bold"
              >
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description & Responsibilities */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-serif font-semibold text-charcoal-900 border-b border-[#F0EBE1] pb-2">
            Description & Key Tasks
          </h2>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Opportunity Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive summary of what this role entails..."
              className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Responsibilities (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="Build modular React components&#10;Design performant MongoDB queries&#10;Collaborate with cross-functional engineers"
              className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
            />
          </div>
        </div>

        {/* Skills & Eligibility Requirements */}
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-serif font-semibold text-charcoal-900 border-b border-[#F0EBE1] pb-2">
            Skills & Eligibility Criteria
          </h2>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Required Skills (Crucial for matching algorithm)
            </label>
            <TagInput
              tags={formData.requiredSkills}
              onChange={(skills) => setFormData({ ...formData, requiredSkills: skills })}
              placeholder="Type skill and press enter (e.g. javascript, react, python)..."
            />
          </div>

          <div>
            <label className="block font-semibold text-charcoal-700 mb-1">
              Preferred / Nice-to-Have Skills
            </label>
            <TagInput
              tags={formData.preferredSkills}
              onChange={(skills) => setFormData({ ...formData, preferredSkills: skills })}
              placeholder="Type bonus skills (e.g. docker, aws, figma)..."
            />
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] space-y-3">
            <label className="block font-semibold text-charcoal-700">
              Eligible Academic Years
            </label>
            <div className="flex flex-wrap gap-2">
              {ACADEMIC_YEARS.map((yr) => {
                const checked = formData.eligibility.academicYears.includes(yr);
                return (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => toggleAcademicYear(yr)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      checked
                        ? 'bg-charcoal-900 text-cream-100 border-charcoal-900'
                        : 'bg-[#FEFCF8] text-charcoal-600 border-[#DDD8CC]'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Minimum Required GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.eligibility.minGPA}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, minGPA: e.target.value },
                  })
                }
                placeholder="e.g. 7.5"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Perks & Benefits (comma separated)
              </label>
              <input
                type="text"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="e.g. Mentorship, Return offer, Health insurance"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/opportunities" className="btn-outline px-5 py-2.5">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-2.5 flex items-center gap-2 font-semibold"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Listing…' : isEdit ? 'Update Opportunity' : 'Publish Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}

