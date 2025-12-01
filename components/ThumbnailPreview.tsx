import React from 'react';

interface ThumbnailPreviewProps {
  generatedImageUrl: string;
  onReset: () => void;
  onRegenerate: () => void;
  onEdit: (mode: 'general') => void;
  isLoading: boolean;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ generatedImageUrl, onReset, onRegenerate, onEdit, isLoading }) => {
  
  const handleCanvaClick = () => {
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `ai-thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        window.open('https://www.canva.com/create/youtube-thumbnails/', '_blank');
        alert("Image downloaded! \n\n1. Canva is opening in a new tab.\n2. Drag and drop your downloaded thumbnail onto the white canvas to start adding text and effects!");
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center space-x-3">
            <span className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full block"></span>
            <span>Result</span>
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCanvaClick}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8] hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                <path d="M16.5 7.5a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0z" fillOpacity="0.5"/>
              </svg>
              <span>Edit in Canva</span>
            </button>

             <button
              onClick={() => onEdit('general')}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span>Magic Edit</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isLoading 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent cursor-wait' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 active:scale-95'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>{isLoading ? 'Regenerating...' : 'Regenerate'}</span>
            </button>

            <button
              onClick={onReset}
              disabled={isLoading}
              className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors px-2"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="relative group rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800 aspect-video bg-gray-50 dark:bg-gray-800">
          <img
            src={generatedImageUrl}
            alt="Generated Thumbnail"
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoading ? 'scale-[1.02] blur-sm grayscale-[70%] opacity-50' : 'scale-100 opacity-100 grayscale-0'}`}
          />
          
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-500">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Polishing...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Applying final touches</p>
            </div>
          )}
          
          {!isLoading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
              <a
                href={generatedImageUrl}
                download="thumbnail.png"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold transform hover:scale-105 transition-all shadow-2xl flex items-center space-x-3 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3 3m-3-3l3-3m-3 3h12.75" />
                </svg>
                <span>Download Image</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};