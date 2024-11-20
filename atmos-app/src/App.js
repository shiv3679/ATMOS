// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import your pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="App">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area */}
      <div className="container mx-auto p-4">
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />

          {/* About page route */}
          <Route path="/about" element={<About />} />

          {/* Contact page route */}
          <Route path="/contact" element={<Contact />} />

          {/* Add more routes as needed */}
        </Routes>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default App;
