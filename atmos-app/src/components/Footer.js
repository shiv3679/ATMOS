// src/components/Footer.js

import React from 'react';

function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-4 mt-8">
      <div className="container mx-auto text-center">
        &copy; {new Date().getFullYear()} NWP Evaluation Tool. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
