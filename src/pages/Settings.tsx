import { useState, useEffect } from 'react';
import { User, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
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
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
        });
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

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

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600">Update your personal details</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />

              <Input
                label="Email"
                type="email"
                value={profile.email}
                disabled
                helperText="Email cannot be changed"
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isLoading}>
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-600">Customize how JobTrackr looks</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <div className="font-medium text-gray-900">Theme</div>
                  <div className="text-sm text-gray-600">
                    Currently using {theme === 'light' ? 'light' : 'dark'} mode
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="secondary">
                  Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-red-200 bg-red-50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-700">Irreversible actions</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-red-300 bg-white p-4">
                <div>
                  <div className="font-medium text-gray-900">Delete Account</div>
                  <div className="text-sm text-gray-600">
                    Permanently delete your account and all data
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => {
                    toast.error('Account deletion not implemented in this demo');
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
