import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, ExternalLink, Pencil, Trash2, 
  Briefcase, LayoutGrid, List, MapPin, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredJobs, saveJob, deleteStoredJob, fetchJobsFromSupabase, Job } from '../lib/dataStore';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Textarea } from '../components/Textarea';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomSelect } from '../components/CustomSelect';
import { CustomDatePicker } from '../components/CustomDatePicker';



const STATUS_OPTIONS = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interviewing' },
  { value: 'Offer', label: 'Offer Received' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Custom Delete Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    status: 'Applied' as Job['status'],
    applied_date: new Date().toISOString().split('T')[0],
    job_link: '',
    notes: '',
    salary: '',
    location: '',
  });

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    const loaded = getStoredJobs();
    setJobs(loaded);

    if (user?.id) {
      const cloudJobs = await fetchJobsFromSupabase(user.id);
      if (cloudJobs) {
        setJobs(cloudJobs);
      }
    }
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        role: job.role,
        company: job.company,
        status: job.status,
        applied_date: job.applied_date,
        job_link: job.job_link || '',
        notes: job.notes || '',
        salary: job.salary || '',
        location: job.location || '',
      });
    } else {
      setEditingJob(null);
      setFormData({
        role: '',
        company: '',
        status: 'Applied',
        applied_date: new Date().toISOString().split('T')[0],
        job_link: '',
        notes: '',
        salary: '',
        location: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.company.trim()) {
      toast.error('Role Title and Company Name are required');
      return;
    }

    saveJob({
      id: editingJob?.id,
      role: formData.role.trim(),
      company: formData.company.trim(),
      status: formData.status,
      applied_date: formData.applied_date,
      job_link: formData.job_link.trim(),
      notes: formData.notes.trim(),
      salary: formData.salary.trim(),
      location: formData.location.trim(),
    });

    toast.success(editingJob ? 'Job application updated!' : 'Job application added!');
    loadJobs();
    handleCloseModal();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteStoredJob(deleteTargetId);
    toast.success('Job application deleted');
    loadJobs();
    setDeleteTargetId(null);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter((j) => j.status === 'Applied').length,
      interview: jobs.filter((j) => j.status === 'Interview').length,
      offer: jobs.filter((j) => j.status === 'Offer').length,
      rejected: jobs.filter((j) => j.status === 'Rejected').length,
    };
  }, [jobs]);

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'Interview':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 w-fit whitespace-nowrap">
            Interviewing
          </span>
        );
      case 'Offer':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit whitespace-nowrap">
            Offer Received
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 w-fit whitespace-nowrap">
            Rejected
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-500/10 text-gray-600 dark:text-[#9c9891] border border-gray-500/20 w-fit whitespace-nowrap">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 w-fit whitespace-nowrap">
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Finn-style Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-[#6b6560] uppercase tracking-widest">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-0.5">
            Applications Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-[#6b6560] mt-1">
            Track and manage all your job applications in one place.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => handleOpenModal()} className="w-full sm:w-auto justify-center">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Total — Bear red */}
        <div className="glass-card p-4 sm:p-5 overflow-hidden">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-[#9c9891] uppercase tracking-widest truncate">Total</p>
          <p className="text-3xl sm:text-4xl font-bold text-[#D7494C] mt-1.5 sm:mt-2 leading-none tabular-nums">{stats.total}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-[#6b6560] mt-1.5 sm:mt-2 truncate">Applications tracked</p>
          <div className="mt-3.5 h-[3px] w-full bg-gray-100 dark:bg-[#302d2a] rounded-full overflow-hidden">
            <div className="h-full bg-[#D7494C] rounded-full transition-all duration-500" style={{width: '100%'}} />
          </div>
        </div>

        {/* Applied — slate */}
        <div className="glass-card p-4 sm:p-5 overflow-hidden">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-[#9c9891] uppercase tracking-widest truncate">Applied</p>
          <p className="text-3xl sm:text-4xl font-bold text-slate-600 dark:text-slate-300 mt-1.5 sm:mt-2 leading-none tabular-nums">{stats.applied}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-[#6b6560] mt-1.5 sm:mt-2 truncate">Waiting on response</p>
          <div className="mt-3.5 h-[3px] w-full bg-gray-100 dark:bg-[#302d2a] rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500" style={{width: stats.total ? `${Math.round((stats.applied/stats.total)*100)}%` : '0%'}} />
          </div>
        </div>

        {/* Interviewing — amber */}
        <div className="glass-card p-4 sm:p-5 overflow-hidden">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-[#9c9891] uppercase tracking-widest truncate">Interviewing</p>
          <p className="text-3xl sm:text-4xl font-bold text-amber-500 dark:text-amber-400 mt-1.5 sm:mt-2 leading-none tabular-nums">{stats.interview}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-[#6b6560] mt-1.5 sm:mt-2 truncate">Active processes</p>
          <div className="mt-3.5 h-[3px] w-full bg-gray-100 dark:bg-[#302d2a] rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{width: stats.total ? `${Math.round((stats.interview/stats.total)*100)}%` : '0%'}} />
          </div>
        </div>

        {/* Offers — emerald */}
        <div className="glass-card p-4 sm:p-5 overflow-hidden">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-[#9c9891] uppercase tracking-widest truncate">Offers</p>
          <p className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 sm:mt-2 leading-none tabular-nums">{stats.offer}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-[#6b6560] mt-1.5 sm:mt-2 truncate">Received so far</p>
          <div className="mt-3.5 h-[3px] w-full bg-gray-100 dark:bg-[#302d2a] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{width: stats.total ? `${Math.round((stats.offer/stats.total)*100)}%` : '0%'}} />
          </div>
        </div>

      </div>


      {/* Filter & View Mode Controls */}
      <Card className="!p-3.5 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role title, company, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* Custom Status Filter Dropdown */}
            <CustomSelect
              options={[
                { value: 'all', label: `All Statuses (${jobs.length})` },
                { value: 'Applied', label: `Applied (${stats.applied})` },
                { value: 'Interview', label: `Interviewing (${stats.interview})` },
                { value: 'Offer', label: `Offer Received (${stats.offer})` },
                { value: 'Rejected', label: `Rejected (${stats.rejected})` },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              size="sm"
              align="right"
            />

            {/* View Mode Toggle (Hidden on mobile & tablet for clean card presentation) */}
            <div className="hidden lg:flex items-center bg-gray-100 dark:bg-[#2e2b28] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e05c5f] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e05c5f] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {filteredJobs.length === 0 ? (
        <Card className="!p-12 text-center border-dashed">
          <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#d4cfc6]">No applications match</h3>
          <p className="text-sm text-slate-500 dark:text-[#9c9891] mt-1">
            {jobs.length === 0
              ? 'Start tracking your applications by adding your first job!'
              : 'No applications match your current search or status filters.'}
          </p>
          <div className="mt-5">
            <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Job Application
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Clean Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <Card hover className="h-full flex flex-col justify-between !p-5 group">
                  <div>
                    {/* Top Header: Logo + Role + Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-xl bg-[#FEF2F2] dark:bg-[#D7494C]/12 text-[#C43538] dark:text-[#e05c5f] font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {job.company?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-[#e8e3d9] text-base leading-snug">
                            {job.role}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-[#9c9891] mt-0.5">
                            {job.company}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(job.status)}
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.salary && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#2e2b28] text-gray-600 dark:text-[#9c9891] border border-gray-200 dark:border-[#3a3733] flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" /> {job.salary}
                        </span>
                      )}
                      {job.location && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#2e2b28] text-gray-600 dark:text-[#9c9891] border border-gray-200 dark:border-[#3a3733] flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" /> {job.location}
                        </span>
                      )}
                    </div>

                    {job.notes && (
                      <p className="text-sm text-gray-500 dark:text-[#9c9891] line-clamp-2 leading-relaxed mb-3">
                        {job.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-gray-100 dark:border-[#3a3733] flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-[#6b6560]">
                      {job.applied_date}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {job.job_link && (
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="Open Job Posting"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenModal(job)}
                        className="p-1.5 text-slate-400 hover:text-[#D7494C] hover:bg-[#FEF2F2] dark:hover:bg-[#D7494C]/15 rounded-lg transition-colors"
                        title="Edit Application"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(job.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Clean Table View (Desktop Only) */
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-[#1c1917] border-b border-gray-100 dark:border-[#3a3733] text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Compensation & Location</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#252837] font-medium">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-[#302d2a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#FEF2F2] dark:bg-[#D7494C]/12 text-[#C43538] dark:text-[#e05c5f] font-semibold text-xs flex items-center justify-center">
                          {job.company?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{job.role}</div>
                          <div className="text-gray-500 dark:text-[#9c9891] text-xs mt-0.5">{job.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-[#d4cfc6] text-sm">{job.salary || '—'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{job.location || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#9c9891] text-sm">
                      {job.applied_date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.job_link && (
                          <a
                            href={job.job_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenModal(job)}
                          className="p-1.5 text-slate-400 hover:text-[#D7494C] hover:bg-[#FEF2F2] dark:hover:bg-[#D7494C]/15 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingJob ? 'Edit Job Application' : 'Add Job Application'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Title *"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
            <Input
              label="Company Name *"
              placeholder="e.g. Stripe"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-[#d4cfc6]">
                Pipeline Status
              </label>
              <CustomSelect
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val as Job['status'] })}
                className="w-full"
              />
            </div>
            <CustomDatePicker
              label="Applied Date"
              value={formData.applied_date}
              onChange={(val) => setFormData({ ...formData, applied_date: val })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Compensation / Salary Range"
              placeholder="e.g. $185,000 + Equity"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA (or Remote)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <Input
            label="Job Listing URL"
            type="url"
            placeholder="https://company.careers/job/123"
            value={formData.job_link}
            onChange={(e) => setFormData({ ...formData, job_link: e.target.value })}
          />

          <Textarea
            label="Notes & Recruiter Contact"
            placeholder="Key notes, interviewer names, salary details, or follow-up dates..."
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingJob ? 'Update Application' : 'Add Application'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Deletion Confirmation Dialog (Replaces native window.confirm) */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message="Are you sure you want to delete this job application? This action cannot be undone."
        confirmText="Delete Application"
      />
    </div>
  );
};
