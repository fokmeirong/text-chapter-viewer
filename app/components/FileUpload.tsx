'use client';

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      onUpload(file);
    } else {
      alert('Please upload a valid .txt file');
    }
  };

  return (
    <div className="my-5">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  );
} 