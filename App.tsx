import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ThumbnailForm } from './components/ThumbnailForm';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { ThumbnailDownloader } from './components/ThumbnailDownloader';
import { PromptGenerator } from './components/PromptGenerator';
import { ImageEditor } from './components/ImageEditor';
import { generateThumbnail, editThumbnail } from './services/geminiService';
import { GenerateThumbnailParams, ThumbnailState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ThumbnailState>({
    title: '',
    imageFile: null,
    referenceImageFile: null,
    imagePreviewUrl: null,
    generatedImageUrl: null,
    isLoading: false,
    error: null,
    editingMode: 'none',
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Sync with local storage on mount
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.theme = newTheme;
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.generatedImageUrl && !state.isLoading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state.generatedImageUrl, state.isLoading]);

  const handleImageSelect = (url: string) => {
    setState(prev => ({ ...prev, imagePreviewUrl: url, error: null }));
  };

  const handleGenerate = async (data: GenerateThumbnailParams) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      title: data.title,
      imageFile: data.imageFile,
      referenceImageFile: data.referenceImageFile || null,
      editingMode: 'none'
    }));
    
    try {
      const generatedImage = await generateThumbnail(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        generatedImageUrl: generatedImage,
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Something went wrong while generating the thumbnail. Please try again.",
      }));
    }
  };

  const handleRegenerate = async () => {
    if (!state.title || !state.imageFile) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, editingMode: 'none' }));

    try {
      const generatedImage = await generateThumbnail({
        title: state.title,
        imageFile: state.imageFile,
        referenceImageFile: state.referenceImageFile || undefined
      });
      setState(prev => ({
        ...prev,
        isLoading: false,
        generatedImageUrl: generatedImage,
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Something went wrong while regenerating the thumbnail. Please try again.",
      }));
    }
  };

  const handleEditApply = async (maskedImageBase64: string, instruction: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newImageUrl = await editThumbnail(maskedImageBase64, instruction);
      setState(prev => ({
        ...prev,
        isLoading: false,
        generatedImageUrl: newImageUrl,
        editingMode: 'none' 
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to edit image.",
      }));
    }
  };

  const handleReset = () => {
    setState({
      title: '',
      imageFile: null,
      referenceImageFile: null,
      imagePreviewUrl: null,
      generatedImageUrl: null,
      isLoading: false,
      error: null,
      editingMode: 'none'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-900 dark:text-white selection:bg-purple-500/30 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Header theme={theme} toggleTheme={toggleTheme} />

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start max-w-[1440px] mx-auto w-full relative">
          
          {/* Main Generator Section */}
          <main className="w-full lg:flex-1 flex flex-col items-center order-2 lg:order-1 min-w-0">
            {state.error && (
              <div className="w-full mb-6 p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-200 animate-fade-in shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            <ThumbnailForm 
              isLoading={state.isLoading}
              onSubmit={handleGenerate}
              onImageSelect={handleImageSelect}
            />

            {state.generatedImageUrl && (
              <div ref={resultsRef} className="w-full mt-12 animate-fade-in-up">
                 <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-12"></div>
                 
                 {state.editingMode !== 'none' ? (
                   <ImageEditor 
                     imageUrl={state.generatedImageUrl}
                     title={state.title} 
                     onApply={handleEditApply}
                     onCancel={() => setState(prev => ({ ...prev, editingMode: 'none' }))}
                     isLoading={state.isLoading}
                   />
                 ) : (
                   <ThumbnailPreview 
                    generatedImageUrl={state.generatedImageUrl}
                    onReset={handleReset}
                    onRegenerate={handleRegenerate}
                    onEdit={(mode) => setState(prev => ({ ...prev, editingMode: mode }))}
                    isLoading={state.isLoading}
                  />
                 )}
              </div>
            )}
          </main>

          {/* Sidebar Tools */}
          <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col gap-6 order-1 lg:order-2 lg:sticky lg:top-8 animate-fade-in">
             <div className="hidden lg:block mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                   YouTube Thumbnail Tools
                </h3>
             </div>
             
             <div className="flex flex-col gap-6">
                <ThumbnailDownloader />
                <PromptGenerator />
             </div>
          </aside>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default App;