import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 border-t border-gray-200 dark:border-gray-800/50 bg-white dark:bg-gray-950 pt-16 pb-8 relative overflow-hidden transition-colors">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Section: SEO Articles (Grid) */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">High CTR Design</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Thumbnails with high contrast and vibrant colors (neon yellows, reds) stand out against YouTube's interface. Our AI enhances saturation to grab attention instantly.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
             <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-500 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Facial Emotion</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Faces with strong emotional cues (joy, surprise) drive more clicks. We match the generated expression to your video title's tone for maximum impact.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
             <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 text-green-500 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Perfect Specs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Optimized for 1280x720px (16:9). We ensure your files are under 2MB for fast loading while maintaining crispy HD quality on all devices.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 my-12"></div>

        {/* Middle Section: Brand & Contact */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.283 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                AI Thumbnail Maker
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Empowering creators with professional, AI-generated thumbnails. Increase your views and grow your channel with click-worthy designs in seconds.
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h4>
            <div className="space-y-4">
              
              {/* Email */}
              <a 
                href="mailto:jubairzaidi536@gmail.com" 
                className="flex items-center group p-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Email Support</p>
                  <p className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">jubairzaidi536@gmail.com</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/917086372337" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center group p-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-green-500/50 hover:bg-green-500/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">WhatsApp</p>
                  <p className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">+91 70863 72337</p>
                </div>
              </a>

            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AI Thumbnail Maker. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};