'use client';
import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const registerResponse = await fetch('https://todos-api-aeaf.onrender.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await registerResponse.json();

      if (registerResponse.ok) {
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
        });

        if (signInResponse?.error) {
          setError(signInResponse.error);
        } else {
          router.push('/list-task');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/list-task' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Register
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm">
            Already have an account? 
            <Link href="/login" className="text-blue-500 ml-1">
              Login
            </Link>
          </p>
        </div>

       

        
      </div>
    </div>
  );
}