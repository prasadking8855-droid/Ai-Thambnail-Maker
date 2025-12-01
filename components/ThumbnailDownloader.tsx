import React, { useState } from 'react';
import { extractYouTubeVideoId } from '../utils';

type Resolution = 'maxres' | 'sd' | 'hq';

export const ThumbnailDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [selectedRes, setSelectedRes] = useState<Resolution>('maxres');
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVideoId(null);

    const id = extractYouTubeVideoId(url);
    if (!id) {
      setError('Could not fetch thumbnail. Check the URL.');
      return;
    }
    setVideoId(id);
  };

  const getImageUrl = (id: string, res: Resolution) => {
    switch (res) {
      case 'maxres': return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      case 'sd': return `https://img.youtube.com/vi/${id}/sddefault.jpg`;
      case 'hq': return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      default: return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  };

  const handleDownload = async () => {
    if (!videoId) return;
    setIsDownloading(true);
    setError(null);
    
    const imageUrl = getImageUrl(videoId, selectedRes);
    const fileName = `youtube-thumbnail-${videoId}-${selectedRes}.jpg`;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
         window.open(imageUrl, '_blank');
      } else {
         setError('Download failed. Try another video.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-all hover:shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 1.5v15" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Download Thumbnail</h3>
      </div>

      <form onSubmit={handleFetch} className="mb-6 relative">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Video Link
        </label>
        <div className="relative group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL..."
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl pl-4 pr-24 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 group-hover:bg-white dark:group-hover:bg-gray-900"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1.5 bottom-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white px-4 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide"
          >
            Fetch
          </button>
        </div>
        {url && (
            <button
              type="button"
              onClick={() => { setUrl(''); setVideoId(null); }}
              className="absolute right-20 top-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
        )}
      </form>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
           {error}
        </div>
      )}

      {videoId && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex">
            {(['maxres', 'sd', 'hq'] as Resolution[]).map((res) => (
              <button
                key={res}
                onClick={() => setSelectedRes(res)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                  selectedRes === res
                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {res === 'maxres' ? 'HD (720p)' : res === 'sd' ? 'SD (480p)' : 'STD (360p)'}
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800 aspect-video relative group">
            <img src={getImageUrl(videoId, selectedRes)} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isDownloading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3 3m-3-3l3-3m-3 3h12.75" /></svg>
            )}
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};