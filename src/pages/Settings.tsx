import React, { useState, useEffect } from 'react';
import { 
  User, Palette, Save, AlertTriangle, Download, 
  Moon, Sun, ShieldCheck, Check, Database, HardDriveDownload
} from 'lucide-react';
import toast from 'react-hot-toast';


import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredJobs, getStoredPrepItems } from '../lib/dataStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmModal } from '../components/ConfirmModal';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'data' | 'danger'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    target_role: 'Senior Software Engineer',
    target_location: 'San Francisco, CA / Remote',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile((prev) => ({
          ...prev,
          full_name: data.full_name || 'Demo User',
          email: data.email || user.email || 'demo@example.com',
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          full_name: 'Demo User',
          email: user.email || 'demo@example.com',
        }));
      }
    } catch {
      setProfile((prev) => ({
        ...prev,
        full_name: 'Demo User',
        email: user?.email || 'demo@example.com',
      }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.success('Settings saved to session profile');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const jobs = getStoredJobs();
      const prepItems = getStoredPrepItems();
      const backupData = {
        exported_at: new Date().toISOString(),
        user_profile: profile,
        applications: jobs,
        prep_documents: prepItems,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CareerCraft_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Backup JSON exported successfully!');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Role', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-2">
      {/* Header Banner */}
      <div>
        <span className="text-[11px] font-extrabold text-slate-400 dark:text-[#6b6560] uppercase tracking-widest block">
          PREFERENCES & CONTROLS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9c9891] font-medium mt-1">
          Manage your account profile, theme preferences, and data backups.
        </p>
      </div>

      {/* Modern Top Horizontal Segmented Tab Bar (Snug Inline Fit) */}
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-[#242120] border border-slate-200/80 dark:border-[#3a3733] rounded-2xl max-w-full overflow-x-auto scrollbar-none">

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? tab.danger
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#302d2a] text-gray-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-[#3a3733]'
                  : tab.danger
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                  : 'text-slate-600 dark:text-[#9c9891] hover:bg-slate-200/50 dark:hover:bg-[#302d2a]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Settings Card Panel */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <Card className="!p-6 sm:!p-8 space-y-6 bg-white dark:bg-[#242120] border border-slate-200 dark:border-[#3a3733] shadow-sm rounded-2xl">
            {/* Profile Avatar & Info Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-[#3a3733]">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#D7494C] text-white flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
                  {profile.full_name.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {profile.full_name || 'Demo User'}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-[#9c9891] mt-0.5">
                    {profile.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[#6b6560]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[#6b6560]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl text-sm bg-gray-100 dark:bg-[#242120] text-gray-400 dark:text-[#6b6560] border border-gray-200 dark:border-[#3a3733] cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[#6b6560]">
                    Target Role Title
                  </label>
                  <input
                    type="text"
                    value={profile.target_role}
                    onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-[#6b6560]">
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={profile.target_location}
                    onChange={(e) => setProfile({ ...profile, target_location: e.target.value })}
                    placeholder="e.g. San Francisco / Remote"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-[#3a3733]">
                <Button type="submit" variant="primary" isLoading={isLoading} size="md">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'appearance' && (
          <Card className="!p-6 sm:!p-8 space-y-6 bg-white dark:bg-[#242120] border border-slate-200 dark:border-[#3a3733] shadow-sm rounded-2xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance & Theme
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9c9891] font-medium mt-0.5">
                Select your visual interface mode for CareerCraft.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Theme Option */}
              <div
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  theme === 'dark'
                    ? 'bg-[#302d2a] border-[#D7494C] ring-2 ring-[#D7494C]/20 shadow-sm'
                    : 'bg-gray-50 dark:bg-[#302d2a]/50 border-gray-200 dark:border-[#3a3733] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-[#1c1917] text-[#e8e3d9] border border-[#3a3733] flex items-center justify-center shadow-xs">
                    <Moon className="h-5 w-5" />
                  </div>
                  {theme === 'dark' && <Check className="h-5 w-5 text-[#D7494C] font-bold" />}
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-[#e8e3d9] mt-4">
                  Dark Mode
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#9c9891] mt-1 leading-relaxed">
                  Deep warm charcoal dark mode designed for high contrast and seamless focus.
                </p>
              </div>

              {/* Light Theme Option */}
              <div
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  theme === 'light'
                    ? 'bg-amber-50/40 dark:bg-[#302d2a] border-[#D7494C] ring-2 ring-[#D7494C]/20 shadow-sm'
                    : 'bg-gray-50 dark:bg-[#302d2a]/50 border-gray-200 dark:border-[#3a3733] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-center shadow-xs">
                    <Sun className="h-5 w-5" />
                  </div>
                  {theme === 'light' && <Check className="h-5 w-5 text-[#D7494C] font-bold" />}
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-[#e8e3d9] mt-4">
                  Light Mode
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#9c9891] mt-1 leading-relaxed">
                  Clean monochrome light interface with clear typography.
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'data' && (
          <Card className="!p-6 sm:!p-8 space-y-6 bg-white dark:bg-[#242120] border border-slate-200 dark:border-[#3a3733] shadow-sm rounded-2xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Backup & Export
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9c9891] font-medium mt-0.5">
                Export and save an offline JSON file containing all your applications and notes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#2e2b28] border border-slate-200/80 dark:border-[#3a3733] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FEF2F2] dark:bg-[#D7494C]/12 text-[#D7494C] dark:text-[#e05c5f] border border-[#D7494C]/20 dark:border-[#D7494C]/20 flex items-center justify-center flex-shrink-0">
                  <HardDriveDownload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Export Backup (JSON)
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-[#9c9891] font-medium mt-0.5">
                    Includes all job listings, status tags, STAR stories, and preparation documentation.
                  </p>
                </div>
              </div>

              <Button variant="secondary" size="md" onClick={handleExportData} className="whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'danger' && (
          <Card className="!p-6 sm:!p-8 space-y-6 bg-white dark:bg-[#242120] border border-rose-200/80 dark:border-rose-900/40 shadow-sm rounded-2xl">
            <div>
              <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                Danger Zone
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9c9891] font-medium mt-0.5">
                Irreversible actions for your workspace.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Reset Local Workspace Data
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#9c9891] font-medium mt-0.5">
                  Wipe local data state and restore initial seed applications and prep stories.
                </p>
              </div>

              <Button
                variant="danger"
                size="md"
                onClick={() => setShowDeleteModal(true)}
                className="whitespace-nowrap"
              >
                Reset Workspace
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          localStorage.clear();
          toast.success('Workspace reset to initial demo state!');
          setTimeout(() => window.location.reload(), 1000);
        }}
        title="Reset Workspace Data"
        message="Are you sure you want to reset your local workspace? All unsaved local data will be restored to initial defaults."
        confirmText="Reset Workspace"
      />
    </div>
  );
};
