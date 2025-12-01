import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  title: string;
  onApply: (maskedImageBase64: string, instruction: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const POPULAR_FONTS = [
  "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", 
  "Oswald", "Bangers", "Impact", "Anton", "Raleway", 
  "Futura", "Helvetica", "Arial Black", "Comic Sans MS", 
  "Pacifico", "Lobster", "Bebas Neue", "Inter", "Playfair Display"
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, title, onApply, onCancel, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [editType, setEditType] = useState<'remove' | 'regenerate'>('remove');
  const [customPrompt, setCustomPrompt] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [history, setHistory] = useState<{ x: number; y: number; size: number }[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentStrokeRef = useRef<{ x: number; y: number; size: number }[]>([]);

  // Font Picker State
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [fontSearch, setFontSearch] = useState('');

  // Text Styling State
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState<'Small' | 'Medium' | 'Large' | 'Huge'>('Medium');
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
      setEditType('remove');
      setBrushSize(40);
  }, []);

  const redrawCanvas = useCallback((targetIndex: number, currentHistory: { x: number; y: number; size: number }[][] = history) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !imageRef.current) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(255, 0, 0, 0.5)';

    for (let i = 0; i <= targetIndex; i++) {
      const stroke = currentHistory[i];
      if (!stroke || stroke.length === 0) continue;
      context.lineWidth = stroke[0].size || 40;
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      for (let j = 1; j < stroke.length; j++) {
        context.lineTo(stroke[j].x, stroke[j].y);
      }
      context.stroke();
    }
  }, [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    setCtx(context);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      if (containerRef.current) {
        canvas.width = 1280; 
        canvas.height = 720;
        redrawCanvas(-1, []);
      }
    };
  }, [imageUrl]); 

  const handleUndo = () => {
    if (historyIndex >= 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHasSelection(newIndex >= 0);
      redrawCanvas(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHasSelection(true);
      redrawCanvas(newIndex);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo(); else handleUndo();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, redrawCanvas]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
    else { clientX = e.nativeEvent.clientX; clientY = e.nativeEvent.clientY; }
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    if (!ctx) return;
    setIsDrawing(true);
    setHasSelection(true);
    currentStrokeRef.current = [{x, y, size: brushSize}]; 
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = brushSize;
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    if (!isDrawing || !ctx) return;
    currentStrokeRef.current.push({x, y, size: brushSize});
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (ctx) ctx.closePath();
    const stroke = currentStrokeRef.current;
    if (stroke.length > 0) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(stroke);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setHasSelection(true);
    }
  };

  const clearMask = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setHasSelection(false);
    redrawCanvas(-1, []);
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const maskedBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    let instruction = "";
    if (editType === 'remove') {
        instruction = "Remove the object highlighted in red. Fill the area seamlessly with the background.";
    } else {
        const basePrompt = customPrompt.trim();
        instruction = basePrompt ? `Replace the object highlighted in red with: ${basePrompt}.` : "Regenerate the highlighted area to improve quality and details.";
        if (selectedFont) {
            instruction += ` IMPORTANT: Render any text in this area using Font: "${selectedFont}", Color: ${fontColor} (Hex Code), Size: ${fontSize}, Alignment: ${textAlignment}.`;
        }
    }
    onApply(maskedBase64, instruction);
  };

  const handleAddTextMode = () => {
    setEditType('regenerate');
    setSelectedFont('Roboto');
    setFontSize('Medium');
    setFontColor('#ffffff');
    setTextAlignment('center');
    setCustomPrompt(''); 
    setBrushSize(40);
  };

  const filteredFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative z-20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600 dark:text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Magic Editor
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 flex items-center gap-6">
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wide">Brush Size</span>
            <input 
                type="range" 
                min="10" 
                max="150" 
                value={brushSize} 
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
            />
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50" style={{ width: brushSize/3, height: brushSize/3 }}></div>
        </div>
        
        <div 
          ref={containerRef}
          className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 touch-none cursor-crosshair shadow-inner"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full object-contain block"
          />
        </div>

        {selectedFont && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 animate-fade-in">
             <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Text Style:</span>
             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer hover:scale-105 transition-transform">
               <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0" />
             </div>
             <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
             <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
               {(['Small', 'Medium', 'Large', 'Huge'] as const).map(size => (
                 <button key={size} onClick={() => setFontSize(size)} className={`px-3 py-1 text-xs font-bold rounded transition-colors ${fontSize === size ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>{size}</button>
               ))}
             </div>
             <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
             <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
               {(['left', 'center', 'right'] as const).map(align => (
                  <button key={align} onClick={() => setTextAlignment(align)} className={`p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 ${textAlignment === align ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       {align === 'left' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />}
                       {align === 'center' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
                       {align === 'right' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
                    </svg>
                  </button>
               ))}
             </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-8 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto relative">
             <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
               <button onClick={handleUndo} disabled={historyIndex < 0} className={`p-2 rounded transition-colors ${historyIndex < 0 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}`} title="Undo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg></button>
               <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-2 rounded transition-colors ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}`} title="Redo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg></button>
             </div>
             <button onClick={clearMask} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors px-2" disabled={!hasSelection || isLoading}>Clear</button>

             <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

             <button onClick={handleAddTextMode} disabled={isLoading} className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-bold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                <span>Add Text</span>
             </button>

             <div className="relative">
               <button onClick={() => setShowFontPicker(!showFontPicker)} disabled={isLoading} className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold shadow-sm ${selectedFont ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
                  <span>{selectedFont || "Fonts"}</span>
                  {selectedFont && <span onClick={(e) => { e.stopPropagation(); setSelectedFont(null); }} className="ml-1 hover:text-red-500 cursor-pointer">&times;</span>}
               </button>
               {showFontPicker && (
                 <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-64">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800"><input type="text" placeholder="Search fonts..." value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500" /></div>
                    <div className="overflow-y-auto flex-1 p-1">
                      {filteredFonts.map(font => (
                        <button key={font} onClick={() => { setSelectedFont(font); setShowFontPicker(false); setEditType('regenerate'); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors ${selectedFont === font ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{font}</button>
                      ))}
                    </div>
                 </div>
               )}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-1 justify-end">
             <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { setEditType('remove'); setSelectedFont(null); setBrushSize(40); }}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${editType === 'remove' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Remove
                </button>
                <button
                  onClick={() => { setEditType('regenerate'); setBrushSize(40); }}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${editType === 'regenerate' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Replace
                </button>
             </div>

             {editType === 'regenerate' && (
               <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                 <input type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={selectedFont ? "Enter text content..." : "What should replace it? (e.g. 'cat')"} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-inner" />
               </div>
             )}

             <button
                onClick={handleApply}
                disabled={isLoading || !hasSelection || (editType === 'regenerate' && !customPrompt.trim() && !selectedFont)}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all whitespace-nowrap active:scale-[0.98] ${
                   isLoading || !hasSelection || (editType === 'regenerate' && !customPrompt.trim() && !selectedFont)
                   ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
                   : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
             >
               {isLoading ? 'Processing...' : 'Apply Magic'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};