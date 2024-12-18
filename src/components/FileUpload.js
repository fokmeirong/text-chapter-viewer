import React from 'react';

function FileUpload({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      onUpload(file);
    } else {
      alert('Please upload a valid .txt file');
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default FileUpload; 