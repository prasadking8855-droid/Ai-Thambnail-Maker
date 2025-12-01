import React, { useState, useRef } from 'react';
import { extractYouTubeVideoId } from '../utils';
import { generatePrompts } from '../services/geminiService';

export const PromptGenerator: React.FC = () => {
  const [inputType, setInputType] = useState<'link' | 'upload'>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<{ short: string; detailed: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLinkChange = (val: string) => {
    setUrl(val);
    setPrompts(null);
    setError(null);
    const videoId = extractYouTubeVideoId(val);
    if (videoId) {
      setPreviewUrl(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setPrompts(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPrompts(null);

    try {
      let imageToProcess: File | null = null;

      if (inputType === 'upload') {
        if (!file) throw new Error("Please upload an image first.");
        imageToProcess = file;
      } else {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) throw new Error("Invalid YouTube URL.");

        const imageUrl = `https://wsrv.nl/?url=img.youtube.com/vi/${videoId}/maxresdefault.jpg&output=jpg`;
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Could not fetch YouTube thumbnail.");
        const blob = await response.blob();
        imageToProcess = new File([blob], "yt-thumb.jpg", { type: "image/jpeg" });
      }

      if (imageToProcess) {
        const result = await generatePrompts(imageToProcess);
        setPrompts(result);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate prompts.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-all hover:shadow-xl flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generate Prompt</h3>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setInputType('link')}
          className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
            inputType === 'link' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Paste Link
        </button>
        <button
          onClick={() => setInputType('upload')}
          className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
            inputType === 'upload' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Upload Image
        </button>
      </div>

      <div className="mb-6">
        {inputType === 'link' ? (
           <div className="relative group">
              <input
                type="text"
                value={url}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 group-hover:bg-white dark:group-hover:bg-gray-900"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => { setUrl(''); setPreviewUrl(null); }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
           </div>
        ) : (
          <div 
             onClick={() => fileInputRef.current?.click()}
             className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 dark:bg-gray-950 group h-32"
          >
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
             <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center text-purple-500 mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
             </div>
             <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">Click to upload</p>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
          <img src={previewUrl} alt="Thumbnail Preview" className="w-full h-auto object-cover" />
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase backdrop-blur-sm">Source</div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
           {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading || !previewUrl}
        className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2 mb-6 ${
           isLoading || !previewUrl
           ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
           : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
        }`}
      >
        {isLoading ? 'Analyzing...' : 'Generate Prompt'}
      </button>

      {prompts && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Short Prompt</span>
              <button onClick={() => copyToClipboard(prompts.short)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-bold">Copy</button>
            </div>
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{prompts.short}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Detailed Prompt</span>
              <button onClick={() => copyToClipboard(prompts.detailed)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-bold">Copy</button>
            </div>
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium line-clamp-6 hover:line-clamp-none transition-all">{prompts.detailed}</p>
          </div>
        </div>
      )}
    </div>
  );
};