import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Pencil, Trash2, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Textarea } from '../components/Textarea';

interface PrepFolder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface PrepItem {
  id: string;
  folder_id: string;
  type: 'story' | 'note';
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  content: string;
  tags: string[];
  updated_at: string;
}

interface FolderTreeNode extends PrepFolder {
  children: FolderTreeNode[];
  isExpanded: boolean;
}

export const Preparation = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<PrepFolder[]>([]);
  const [items, setItems] = useState<PrepItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'folder' | 'story' | 'note'>('folder');
  const [editingFolder, setEditingFolder] = useState<PrepFolder | null>(null);
  const [editingItem, setEditingItem] = useState<PrepItem | null>(null);
  const [folderName, setFolderName] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    content: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [foldersRes, itemsRes] = await Promise.all([
        supabase.from('prep_folders').select('*').eq('user_id', user.id),
        supabase.from('prep_items').select('*').eq('user_id', user.id),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setFolders(foldersRes.data || []);
      setItems(itemsRes.data || []);

      if (!selectedFolderId && (foldersRes.data?.length || 0) > 0) {
        const rootFolder = (foldersRes.data || []).find((f) => !f.parent_id);
        if (rootFolder) {
          setSelectedFolderId(rootFolder.id);
        }
      }
    } catch (error: any) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const createRootFolder = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prep_folders')
        .insert([{ user_id: user.id, name: 'Root', parent_id: null }])
        .select()
        .single();

      if (error) throw error;
      setFolders([...folders, data]);
      setSelectedFolderId(data.id);
      toast.success('Root folder created');
    } catch (error: any) {
      toast.error('Failed to create root folder');
    }
  };

  const buildFolderTree = (parentId: string | null = null): FolderTreeNode[] => {
    return (folders.filter((f) => f.parent_id === parentId) || []).map((folder) => ({
      ...folder,
      children: buildFolderTree(folder.id),
      isExpanded: expandedFolders.has(folder.id),
    }));
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleOpenFolderModal = (folder?: PrepFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
    } else {
      setEditingFolder(null);
      setFolderName('');
    }
    setModalMode('folder');
    setIsModalOpen(true);
  };

  const handleOpenItemModal = (type: 'story' | 'note', item?: PrepItem) => {
    if (!selectedFolderId) {
      toast.error('Please select a folder first');
      return;
    }

    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        situation: item.situation,
        task: item.task,
        action: item.action,
        result: item.result,
        content: item.content,
        tags: item.tags,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
        content: '',
        tags: [],
      });
    }
    setModalMode(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFolder(null);
    setEditingItem(null);
    setTagInput('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      if (editingFolder) {
        const { error } = await supabase
          .from('prep_folders')
          .update({ name: folderName, updated_at: new Date().toISOString() })
          .eq('id', editingFolder.id);

        if (error) throw error;
        setFolders(
          folders.map((f) => (f.id === editingFolder.id ? { ...f, name: folderName } : f))
        );
        toast.success('Folder renamed');
      } else {
        const { data, error } = await supabase
          .from('prep_folders')
          .insert([
            {
              user_id: user?.id,
              name: folderName,
              parent_id: selectedFolderId,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setFolders([...folders, data]);
        toast.success('Folder created');
      }

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save folder');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!selectedFolderId) {
      toast.error('Please select a folder');
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('prep_items')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item updated');
      } else {
        const { error } = await supabase.from('prep_items').insert([
          {
            user_id: user?.id,
            folder_id: selectedFolderId,
            type: modalMode,
            ...formData,
          },
        ]);

        if (error) throw error;
        toast.success('Item created');
      }

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const { error } = await supabase.from('prep_folders').delete().eq('id', id);

      if (error) throw error;
      toast.success('Folder deleted');
      if (selectedFolderId === id) setSelectedFolderId(null);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete folder');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const { error } = await supabase.from('prep_items').delete().eq('id', id);

      if (error) throw error;
      toast.success('Item deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete item');
    }
  };

  const FolderTree = ({ nodes }: { nodes: FolderTreeNode[] }) => (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id}>
          <div className="flex items-center gap-1">
            {node.children.length > 0 && (
              <button
                onClick={() => toggleFolder(node.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {node.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
            {node.children.length === 0 && <div className="w-6" />}
            <button
              onClick={() => setSelectedFolderId(node.id)}
              className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                selectedFolderId === node.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span className="truncate">{node.name}</span>
            </button>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenFolderModal(node)}
                className="p-1 hover:text-blue-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteFolder(node.id)}
                className="p-1 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {node.isExpanded && node.children.length > 0 && (
            <div className="ml-4 border-l border-gray-200">
              <div className="ml-3">
                <FolderTree nodes={node.children} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const selectedFolderItems = items.filter((item) => item.folder_id === selectedFolderId);
  const rootFolders = buildFolderTree(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <Card className="p-12 text-center">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="mb-4 text-gray-600">No folders yet. Create your first folder to get started!</p>
          <Button onClick={createRootFolder}>
            <Plus className="mr-2 h-5 w-5" />
            Create Root Folder
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="w-80 border-r border-gray-200 bg-white p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Folders</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenFolderModal()}
            title="Add folder"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <FolderTree nodes={rootFolders} />
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {!selectedFolderId ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-600">Select a folder to view items</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {folders.find((f) => f.id === selectedFolderId)?.name}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleOpenItemModal('story')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Add Story
                </Button>
                <Button onClick={() => handleOpenItemModal('note')}>
                  <FileText className="mr-2 h-5 w-5" />
                  Add Note
                </Button>
              </div>
            </div>

            {selectedFolderItems.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No items in this folder yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedFolderItems.map((item) => (
                  <Card key={item.id} hover className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === 'story' ? (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-600" />
                        )}
                        <h3 className="flex-1 text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenItemModal(item.type, item)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {item.type === 'story' ? (
                      <div className="space-y-2 text-sm">
                        {item.situation && (
                          <div>
                            <div className="font-medium text-gray-600">Situation</div>
                            <p className="line-clamp-2 text-gray-700">{item.situation}</p>
                          </div>
                        )}
                        {item.action && (
                          <div>
                            <div className="font-medium text-gray-600">Action</div>
                            <p className="line-clamp-2 text-gray-700">{item.action}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="line-clamp-4 text-sm text-gray-700 whitespace-pre-wrap">
                        {item.content}
                      </p>
                    )}

                    {item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalMode === 'folder'
            ? editingFolder
              ? 'Edit Folder'
              : 'Create Folder'
            : editingItem
            ? `Edit ${modalMode === 'story' ? 'Story' : 'Note'}`
            : `Add ${modalMode === 'story' ? 'Story' : 'Note'}`
        }
        size={modalMode === 'folder' ? 'sm' : 'lg'}
      >
        {modalMode === 'folder' ? (
          <form onSubmit={handleSaveFolder} className="space-y-4">
            <Input
              label="Folder Name"
              placeholder="My Stories"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFolder ? 'Update' : 'Create'} Folder
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveItem} className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {modalMode === 'story' ? (
              <>
                <Textarea
                  label="Situation"
                  placeholder="Describe the context and background..."
                  rows={3}
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                />

                <Textarea
                  label="Task"
                  placeholder="What was your responsibility or goal?..."
                  rows={3}
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                />

                <Textarea
                  label="Action"
                  placeholder="What specific actions did you take?..."
                  rows={4}
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                />

                <Textarea
                  label="Result"
                  placeholder="What was the outcome and impact?..."
                  rows={3}
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                />
              </>
            ) : (
              <Textarea
                label="Content"
                placeholder="Write your note here..."
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} {modalMode === 'story' ? 'Story' : 'Note'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
