'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rajneesh@gmail.com');
  const [password, setPassword] = useState('rajneesh@2002');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const session = await fetch('/api/auth/session');
        const sessionData = await session.json();
        const token = sessionData?.user?.token;

        if (token) {
          localStorage.setItem('authToken', token);
        }
        console.log("token of the user in the login page " , token )
        router.push('/list-task');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2 text-white rounded-md ${
              isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm">
            Don't have an account? 
            <Link href="/register" className="text-blue-500 ml-1">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
