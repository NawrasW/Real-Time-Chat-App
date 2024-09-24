// src/components/SignUpModal.tsx
"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Use for navigation
import { signIn } from 'next-auth/react';
const SignUpModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Send sign-up request
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name })
    });
  
    if (response.ok) {
      alert('User created successfully');
      try {
        // Attempt to sign in the user
        const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/' });
        
        if (result?.error) {
          // Handle sign-in error
          alert('Failed to sign in: ' + result.error);
        } else {
          // Sign-in successful, redirect or do something
          onClose();
        }
      } catch (error) {
        console.error('Sign-in error:', error);
        alert('Failed to sign in. Please try again.');
      }
    } else {
      // Handle user creation error
      alert('Failed to create user. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 sm:mt-0 mt-60">
      <div className="bg-white p-6 rounded shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Name" 
            required 
            className="p-2 border rounded"
          />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
            className="p-2 border rounded"
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
            className="p-2 border rounded"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;