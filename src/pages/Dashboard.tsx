import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';

interface Job {
  id: string;
  role: string;
  company: string;
  status: string;
  applied_date: string;
  job_link: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    job_link: '',
    notes: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, statusFilter]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('applied_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        role: job.role,
        company: job.company,
        status: job.status,
        applied_date: job.applied_date,
        job_link: job.job_link,
        notes: job.notes,
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
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role.trim() || !formData.company.trim()) {
      toast.error('Role and Company are required');
      return;
    }

    try {
      if (editingJob) {
        const { error } = await supabase
          .from('jobs')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success('Job updated successfully');
      } else {
        const { error } = await supabase.from('jobs').insert([
          {
            ...formData,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success('Job added successfully');
      }

      handleCloseModal();
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);

      if (error) throw error;
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error('Failed to delete job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-700';
      case 'Interview':
        return 'bg-yellow-100 text-yellow-700';
      case 'Offer':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Withdrawn':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === 'Applied').length,
    interview: jobs.filter((j) => j.status === 'Interview').length,
    offer: jobs.filter((j) => j.status === 'Offer').length,
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">Track and manage your job applications</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-5 w-5" />
            Add Job
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Applications</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Applied</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">{stats.applied}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Interviews</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.interview}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Offers</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{stats.offer}</div>
          </Card>
        </div>

        <Card className="mb-8 p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by role or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              {jobs.length === 0
                ? 'No jobs yet. Click "Add Job" to get started!'
                : 'No jobs match your search criteria.'}
            </p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{job.role}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{job.company}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(job.applied_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {job.job_link && (
                            <a
                              href={job.job_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenModal(job)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingJob ? 'Edit Job' : 'Add New Job'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Role"
              placeholder="Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
            <Input
              label="Company"
              placeholder="Tech Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Input
              type="date"
              label="Applied Date"
              value={formData.applied_date}
              onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
            />
          </div>

          <Input
            label="Job Link"
            type="url"
            placeholder="https://example.com/job"
            value={formData.job_link}
            onChange={(e) => setFormData({ ...formData, job_link: e.target.value })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={4}
              placeholder="Add any notes about this application..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editingJob ? 'Update' : 'Add'} Job</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
