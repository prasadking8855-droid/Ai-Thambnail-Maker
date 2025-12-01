import React, { useRef, useState } from 'react';
import { GenerateThumbnailParams } from '../types';

interface ThumbnailFormProps {
  isLoading: boolean;
  onSubmit: (data: GenerateThumbnailParams) => void;
  onImageSelect: (url: string) => void;
}

export const ThumbnailForm: React.FC<ThumbnailFormProps> = ({ isLoading, onSubmit, onImageSelect }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(null);
  
  // Prompt Input State
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setMainImagePreviewUrl(url);
      onImageSelect(url);
    }
  };

  const handleClearMainFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setMainImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onImageSelect('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (file && title.trim()) {
      const params: GenerateThumbnailParams = {
        title: title.trim(),
        imageFile: file,
        referenceImageFile: undefined,
      };
      
      onSubmit(params);
    }
  };

  const isFormValid = file && title.trim() !== '';
  
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl transition-all relative z-10">
      
      <div className="text-center mb-2">
         <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Create New Thumbnail</h2>
         <p className="text-gray-500 dark:text-gray-400 text-sm">Upload a photo, describe your scene, and let AI do the rest.</p>
      </div>

      {/* Title/Prompt Input */}
      <div className="space-y-3">
        <label htmlFor="title" className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Paste Prompt <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative group">
          {isPromptExpanded ? (
            <textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe your thumbnail... (e.g. A futuristic city background, holding a glowing orb, text overlay: 'TOP SECRET')"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-y min-h-[140px] shadow-inner text-base leading-relaxed"
              disabled={isLoading}
              rows={5}
            />
          ) : (
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paste your prompt here..."
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-inner text-base"
              disabled={isLoading}
            />
          )}

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {title && !isLoading && (
              <button
                type="button"
                onClick={() => setTitle('')}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Clear"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isPromptExpanded ? "Collapse" : "Expand"}
            >
              {isPromptExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15h4.5M9 15l5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h-4.5M15 15v4.5M15 15l-5.25 5.25" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Input */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          YouTuber Headshot <span className="text-red-500 ml-1">*</span>
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            file 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {file && mainImagePreviewUrl ? (
              <div className="relative w-full flex flex-col items-center">
                 <div className="relative">
                   <img 
                     src={mainImagePreviewUrl} 
                     alt="Main Character" 
                     className="w-32 h-32 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-xl mb-3"
                   />
                   <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-4 border-white dark:border-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                   </div>
                 </div>
                 <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{file.name}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Click to change photo</p>
                 
                 <button
                    type="button"
                    onClick={handleClearMainFile}
                    className="absolute top-0 right-0 sm:right-10 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                    title="Remove image"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                 </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors text-blue-500 group-hover:scale-110 transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-700 dark:text-gray-300">Click to upload image</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full py-5 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] tracking-wide uppercase ${
          !isFormValid || isLoading
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </span>
        ) : (
          'Generate Thumbnail'
        )}
      </button>
    </form>
  );
};