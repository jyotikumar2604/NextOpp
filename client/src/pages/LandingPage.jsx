import { Link } from 'react-router-dom';
import {
  Briefcase, ArrowRight, Compass, BarChart3, CheckCircle2,
  Bookmark, ClipboardList, Star, Zap, Users, Target, ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Internships', emoji: '💼', desc: 'Real-world experience' },
  { name: 'Fellowships', emoji: '🔬', desc: 'Research & leadership' },
  { name: 'Scholarships', emoji: '🎓', desc: 'Financial support' },
  { name: 'Hackathons', emoji: '⚡', desc: 'Build & compete' },
  { name: 'Research', emoji: '📊', desc: 'Academic opportunities' },
  { name: 'Competitions', emoji: '🏆', desc: 'Showcase your work' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Build your profile',
    desc: 'Add your skills, education, career interests, and work mode preferences.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Discover opportunities',
    desc: 'Search and filter across internships, scholarships, fellowships, and more.',
    icon: Compass,
  },
  {
    step: '03',
    title: 'See your match score',
    desc: 'Every opportunity is scored against your profile using a transparent engine.',
    icon: BarChart3,
  },
  {
    step: '04',
    title: 'Fix the gaps',
    desc: 'Understand missing skills and get AI-powered guidance on what to learn next.',
    icon: Target,
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Intelligent matching',
    desc: 'A deterministic engine scores every opportunity against your skills, education, and career interests.',
  },
  {
    icon: Target,
    title: 'Skill gap analysis',
    desc: 'Know exactly which skills you\'re missing and get personalized learning recommendations.',
  },
  {
    icon: Bookmark,
    title: 'Save & track',
    desc: 'Bookmark opportunities and manage your applications with a full Kanban board.',
  },
  {
    icon: Zap,
    title: 'AI-powered insights',
    desc: 'Claude explains why you match an opportunity and how to strengthen your profile.',
  },
  {
    icon: CheckCircle2,
    title: 'Eligibility checks',
    desc: 'Instantly know if you meet GPA, academic year, and degree requirements.',
  },
  {
    icon: ClipboardList,
    title: 'Application tracker',
    desc: 'Track your applications from submission through offer with full status history.',
  },
];

const SAMPLE_OPPORTUNITIES = [
  {
    title: 'Software Engineering Intern — Summer 2025',
    org: 'TechCorp Solutions',
    category: 'Internship',
    catClass: 'cat-internship',
    match: 89,
    deadline: '30 days',
    skills: ['React', 'Node.js', 'MongoDB'],
    compensation: '₹50,000/mo',
    mode: 'Hybrid',
  },
  {
    title: 'Research Fellowship in AI Safety',
    org: 'AI Research Institute',
    category: 'Fellowship',
    catClass: 'cat-fellowship',
    match: 76,
    deadline: '25 days',
    skills: ['Python', 'ML', 'Deep Learning'],
    compensation: '₹60,000/mo',
    mode: 'Remote',
  },
  {
    title: 'Merit Excellence Scholarship 2025',
    org: 'National Education Foundation',
    category: 'Scholarship',
    catClass: 'cat-scholarship',
    match: 92,
    deadline: '60 days',
    skills: [],
    compensation: '₹1,00,000/yr',
    mode: '',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-[#E8E3D8]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-charcoal-900 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-cream-100" />
            </div>
            <span className="font-serif text-xl text-charcoal-900">NextOpp</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-charcoal-600 hover:text-charcoal-900 transition-base">How it works</a>
            <a href="#features" className="text-sm text-charcoal-600 hover:text-charcoal-900 transition-base">Features</a>
            <a href="#opportunities" className="text-sm text-charcoal-600 hover:text-charcoal-900 transition-base">Opportunities</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm hidden md:flex">Log in</Link>
            <Link to="/register" className="btn-accent btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rust-50 border border-rust-200 rounded-full text-xs font-medium text-rust-700 mb-8">
              <Star className="w-3 h-3" />
              Opportunity intelligence for students
            </div>

            <h1 className="font-serif text-5xl md:text-6xl text-charcoal-900 leading-[1.08] mb-6 text-balance">
              Find the role.<br />
              Fix the gaps.<br />
              <em className="text-rust-600 not-italic">Make your move.</em>
            </h1>

            <p className="text-lg text-charcoal-600 mb-8 leading-relaxed max-w-md">
              NextOpp brings every opportunity — internships, scholarships, fellowships, hackathons — into one intelligent platform that understands your profile and shows you exactly where you stand.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-accent btn-lg group">
                Start for free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/explore" className="btn-outline btn-lg">
                Browse opportunities
              </Link>
            </div>

            <p className="text-xs text-charcoal-400 mt-5">No credit card required. 100% free for students.</p>
          </div>

          {/* Hero opportunity preview */}
          <div className="hidden md:block animate-slide-up">
            <div className="card p-6 shadow-card-hover relative">
              {/* Featured badge */}
              <div className="absolute -top-3 left-6 px-3 py-1 bg-charcoal-900 text-cream-100 text-xs font-medium rounded-full">
                Today's Top Match
              </div>

              <div className="flex items-start justify-between mb-4 mt-2">
                <div>
                  <span className="badge cat-internship border mb-2">💼 Internship</span>
                  <h3 className="text-base font-semibold text-charcoal-900">Software Engineering Intern</h3>
                  <p className="text-sm text-charcoal-500">TechCorp Solutions</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-lg">89</span>
                  </div>
                  <span className="text-2xs text-emerald-600 font-medium mt-1">Strong match</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-charcoal-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>You have 4/5 required skills</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>GPA meets minimum requirement</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span>Missing: TypeScript</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn-primary flex-1 text-sm py-2">Apply Now</button>
                <button className="btn-outline px-3 py-2">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { n: '200+', l: 'Opportunities' },
                { n: '7', l: 'Categories' },
                { n: 'AI', l: 'Powered' },
              ].map(({ n, l }) => (
                <div key={l} className="card p-3 text-center">
                  <div className="text-xl font-serif font-semibold text-charcoal-900">{n}</div>
                  <div className="text-xs text-charcoal-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#FEFCF8] border-y border-[#E8E3D8] py-14">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-serif text-2xl text-charcoal-900 mb-8 text-center">
            Every opportunity, one platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, emoji, desc }) => (
              <Link
                key={name}
                to={`/explore?category=${name.toLowerCase()}`}
                className="card-hover p-4 text-center group"
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-sm font-semibold text-charcoal-800 mb-0.5">{name}</div>
                <div className="text-xs text-charcoal-400">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl text-charcoal-900 mb-3">How NextOpp works</h2>
          <p className="text-charcoal-500 max-w-xl mx-auto">
            From building your profile to landing your opportunity — a clear, intelligent path.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="relative">
              <div className="font-serif text-5xl text-[#E8E3D8] font-bold mb-4 leading-none">{step}</div>
              <div className="w-10 h-10 bg-charcoal-900 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-cream-100" />
              </div>
              <h3 className="font-semibold text-charcoal-900 mb-2">{title}</h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunity preview */}
      <section id="opportunities" className="bg-charcoal-900 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl text-cream-100 mb-2">Featured opportunities</h2>
              <p className="text-charcoal-400">A sample of what awaits you on NextOpp.</p>
            </div>
            <Link to="/explore" className="btn-outline border-charcoal-600 text-cream-200 hover:border-charcoal-400 hidden md:flex">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {SAMPLE_OPPORTUNITIES.map((opp) => (
              <div key={opp.title} className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge border ${opp.catClass} text-xs`}>{opp.category}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{opp.match}</div>
                    <div className="text-2xs text-charcoal-400">match</div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-cream-100 mb-1 line-clamp-2">{opp.title}</h3>
                <p className="text-xs text-charcoal-400 mb-3">{opp.org}</p>
                {opp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opp.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-charcoal-700 text-charcoal-300 text-2xs rounded-full">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-xs text-charcoal-400 border-t border-charcoal-700 pt-3">
                  <span>{opp.compensation}</span>
                  <span>Closes in {opp.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl text-charcoal-900 mb-3">Everything you need</h2>
          <p className="text-charcoal-500 max-w-xl mx-auto">
            Not just a job board. A complete career-readiness intelligence platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="w-10 h-10 bg-charcoal-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-charcoal-700" />
              </div>
              <h3 className="font-semibold text-charcoal-900 mb-2">{title}</h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#FEFCF8] border-t border-[#E8E3D8]">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="w-14 h-14 bg-charcoal-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-7 h-7 text-cream-100" />
          </div>
          <h2 className="font-serif text-4xl text-charcoal-900 mb-4 text-balance">
            Your next opportunity is already out there
          </h2>
          <p className="text-charcoal-500 mb-8 leading-relaxed">
            Thousands of students are discovering their best opportunities on NextOpp. Join them — it's free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-accent btn-lg">
              Create your free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-outline btn-lg">Sign in</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E3D8] py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-charcoal-900 rounded flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-cream-100" />
            </div>
            <span className="font-serif text-charcoal-900">NextOpp</span>
          </div>
          <p className="text-xs text-charcoal-400 text-center">
            "Find the role. Fix the gaps. Make your move." — Built for students, by students.
          </p>
          <div className="flex gap-4 text-xs text-charcoal-400">
            <Link to="/explore" className="hover:text-charcoal-700">Explore</Link>
            <Link to="/register" className="hover:text-charcoal-700">Sign up</Link>
            <Link to="/login" className="hover:text-charcoal-700">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
