// src/components/FileUpload.js

import React from 'react';

function FileUpload({ label, file, setFile }) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log(`${label} selected:`, e.target.files[0]);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{label}</h2>
      <div className="flex items-center">
        <input
          type="file"
          accept=".nc"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        {file && (
          <span className="ml-4 text-gray-700">{file.name}</span>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
