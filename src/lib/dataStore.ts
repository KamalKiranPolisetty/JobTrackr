// Persistent Local Data Store with rich seed data for JobTrackr
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

const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    role: 'Senior Frontend Engineer',
    company: 'Vercel',
    status: 'Interview',
    applied_date: '2026-07-15',
    job_link: 'https://vercel.com/careers',
    notes: 'Passed initial technical screen with VP of Engineering. System design round scheduled for Friday.',
    salary: '$185,000 + Equity',
    location: 'Remote',
    created_at: '2026-07-15T10:00:00Z',
  },
  {
    id: 'job-2',
    role: 'Full Stack Engineer',
    company: 'Stripe',
    status: 'Applied',
    applied_date: '2026-07-18',
    job_link: 'https://stripe.com/jobs',
    notes: 'Submitted application via employee referral for Connect Infrastructure team.',
    salary: '$195,000',
    location: 'San Francisco, CA',
    created_at: '2026-07-18T14:30:00Z',
  },
  {
    id: 'job-3',
    role: 'Staff Product Engineer',
    company: 'Linear',
    status: 'Offer',
    applied_date: '2026-07-05',
    job_link: 'https://linear.app/careers',
    notes: 'Received written offer! $195k base salary + 0.18% equity. Decision deadline is July 28.',
    salary: '$195,000 + 0.18% Equity',
    location: 'Remote',
    created_at: '2026-07-05T09:15:00Z',
  },
  {
    id: 'job-4',
    role: 'Core Systems Engineer',
    company: 'GitHub',
    status: 'Applied',
    applied_date: '2026-07-12',
    job_link: 'https://github.com/about/careers',
    notes: 'Applied for Actions & Compute infrastructure team.',
    salary: '$175,000',
    location: 'Remote',
    created_at: '2026-07-12T11:20:00Z',
  },
  {
    id: 'job-5',
    role: 'Senior UI Architect',
    company: 'Figma',
    status: 'Rejected',
    applied_date: '2026-06-25',
    job_link: 'https://figma.com/careers',
    notes: 'Completed 4 technical rounds. Decision went to a candidate with specialized WebGL shader experience.',
    salary: '$210,000',
    location: 'San Francisco, CA',
    created_at: '2026-06-25T16:00:00Z',
  },
];

const SEED_PREP_ITEMS: PrepItem[] = [
  {
    id: 'item-1',
    folder_id: 'ws-1',
    type: 'story',
    category: 'Behavioral',
    title: 'Scaling Real-time WebSockets Engine for 50k Concurrent Users',
    situation: 'Our financial trading dashboard suffered severe 3.5-second latency spikes during market open volatility events, causing user churn.',
    task: 'I was assigned to re-architect our data streaming pipeline to guarantee under 40ms end-to-end update latency across 50,000 concurrent active WebSocket clients.',
    action: 'Decoupled monolithic WS handlers into dedicated Go microservices backed by Redis Pub/Sub. Introduced client-side delta updates and optimized JSON payload serialization.',
    result: 'Slashed socket latency from 3,500ms down to 38ms (98.9% speedup) and reduced cloud infrastructure memory usage by 45%.',
    content: '',
    updated_at: '2026-07-19T11:00:00Z',
  },
  {
    id: 'item-2',
    folder_id: 'ws-1',
    type: 'story',
    category: 'Behavioral',
    title: 'Resolving Architectural Dispute: REST vs GraphQL Federation',
    situation: 'Two senior development teams had been locked in a 3-week dispute over choosing REST APIs versus GraphQL Federation for our next-gen mobile backend.',
    task: 'As Technical Lead, I needed to break the impasse, align both team leads, and publish an RFC specification without missing our quarterly launch window.',
    action: 'Constructed an empirical benchmark spike testing schema maintenance cost, network payload overhead, and mobile battery consumption. Facilitated a data-driven RFC review.',
    result: 'Achieved 100% team consensus on GraphQL Federation within 48 hours and delivered the unified API gateway 1 week ahead of target.',
    content: '',
    updated_at: '2026-07-17T09:30:00Z',
  },
  {
    id: 'item-3',
    folder_id: 'ws-1',
    type: 'note',
    category: 'System Design',
    title: 'Distributed System Design: Rate Limiting & Token Bucket Architecture',
    situation: '',
    task: '',
    action: '',
    result: '',
    content: `## Distributed Rate Limiting & Architecture Guide

### 1. Key Core Algorithms
- **Token Bucket Algorithm**:
  - Capacity $B$, refill rate $R$ tokens/second.
  - Efficiently absorbs bursty traffic spikes.
  - Guaranteed atomicity using Redis Lua Scripts.

- **Sliding Window Counter**:
  - Combines fixed window counters with smooth memory estimation.
  - Memory complexity: $O(1)$ space per client key.

### 2. High Availability & Multi-Region Setup
- **Edge Cache Layer**: Use Cloudflare Workers / Fastly VCL for rate-limiting static routes at the CDN edge.
- **Graceful Degradation**: Fall back to local memory LRU counters when central Redis cluster experiences sub-network partitions.`,
    updated_at: '2026-07-20T16:45:00Z',
  },
  {
    id: 'item-4',
    folder_id: 'ws-1',
    type: 'note',
    category: 'Technical',
    title: 'React 19 & Concurrent Rendering Performance Cheatsheet',
    situation: '',
    task: '',
    action: '',
    result: '',
    content: `## React 19 Core Performance Patterns

### 1. Server Components vs Client Components
- Keep interactivity at the leaves of the component tree.
- Use \`useTransition()\` for non-blocking UI state updates during heavy list rendering.

### 2. Optimistic UI Updates
- Use \`useOptimistic()\` hook to immediately display updated state before backend response finishes.
- Roll back state gracefully if request throws an error.`,
    updated_at: '2026-07-21T10:15:00Z',
  },
];

// Local Storage Handlers
export const getStoredJobs = (): Job[] => {
  try {
    const data = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(SEED_JOBS));
      return SEED_JOBS;
    }
    return JSON.parse(data);
  } catch (e) {
    return SEED_JOBS;
  }
};

export const saveJob = (job: Partial<Job> & { role: string; company: string }): Job => {
  const jobs = getStoredJobs();
  let updatedJob: Job;

  if (job.id) {
    jobs.forEach((j, idx) => {
      if (j.id === job.id) {
        jobs[idx] = { ...j, ...job } as Job;
        updatedJob = jobs[idx];
      }
    });
  } else {
    updatedJob = {
      id: 'job-' + Date.now(),
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
  return updatedJob!;
};

export const deleteStoredJob = (id: string): void => {
  const jobs = getStoredJobs().filter((j) => j.id !== id);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
};

export const getStoredPrepItems = (): PrepItem[] => {
  try {
    const data = localStorage.getItem(PREP_ITEMS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(SEED_PREP_ITEMS));
      return SEED_PREP_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    return SEED_PREP_ITEMS;
  }
};

export const savePrepItem = (item: Partial<PrepItem> & { title: string }): PrepItem => {
  const items = getStoredPrepItems();
  let updatedItem: PrepItem;

  if (item.id) {
    items.forEach((i, idx) => {
      if (i.id === item.id) {
        items[idx] = { ...i, ...item, updated_at: new Date().toISOString() } as PrepItem;
        updatedItem = items[idx];
      }
    });
  } else {
    updatedItem = {
      id: 'item-' + Date.now(),
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
  return updatedItem!;
};

export const deleteStoredPrepItem = (id: string): void => {
  const items = getStoredPrepItems().filter((i) => i.id !== id);
  localStorage.setItem(PREP_ITEMS_STORAGE_KEY, JSON.stringify(items));
};
