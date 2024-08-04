// /app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

import '@/app/globals.css';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const data: User = await response.json();
          console.log('Fetched user data:', data);
          setUser(data);
          setName(data.name || '');
          setPassword(data.password || '');
          setImage(data.image || '');
          setLoading(false);
        } catch (error) {
          setError((error as Error).message);
          setLoading(false);
        }
      }
    };
  
    fetchUserData();
  }, [session]);
  

  const handleSaveChanges = async () => {
    if (user) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('password', password);
      if (image && typeof image !== 'string') {
        formData.append('image', image);
      }

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          body: formData,
        });

        if (response.ok) {
          const updatedUserData = await response.json();
          setUser(updatedUserData);
        } else {
          console.error('Error updating user:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Error: {error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-lg">
        {user ? (
          <>
            <header className="bg-primary py-8 px-6 rounded-t-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={typeof image === 'string' ? image : '/placeholder-user.jpg'} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">{user.name}</h1>
                  <p className="text-primary-foreground/80">{user.email}</p>
                </div>
              </div>
            </header>
            <Card className="rounded-b-lg">
              <CardContent className="grid gap-6 p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={user.email}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image</Label>
                    <Input
                      id="image"
                      type="file"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-6">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <div className="text-center text-gray-500">No user data available.</div>
        )}
      </div>
    </div>
  );
}