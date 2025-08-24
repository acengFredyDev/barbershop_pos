'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier' as UserRole
  });

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      return;
    }
    
    setUsers(data as User[]);
  };

  // Open dialog for adding new user
  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier'
    });
    setShowUserDialog(true);
  };

  // Open dialog for editing user
  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowUserDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole
    });
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    // Validate form
    if (!formData.name || !formData.email || (!isEditing && !formData.password)) {
      toast({
        title: 'Error',
        description: isEditing 
          ? 'Name and email are required' 
          : 'Name, email, and password are required',
        variant: 'destructive',
      });
      return;
    }

    if (isEditing && currentUser) {
      // Update existing user
      const updateData = {
        name: formData.name,
        role: formData.role
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
        return;
      }

      // Update password if provided
      if (formData.password) {
        // In a real app, you would use Supabase Admin API to update password
        // This is just a placeholder
        toast({
          title: 'Info',
          description: 'Password update functionality requires Supabase Admin API',
        });
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...updateData } : user
      ));

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });

      if (authError) {
        toast({
          title: 'Error',
          description: authError.message,
          variant: 'destructive',
        });
        return;
      }

      if (authData.user) {
        // The profile should be created automatically via database trigger
        // Refresh the user list
        fetchUsers();

        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
    }

    // Close dialog and reset form
    setShowUserDialog(false);
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    // In a real app, you would use Supabase Admin API to delete users
    // This is just a placeholder that deletes the profile but not the auth user
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return;
    }

    // Update local state
    setUsers(users.filter(user => user.id !== userId));

    toast({
      title: 'Success',
      description: 'User deleted successfully',
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No users found</p>
            ) : (
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {user.role !== 'owner' && (
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="User name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                disabled={isEditing} // Can't change email for existing users
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={currentUser?.role === 'owner'} // Can't change owner role
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="barber">Barber</SelectItem>
                  {!isEditing && <SelectItem value="owner">Owner</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>{isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Helper function to get badge color based on role
function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800';
    case 'cashier':
      return 'bg-blue-100 text-blue-800';
    case 'barber':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}