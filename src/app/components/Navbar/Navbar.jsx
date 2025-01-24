"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { data: session } = useSession(); 
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authToken = session?.user?.token;

  const handleLogout = async () => {
    localStorage.removeItem('authToken')
    await signOut({ callbackUrl: "/login" });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-[#0A0A0A] text-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-4xl font-semibold font-Bona_Nova">To Do App</h1>
          
        
          <div className="sm:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

         
          <ul className="hidden sm:flex justify-center items-center gap-6 text-sm">
            <li><Link href="/" className="hover:text-blue-300">Home</Link></li>
            {session ? (
              <>
                <li><Link href="/list-task" className="hover:text-blue-300">Task Lists</Link></li>
                <li><Link href="/add-task" className="hover:text-blue-300">Create Task</Link></li>
                <li><Link href="/stats" className="hover:text-blue-300">Statistics</Link></li>
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-400 p-2 rounded-md text-black font-mono hover:bg-red-500"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li><Link href="/login" className="hover:text-blue-300">Login</Link></li>
            )}
          </ul>
        </div>

        
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-16 left-0 w-full bg-[#0A0A0A] z-50">
            <ul className="flex flex-col items-center space-y-4 py-6">
              <li><Link href="/" onClick={toggleMobileMenu}>Home</Link></li>
              {session ? (
                <>
                  <li><Link href="/list-task" onClick={toggleMobileMenu}>Task Lists</Link></li>
                  <li><Link href="/add-task" onClick={toggleMobileMenu}>Create Task</Link></li>
                  <li><Link href="/stats" onClick={toggleMobileMenu}>Statistics</Link></li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-400 p-2 rounded-md text-black font-mono"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li><Link href="/login" onClick={toggleMobileMenu}>Login</Link></li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;