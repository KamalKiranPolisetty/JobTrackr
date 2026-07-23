import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trash2, BookOpen, FileText, Search, Copy, Check, 
  Sparkles, Save, CheckCircle2,
  Pin, ChevronLeft, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';


import { 
  getStoredPrepItems, savePrepItem, deleteStoredPrepItem, PrepItem 
} from '../lib/dataStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomSelect, SelectOption } from '../components/CustomSelect';

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Behavioral', label: 'Behavioral STAR' },
  { value: 'Technical', label: 'Technical Note' },
  { value: 'System Design', label: 'System Design' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'title', label: 'Title' },
  { value: 'category', label: 'Category' },
];


export const Preparation = () => {
  const [items, setItems] = useState<PrepItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'Behavioral' | 'Technical' | 'System Design'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'category'>('recent');
  
  // Search Input & Save Timeout & Content Textarea Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoResizeTextarea = (target: HTMLTextAreaElement) => {
    target.style.height = '0px';
    target.style.height = `${target.scrollHeight}px`;
  };

  // Notion Canvas State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'list' | 'editor'>('list');

  // Active Document Form State (Auto-syncs with selectedItemId)
  const [activeDoc, setActiveDoc] = useState<PrepItem | null>(null);

  // Auto-resize title textarea when document changes or title edits
  useEffect(() => {
    if (titleTextareaRef.current) {
      autoResizeTextarea(titleTextareaRef.current);
    }
  }, [activeDoc?.id, activeDoc?.title]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const itemList = getStoredPrepItems();
    setItems(itemList);

    // Auto-select first item if available
    if (itemList.length > 0 && !selectedItemId) {
      setSelectedItemId(itemList[0].id);
      setActiveDoc(itemList[0]);
    }
  };

  // Sync activeDoc when selectedItemId changes
  useEffect(() => {
    if (selectedItemId) {
      const found = items.find((i) => i.id === selectedItemId);
      if (found) {
        setActiveDoc(found);
      }
    }
  }, [selectedItemId, items]);

  // Keyboard Shortcuts: Escape to exit fullscreen & ⌘K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Debounced auto-save (800ms delay) to prevent excessive storage calls
  const handleDocChange = (field: keyof PrepItem, value: any) => {
    if (!activeDoc) return;
    
    const updated = { ...activeDoc, [field]: value, updated_at: new Date().toISOString() };
    setActiveDoc(updated);
    setSaveStatus('saving');

    // Update main items list in memory immediately
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === updated.id ? updated : item))
    );

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      savePrepItem(updated);
      setSaveStatus('saved');
    }, 800);
  };

  // Pin / Unpin document toggle
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const isCurrentlyPinned = !!target.pinned;
    const updated = { ...target, pinned: !isCurrentlyPinned, updated_at: new Date().toISOString() };
    
    savePrepItem(updated);
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? updated : item))
    );

    toast.success(updated.pinned ? 'Document pinned to top' : 'Document unpinned');
  };

  const handleCreateNewItem = (type: 'story' | 'note') => {
    const newItem = savePrepItem({
      title: type === 'story' ? 'Untitled STAR Story' : 'Untitled Note',
      type,
      category: type === 'story' ? 'Behavioral' : 'Technical',
      situation: '',
      task: '',
      action: '',
      result: '',
      content: '',
      pinned: false,
    });

    loadData();
    setSelectedItemId(newItem.id);
    setActiveDoc(newItem);
    setMobileTab('editor');
    toast.success(`Created new ${type === 'story' ? 'STAR Story' : 'Tech Note'}`);
  };

  // Custom Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteStoredPrepItem(deleteTargetId);
    toast.success('Document deleted');
    
    const remaining = items.filter((i) => i.id !== deleteTargetId);
    setItems(remaining);
    if (remaining.length > 0) {
      setSelectedItemId(remaining[0].id);
      setActiveDoc(remaining[0]);
    } else {
      setSelectedItemId(null);
      setActiveDoc(null);
    }
    setDeleteTargetId(null);
  };

  const handleCopyText = () => {
    if (!activeDoc) return;
    const textToCopy = activeDoc.type === 'story'
      ? `Title: ${activeDoc.title}\n\n[SITUATION]\n${activeDoc.situation}\n\n[TASK]\n${activeDoc.task}\n\n[ACTION]\n${activeDoc.action}\n\n[RESULT]\n${activeDoc.result}`
      : `Title: ${activeDoc.title}\n\n${activeDoc.content}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Document copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareText = () => {
    if (!activeDoc) return;
    const shareUrl = `${window.location.origin}/preparation#${activeDoc.id}`;
    navigator.clipboard.writeText(`Check out "${activeDoc.title}": ${shareUrl}`);
    toast.success('Share link copied to clipboard!');
  };

  // Filtered and sorted items for left sidebar list
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesContent = item.content?.toLowerCase().includes(query);
        const matchesStar = (
          item.situation?.toLowerCase().includes(query) ||
          item.task?.toLowerCase().includes(query) ||
          item.action?.toLowerCase().includes(query) ||
          item.result?.toLowerCase().includes(query)
        );
        return matchesTitle || matchesContent || matchesStar;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [items, activeCategory, searchQuery, sortBy]);

  // ChatGPT-style Time-bucket Grouped List
  const groupedItems = useMemo(() => {
    const pinned: PrepItem[] = [];
    const today: PrepItem[] = [];
    const yesterday: PrepItem[] = [];
    const previous7Days: PrepItem[] = [];
    const older: PrepItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 6 * 86400000;

    filteredItems.forEach((item) => {
      if (item.pinned) {
        pinned.push(item);
        return;
      }

      const itemTime = new Date(item.updated_at).getTime();
      if (itemTime >= todayStart) {
        today.push(item);
      } else if (itemTime >= yesterdayStart) {
        yesterday.push(item);
      } else if (itemTime >= sevenDaysStart) {
        previous7Days.push(item);
      } else {
        older.push(item);
      }
    });

    return [
      { section: 'Pinned', items: pinned },
      { section: 'Today', items: today },
      { section: 'Yesterday', items: yesterday },
      { section: 'Previous 7 Days', items: previous7Days },
      { section: 'Older', items: older },
    ].filter((g) => g.items.length > 0);
  }, [filteredItems]);

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Notion/Linear Widescreen Workspace (Left Doc Navigator Sidebar + Right Centered Notion Canvas) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 h-full">
        
        {/* LEFT PANEL: Sleek Document Navigator (w-full lg:w-[410px] xl:w-[430px] flex-shrink-0) */}
        <div className={`w-full lg:w-[410px] xl:w-[430px] flex-shrink-0 flex-col space-y-4 min-h-0 ${isFullscreen ? 'hidden' : mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Navigator Header Card */}
          <div className="p-4 bg-white dark:bg-[#242120] border border-slate-200 dark:border-[#3a3733] rounded-2xl flex-shrink-0 space-y-3.5 shadow-sm">
            
            {/* Header Title + Explicit Create Buttons */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">My Notes</h2>

              <div className="flex items-center gap-1.5">
                <Button variant="secondary" size="sm" onClick={() => handleCreateNewItem('note')} title="New Tech Note">
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  Note
                </Button>

                <Button variant="primary" size="sm" onClick={() => handleCreateNewItem('story')} title="New STAR Story">
                  <BookOpen className="mr-1 h-3.5 w-3.5" />
                  STAR
                </Button>
              </div>
            </div>

            {/* Search Box with ⌘K Badge & Ref Focus */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-10 py-2 rounded-xl text-xs font-medium glass-input"
              />
              <kbd 
                onClick={() => searchInputRef.current?.focus()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-[#6b6560] bg-slate-100 dark:bg-[#2e2b28] border border-slate-200 dark:border-[#3a3733] rounded cursor-pointer"
              >
                ⌘K
              </kbd>
            </div>

            {/* Clean Category Tabs */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-[#FEF2F2] dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e8e3d9] border border-[#D7494C]/30 dark:border-[#3a3733] shadow-xs'
                    : 'text-slate-600 dark:text-[#9c9891] hover:bg-slate-200/50 dark:hover:bg-[#302d2a]'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveCategory('Technical')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'Technical'
                    ? 'bg-[#FEF2F2] dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e8e3d9] border border-[#D7494C]/30 dark:border-[#3a3733] shadow-xs'
                    : 'text-slate-600 dark:text-[#9c9891] hover:bg-slate-200/50 dark:hover:bg-[#302d2a]'
                }`}
              >
                Technical
              </button>

              <button
                onClick={() => setActiveCategory('Behavioral')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'Behavioral'
                    ? 'bg-[#FEF2F2] dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e8e3d9] border border-[#D7494C]/30 dark:border-[#3a3733] shadow-xs'
                    : 'text-slate-600 dark:text-[#9c9891] hover:bg-slate-200/50 dark:hover:bg-[#302d2a]'
                }`}
              >
                Behavioral
              </button>

              <button
                onClick={() => setActiveCategory('System Design')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'System Design'
                    ? 'bg-[#FEF2F2] dark:bg-[#302d2a] text-[#D7494C] dark:text-[#e8e3d9] border border-[#D7494C]/30 dark:border-[#3a3733] shadow-xs'
                    : 'text-slate-600 dark:text-[#9c9891] hover:bg-slate-200/50 dark:hover:bg-[#302d2a]'
                }`}
              >
                System Design
              </button>
            </div>
          </div>

          {/* Group Subheader (Category Count + Functional Custom Sort Dropdown) */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>{activeCategory === 'all' ? 'NOTES & STORIES' : activeCategory.toUpperCase()} ({filteredItems.length})</span>
            
            <div className="flex items-center gap-1.5 normal-case font-medium">
              <span className="text-slate-400 dark:text-[#6b6560] font-bold">Sort:</span>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                size="sm"
                align="right"
              />
            </div>
          </div>


          {/* ChatGPT-Style Time-bucket Document List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {groupedItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No documents match filters.
              </div>
            ) : (
              groupedItems.map((group) => (
                <div key={group.section} className="space-y-1">
                  {/* ChatGPT Section Header */}
                  <h4 className="px-2 py-1 text-[11px] font-extrabold text-slate-400 dark:text-[#6b6560] uppercase tracking-wider">
                    {group.section}
                  </h4>

                  {/* Group Items */}
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setActiveDoc(item);
                        setMobileTab('editor');
                      }}
                      className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border group ${
                        selectedItemId === item.id
                          ? 'bg-[#FEF2F2] text-[#C43538] border-[#D7494C]/40 dark:bg-[#2e2b28] dark:text-[#e8e3d9] dark:border-[#3a3733] shadow-xs'
                          : 'bg-white/80 dark:bg-[#242120]/80 border-slate-200/80 dark:border-[#3a3733] hover:bg-slate-100 dark:hover:bg-[#2e2b28] text-slate-700 dark:text-[#9c9891]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                          selectedItemId === item.id
                            ? 'bg-[#D7494C]/15 text-[#D7494C] dark:bg-[#302d2a] dark:text-[#e8e3d9]'
                            : 'bg-slate-100 dark:bg-[#2e2b28] text-slate-600 dark:text-[#9c9891] border border-slate-200 dark:border-[#3a3733]'
                        }`}>
                          {item.type === 'story' ? <BookOpen className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-xs truncate ${selectedItemId === item.id ? 'text-[#C43538] dark:text-[#e8e3d9]' : 'text-slate-800 dark:text-[#d4cfc6]'}`}>
                            {item.title || 'Untitled Document'}
                          </h4>
                        </div>

                        {/* Functional Pin Toggle Button */}
                        <button
                          onClick={(e) => handleTogglePin(item.id, e)}
                          title={item.pinned ? 'Unpin Document' : 'Pin Document to Top'}
                          className={`p-1 rounded-md transition-colors ${
                            item.pinned
                              ? 'text-[#D7494C] dark:text-[#e05c5f] bg-[#FEF2F2] dark:bg-[#D7494C]/12'
                              : 'opacity-0 group-hover:opacity-100 text-slate-300 dark:text-zinc-600 hover:text-slate-500 dark:hover:text-zinc-300'
                          }`}
                        >
                          <Pin className={`h-3 w-3 ${item.pinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>


        {/* RIGHT PANEL: Pure Spacious Notion Writing Canvas */}

        <div className={`flex-1 min-w-0 flex-col h-full min-h-0 ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {!activeDoc ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed">
              <Sparkles className="h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-[#d4cfc6]">No document selected</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Select a document from the left navigator or click + STAR Story to start writing.
              </p>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col min-h-0 w-full h-full !p-0 bg-white dark:bg-[#242120] border border-slate-200 dark:border-[#3a3733] shadow-sm overflow-hidden rounded-2xl">

              {/* Canvas Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3a3733] px-4 sm:px-8 py-3 bg-white dark:bg-[#242120] flex-shrink-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile & Tablet Back to List Button */}
                  <button
                    onClick={() => setMobileTab('list')}
                    className="lg:hidden flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-[#e8e3d9] px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#302d2a] border border-slate-200/80 dark:border-[#3a3733] flex-shrink-0"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#302d2a] transition-colors"
                    title="Toggle Navigator Sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Desktop Category Selector */}
                  <div className="hidden lg:block flex-shrink-0">
                    <CustomSelect
                      options={CATEGORY_OPTIONS}
                      value={activeDoc.category}
                      onChange={(val) => handleDocChange('category', val as any)}
                      size="sm"
                    />
                  </div>


                  {/* Auto-save Indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    {saveStatus === 'saving' ? (
                      <span className="flex items-center text-amber-500 font-semibold">
                        <Save className="h-3.5 w-3.5 mr-1" /> Saving...
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Canvas Toolbar Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" onClick={handleCopyText}>
                    {copied ? <Check className="sm:mr-1 h-3.5 w-3.5 text-emerald-500" /> : <Copy className="sm:mr-1 h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">Copy</span>
                  </Button>

                  <Button variant="ghost" size="sm" onClick={handleShareText} title="Share Note">
                    <Share2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>


                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTargetId(activeDoc.id)}
                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>


              {/* Canvas Scrollable Document Body (Notion Writing Canvas) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
                <div className="max-w-4xl mx-auto w-full space-y-5 flex-1 flex flex-col min-h-0">
                  {/* Seamless Borderless Title Input */}
                  <div className="pt-1">
                    {/* Mobile & Tablet Category Selector Tag */}
                    <div className="lg:hidden mb-2.5">
                      <CustomSelect
                        options={CATEGORY_OPTIONS}
                        value={activeDoc.category}
                        onChange={(val) => handleDocChange('category', val as any)}
                        size="sm"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Untitled Document..."
                      value={activeDoc.title}
                      onChange={(e) => handleDocChange('title', e.target.value)}
                      className="w-full text-xl sm:text-2xl md:text-3xl font-extrabold bg-transparent text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-300 dark:placeholder:text-zinc-700 focus:outline-none tracking-tight border-b border-transparent focus:border-slate-300 dark:focus:border-zinc-800 py-1 transition-all"
                    />
                    <p className="text-xs text-slate-400 font-medium mt-1.5">
                      Last updated today at {new Date(activeDoc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <hr className="mt-4 border-slate-200/80 dark:border-[#3a3733]" />
                  </div>

                  {/* Pure Notion Document Body with Auto-expanding Textareas */}
                  {activeDoc.type === 'story' ? (
                    <div className="flex flex-col space-y-4 pt-2">
                      {/* Situation Block */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#2e2b28] border border-slate-200/80 dark:border-[#3a3733] flex flex-col space-y-3 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-gray-100 dark:bg-[#302d2a] text-gray-600 dark:text-[#9c9891] border border-gray-200/80 dark:border-[#3a3733]">
                            SITUATION
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Describe the background and challenge you encountered..."
                          value={activeDoc.situation}
                          onChange={(e) => {
                            handleDocChange('situation', e.target.value);
                            autoResizeTextarea(e.target);
                          }}
                          onFocus={(e) => autoResizeTextarea(e.target)}
                          className="w-full bg-transparent text-sm sm:text-base font-normal text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed overflow-hidden"
                        />
                      </div>

                      {/* Task Block */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#2e2b28] border border-slate-200/80 dark:border-[#3a3733] flex flex-col space-y-3 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-gray-100 dark:bg-[#302d2a] text-gray-600 dark:text-[#9c9891] border border-gray-200/80 dark:border-[#3a3733]">
                            TASK
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="What was your specific goal or responsibility?..."
                          value={activeDoc.task}
                          onChange={(e) => {
                            handleDocChange('task', e.target.value);
                            autoResizeTextarea(e.target);
                          }}
                          onFocus={(e) => autoResizeTextarea(e.target)}
                          className="w-full bg-transparent text-sm sm:text-base font-normal text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed overflow-hidden"
                        />
                      </div>

                      {/* Action Block */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#2e2b28] border border-slate-200/80 dark:border-[#3a3733] flex flex-col space-y-3 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-gray-100 dark:bg-[#302d2a] text-gray-600 dark:text-[#9c9891] border border-gray-200/80 dark:border-[#3a3733]">
                            ACTION
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          placeholder="What specific actions did you drive to resolve the challenge?..."
                          value={activeDoc.action}
                          onChange={(e) => {
                            handleDocChange('action', e.target.value);
                            autoResizeTextarea(e.target);
                          }}
                          onFocus={(e) => autoResizeTextarea(e.target)}
                          className="w-full bg-transparent text-sm sm:text-base font-normal text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed overflow-hidden"
                        />
                      </div>

                      {/* Result Block */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-[#2e2b28] border border-slate-200/80 dark:border-[#3a3733] flex flex-col space-y-3 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-gray-100 dark:bg-[#302d2a] text-gray-600 dark:text-[#9c9891] border border-gray-200/80 dark:border-[#3a3733]">
                            RESULT
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="What was the measurable outcome? e.g. Reduced latency by 98%..."
                          value={activeDoc.result}
                          onChange={(e) => {
                            handleDocChange('result', e.target.value);
                            autoResizeTextarea(e.target);
                          }}
                          onFocus={(e) => autoResizeTextarea(e.target)}
                          className="w-full bg-transparent text-sm sm:text-base font-normal text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed overflow-hidden"
                        />
                      </div>
                    </div>
                  ) : (


                    /* Technical Note Editor Canvas (Expands full page height) */
                    <div 
                      className="pt-1 cursor-text flex-1 flex flex-col min-h-[450px]"
                      onClick={() => contentTextareaRef.current?.focus()}
                    >
                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        placeholder="Start typing your technical notes, system design blueprints, or markdown documentation here..."
                        value={activeDoc.content}
                        onChange={(e) => handleDocChange('content', e.target.value)}
                        className="w-full bg-transparent text-sm sm:text-base font-mono leading-relaxed text-slate-900 dark:text-[#e8e3d9] placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none flex-1 min-h-[450px]"
                      />
                    </div>
                  )}
                </div>
              </div>




            </Card>
          )}
        </div>
      </div>





      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message="Are you sure you want to delete this prep document? This action cannot be undone."
        confirmText="Delete Document"
      />
    </div>
  );
};

