// src/components/Navbar.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo or Brand Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              NWP Evaluation Tool
            </Link>
          </div>
          {/* Hamburger Menu for Mobile */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Menu icon */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon for close */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Close icon */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/about" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
              {/* Add more links as needed */}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            {/* Add more links as needed */}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
