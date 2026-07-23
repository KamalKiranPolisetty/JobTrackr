// Persistent Data Store with Supabase Cloud Sync & Local Storage Cache for JobTrackr
import { supabase, isSupabaseConfigured, Database } from './supabase';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type PrepItemRow = Database['public']['Tables']['prep_items']['Row'];

export interface Job {
  id: string;
  role: string;
  company: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  applied_date: string;
  job_link: string;
  notes: string;
  salary?: string;
  location?: string;
  created_at: string;
}

export interface PrepItem {
  id: string;
  folder_id: string;
  type: 'story' | 'note';
  title: string;
  category: 'Behavioral' | 'Technical' | 'System Design';
  situation: string;
  task: string;
  action: string;
  result: string;
  content: string;
  pinned?: boolean;
  updated_at: string;
}

const JOBS_STORAGE_KEY = 'jobtrackr_jobs_v3';
const PREP_ITEMS_STORAGE_KEY = 'jobtrackr_prep_items_v3';

// Clean initial empty defaults for production
const INITIAL_JOBS: Job[] = [];
const INITIAL_PREP_ITEMS: PrepItem[] = [];

// ========================================================
// LOCAL STORAGE HANDLERS
// ========================================================

export const getStoredJobs = (): Job[] => {
  try {
    const data = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_JOBS;
  }
};

export const saveJob = (job: Partial<Job> & { role: string; company: string }): Job => {
  const jobs = getStoredJobs();
  let updatedJob: Job | null = null;

  if (job.id) {
    jobs.forEach((j, idx) => {
      if (j.id === job.id) {
        jobs[idx] = { ...j, ...job } as Job;
        updatedJob = jobs[idx];
      }
    });
  }

  if (!updatedJob) {
    updatedJob = {
      id: job.id || ('job-' + Date.now()),
      role: job.role,
      company: job.company,
      status: job.status || 'Applied',
      applied_date: job.applied_date || new Date().toISOString().split('T')[0],
      job_link: job.job_link || '',
      notes: job.notes || '',
      salary: job.salary || '',
      location: job.location || '',
      created_at: new Date().toISOString(),
    };
    jobs.unshift(updatedJob);
  }

  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  
  // Async sync to Supabase if logged in
  if (isSupabaseConfigured()) {
    syncJobToSupabase(updatedJob).catch(console.error);
  }

  return updatedJob;
};

export const deleteStoredJob = (id: string): void => {
  const jobs = getStoredJobs().filter((j) => j.id !== id);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));

  if (isSupabaseConfigured()) {
    deleteJobFromSupabase(id).catch(console.error);
  }
};

export const getStoredPrepItems = (): PrepItem[] => {
  try {
    const data = localStorage.getItem(PREP_ITEMS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_PREP_ITEMS));
      return INITIAL_PREP_ITEMS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PREP_ITEMS;
  }
};

export const savePrepItem = (item: Partial<PrepItem> & { title: string }): PrepItem => {
  const items = getStoredPrepItems();
  let updatedItem: PrepItem | null = null;

  if (item.id) {
    items.forEach((i, idx) => {
      if (i.id === item.id) {
        items[idx] = { ...i, ...item, updated_at: new Date().toISOString() } as PrepItem;
        updatedItem = items[idx];
      }
    });
  }

  if (!updatedItem) {
    updatedItem = {
      id: item.id || ('item-' + Date.now()),
      folder_id: item.folder_id || 'ws-1',
      type: item.type || 'story',
      title: item.title,
      category: item.category || 'Behavioral',
      situation: item.situation || '',
      task: item.task || '',
      action: item.action || '',
      result: item.result || '',
      content: item.content || '',
      updated_at: new Date().toISOString(),
    };
    items.unshift(updatedItem);
  }

  localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(items));

  if (isSupabaseConfigured()) {
    syncPrepItemToSupabase(updatedItem).catch(console.error);
  }

  return updatedItem;
};

export const deleteStoredPrepItem = (id: string): void => {
  const items = getStoredPrepItems().filter((i) => i.id !== id);
  localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(items));

  if (isSupabaseConfigured()) {
    deletePrepItemFromSupabase(id).catch(console.error);
  }
};

export const clearStoredData = (): void => {
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify([]));
};

// ========================================================
// SUPABASE ASYNC DATABASE SYNC API
// ========================================================

export const fetchJobsFromSupabase = async (userId: string): Promise<Job[]> => {
  if (!isSupabaseConfigured()) return getStoredJobs();

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) {
      const formattedJobs: Job[] = (data as JobRow[]).map((d) => ({
        id: d.id,
        role: d.role,
        company: d.company,
        status: (d.status as Job['status']) || 'Applied',
        applied_date: d.applied_date || new Date().toISOString().split('T')[0],
        job_link: d.job_link || '',
        notes: d.notes || '',
        salary: d.salary || '',
        location: d.location || '',
        created_at: d.created_at || new Date().toISOString(),
      }));
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(formattedJobs));
      return formattedJobs;
    }
  } catch (err) {
    // Silent fallback to local storage on network error
  }

  return getStoredJobs();
};

export const syncJobToSupabase = async (job: Job): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const payload = {
    id: job.id.startsWith('job-') ? undefined : job.id,
    user_id: session.user.id,
    role: job.role,
    company: job.company,
    status: job.status,
    applied_date: job.applied_date,
    job_link: job.job_link,
    notes: job.notes,
    salary: job.salary || '',
    location: job.location || '',
  };

  await supabase.from('jobs').upsert(payload);
};

export const deleteJobFromSupabase = async (id: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('jobs').delete().eq('id', id).eq('user_id', session.user.id);
};

export const fetchPrepItemsFromSupabase = async (userId: string): Promise<PrepItem[]> => {
  if (!isSupabaseConfigured()) return getStoredPrepItems();

  try {
    const { data, error } = await supabase
      .from('prep_items')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (data) {
      const formattedItems: PrepItem[] = (data as PrepItemRow[]).map((d) => ({
        id: d.id,
        folder_id: d.folder_id || 'ws-1',
        type: (d.type as PrepItem['type']) || 'story',
        title: d.title,
        category: (d.category as PrepItem['category']) || 'Behavioral',
        situation: d.situation || '',
        task: d.task || '',
        action: d.action || '',
        result: d.result || '',
        content: d.content || '',
        pinned: d.pinned || false,
        updated_at: d.updated_at || new Date().toISOString(),
      }));
      localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(formattedItems));
      return formattedItems;
    }
  } catch (err) {
    // Silent fallback to local storage on network error
  }

  return getStoredPrepItems();
};

export const syncPrepItemToSupabase = async (item: PrepItem): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const payload = {
    id: item.id.startsWith('item-') ? undefined : item.id,
    user_id: session.user.id,
    type: item.type,
    category: item.category,
    title: item.title,
    situation: item.situation,
    task: item.task,
    action: item.action,
    result: item.result,
    content: item.content,
    folder_id: item.folder_id,
    pinned: item.pinned || false,
  };

  await supabase.from('prep_items').upsert(payload);
};

export const deletePrepItemFromSupabase = async (id: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('prep_items').delete().eq('id', id).eq('user_id', session.user.id);
};
