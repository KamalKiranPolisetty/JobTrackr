import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';

interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
}

export const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (story?: Story) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        title: story.title,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        tags: story.tags,
      });
    } else {
      setEditingStory(null);
      setFormData({
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
        tags: [],
      });
    }
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
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
      if (editingStory) {
        const { error } = await supabase
          .from('stories')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingStory.id);

        if (error) throw error;
        toast.success('Story updated successfully');
      } else {
        const { error } = await supabase.from('stories').insert([
          {
            ...formData,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success('Story added successfully');
      }

      handleCloseModal();
      fetchStories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save story');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const { error } = await supabase.from('stories').delete().eq('id', id);

      if (error) throw error;
      toast.success('Story deleted successfully');
      fetchStories();
    } catch (error: any) {
      toast.error('Failed to delete story');
    }
  };

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Behavioral Stories</h1>
            <p className="mt-1 text-gray-600">Prepare STAR method stories for interviews</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-5 w-5" />
            Add Story
          </Button>
        </div>

        <Card className="mb-8 p-6">
          <input
            type="text"
            placeholder="Search stories by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredStories.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              {stories.length === 0
                ? 'No stories yet. Click "Add Story" to create your first one!'
                : 'No stories match your search.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <Card key={story.id} hover className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(story)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {story.situation && (
                    <div>
                      <div className="text-xs font-medium text-gray-500">SITUATION</div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">{story.situation}</p>
                    </div>
                  )}
                  {story.task && (
                    <div>
                      <div className="text-xs font-medium text-gray-500">TASK</div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">{story.task}</p>
                    </div>
                  )}
                  {story.action && (
                    <div>
                      <div className="text-xs font-medium text-gray-500">ACTION</div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">{story.action}</p>
                    </div>
                  )}
                  {story.result && (
                    <div>
                      <div className="text-xs font-medium text-gray-500">RESULT</div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">{story.result}</p>
                    </div>
                  )}
                </div>

                {story.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStory ? 'Edit Story' : 'Add New Story'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="Brief title for this story"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag (e.g., Leadership)"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editingStory ? 'Update' : 'Add'} Story</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
