import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, ExternalLink, Pencil, Trash2, 
  Briefcase, CheckCircle2, Clock, XCircle, Award, LayoutGrid, List, MapPin, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredJobs, saveJob, deleteStoredJob, Job } from '../lib/dataStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Textarea } from '../components/Textarea';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomSelect } from '../components/CustomSelect';



const STATUS_OPTIONS = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interviewing' },
  { value: 'Offer', label: 'Offer Received' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

export const Dashboard = () => {
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
  }, []);

  const loadJobs = () => {
    const loaded = getStoredJobs();
    setJobs(loaded);
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 w-fit whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" /> Interviewing
          </span>
        );
      case 'Offer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 w-fit whitespace-nowrap">
            <Award className="h-3.5 w-3.5 flex-shrink-0" /> Offer Received
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 w-fit whitespace-nowrap">
            <XCircle className="h-3.5 w-3.5 flex-shrink-0" /> Rejected
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-500/10 text-slate-700 dark:text-zinc-400 border border-slate-500/20 w-fit whitespace-nowrap">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 w-fit whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Finn / SimpleSpend Style Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, Demo
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Applications Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Track and manage all your job applications in one place.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Job Application
        </Button>
      </div>

      {/* SimpleSpend Bento Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Pipeline</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-[#27272a]">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Applied</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.applied}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-[#27272a]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Interviewing</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.interview}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-[#27272a]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Offers Received</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5">{stats.offer}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-slate-200 dark:border-[#27272a]">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & View Mode Controls */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title, company, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium glass-input"
            />
          </div>

          <div className="flex items-center gap-3">
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
            />


            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
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
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No applications match</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <Card hover className="h-full flex flex-col justify-between !p-6 group">
                  <div>
                    {/* Top Header: Logo + Role + Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-[#18181b] text-slate-900 dark:text-zinc-100 font-extrabold text-xs flex items-center justify-center border border-slate-200 dark:border-[#27272a] flex-shrink-0">
                          {job.company?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-base leading-snug tracking-tight">
                            {job.role}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
                            {job.company}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(job.status)}
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.salary && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" /> {job.salary}
                        </span>
                      )}
                      {job.location && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#27272a] flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" /> {job.location}
                        </span>
                      )}
                    </div>

                    {job.notes && (
                      <p className="text-sm text-slate-600 dark:text-zinc-300 line-clamp-3 leading-relaxed mb-4 font-normal">
                        {job.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                      Applied {job.applied_date}
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
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
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
        /* Clean Table View */
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Pipeline Status</th>
                  <th className="px-6 py-3.5">Compensation & Location</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {job.company?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{job.role}</div>
                          <div className="text-slate-500 dark:text-slate-400 font-bold">{job.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="font-bold text-slate-900 dark:text-slate-200">{job.salary || '—'}</div>
                      <div className="text-[11px] text-slate-400">{job.location || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">
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
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
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
            <Select
              label="Pipeline Status"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
            />
            <Input
              label="Applied Date"
              type="date"
              value={formData.applied_date}
              onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
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
