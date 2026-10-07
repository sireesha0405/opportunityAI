import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  Plus,
  X,
  Building,
  GraduationCap,
  MapPin,
  Sparkles,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<StudentProfile>(
    user?.profile || {
      college: 'Global Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      academic_year: '3rd Year',
      cgpa: 8.5,
      graduation_year: 2026,
      technical_skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
      soft_skills: ['Problem Solving', 'Team Collaboration'],
      areas_of_interest: ['Web Development', 'Artificial Intelligence', 'Cloud'],
      career_goals: 'Seeking Software Engineering Internship',
      preferred_categories: ['Internship', 'Hackathon', 'Scholarship'],
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      work_mode_preference: 'Remote',
      preferred_radius_km: 50,
      onboarding_completed: true,
    }
  );

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
    }
  }, [user]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newSkill.trim() && !profile.technical_skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        technical_skills: [...profile.technical_skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      technical_skills: profile.technical_skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.areas_of_interest.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        areas_of_interest: [...profile.areas_of_interest, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile({
      ...profile,
      areas_of_interest: profile.areas_of_interest.filter((i) => i !== interest),
    });
  };

  const toggleCategory = (cat: string) => {
    if (profile.preferred_categories.includes(cat)) {
      setProfile({
        ...profile,
        preferred_categories: profile.preferred_categories.filter((c) => c !== cat),
      });
    } else {
      setProfile({
        ...profile,
        preferred_categories: [...profile.preferred_categories, cat],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const allCategories = [
    'Internship',
    'Hackathon',
    'Scholarship',
    'Fellowship',
    'Competition',
    'Workshop',
    'Certification',
    'Research Program',
    'Entry-level Job',
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-500" />
            <span>My Student Profile & Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep your skills and academic profile up to date to get precisely matched recommendations.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Saved & Recommendations Updated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Details Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Academic Background & Degree</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">College / University</label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Degree Program</label>
              <input
                type="text"
                value={profile.degree || ''}
                placeholder="e.g. B.Tech, B.E., BCA, MCA, M.Tech"
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Major / Branch</label>
              <input
                type="text"
                value={profile.branch || ''}
                placeholder="e.g. Computer Science and Engineering"
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Academic Year</label>
                <select
                  value={profile.academic_year || '3rd Year'}
                  onChange={(e) => setProfile({ ...profile, academic_year: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">CGPA / Percentage</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={profile.cgpa ?? ''}
                  onChange={(e) =>
                    setProfile({ ...profile, cgpa: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technical & Soft Skills Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Technical Skills & Competencies</span>
          </h3>

          <p className="text-xs text-slate-400">
            Add your primary programming languages, frameworks, cloud platforms, and developer tooling:
          </p>

          <div className="flex flex-wrap gap-2">
            {profile.technical_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
              placeholder="e.g. Docker, TypeScript, PyTorch, AWS..."
              className="flex-1 text-xs rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Career Interests & Target Categories */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Opportunity Category Preferences</span>
          </h3>

          <p className="text-xs text-slate-400">
            Select the types of opportunities you want our recommendation algorithm to prioritize:
          </p>

          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const selected = profile.preferred_categories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {selected ? '✓ ' : '+ '} {cat}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Career Goal Statement</label>
            <input
              type="text"
              value={profile.career_goals || ''}
              onChange={(e) => setProfile({ ...profile, career_goals: e.target.value })}
              placeholder="e.g. Seeking a Software Engineering or AI research internship to build real-world systems"
              className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Location & Work Mode Preferences */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Location & Work-Mode Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Home City</label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Work Mode Preference</label>
              <select
                value={profile.work_mode_preference || 'Remote'}
                onChange={(e) => setProfile({ ...profile, work_mode_preference: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
              >
                <option value="Any">Any Mode</option>
                <option value="Remote">Remote Preferred</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Max Commute Range: {profile.preferred_radius_km || 50} km
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={profile.preferred_radius_km || 50}
                onChange={(e) =>
                  setProfile({ ...profile, preferred_radius_km: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500 mt-2 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
