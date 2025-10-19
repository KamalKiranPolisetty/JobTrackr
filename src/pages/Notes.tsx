import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tag, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updated_at: string;
}

export const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = useCallback(
    async (noteId: string, data: { title: string; content: string; tags: string[] }) => {
      if (!data.title.trim()) return;

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            title: data.title,
            content: data.content,
            tags: data.tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', noteId);

        if (error) throw error;
      } catch (error: any) {
        toast.error('Failed to autosave');
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!editingNote) return;

    const timeout = setTimeout(() => {
      autoSave(editingNote.id, formData);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formData, editingNote, autoSave]);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        tags: [],
      });
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    fetchNotes();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      if (editingNote) {
        await autoSave(editingNote.id, formData);
        toast.success('Note saved');
        handleCloseModal();
      } else {
        const { error } = await supabase.from('notes').insert([
          {
            ...formData,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success('Note created');
        handleCloseModal();
      }

      fetchNotes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
      toast.success('Note deleted');
      fetchNotes();
    } catch (error: any) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="mt-1 text-gray-600">Keep track of important information</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-5 w-5" />
            Add Note
          </Button>
        </div>

        <Card className="mb-8 p-6">
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              {notes.length === 0
                ? 'No notes yet. Click "Add Note" to create your first one!'
                : 'No notes match your search.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card key={note.id} hover className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="flex-1 text-lg font-semibold text-gray-900">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(note)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {note.content && (
                  <p className="mb-4 line-clamp-4 text-sm text-gray-600 whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}

                {note.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Updated {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNote ? 'Edit Note' : 'Add New Note'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="Note title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              placeholder="Write your note here..."
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              <Button type="button" onClick={handleAddTag}>
                <Tag className="h-5 w-5" />
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

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {editingNote && isSaving && (
                <>
                  <Save className="h-4 w-4 animate-pulse" />
                  <span>Saving...</span>
                </>
              )}
              {editingNote && !isSaving && <span className="text-green-600">Saved</span>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                {editingNote ? 'Close' : 'Cancel'}
              </Button>
              {!editingNote && <Button type="submit">Create Note</Button>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
