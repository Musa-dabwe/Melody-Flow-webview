
import React, { useState, useRef, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { Song, Page, PlayerContextType, RepeatMode } from './types';
import { SONGS } from './data/songs';
import NowPlayingPage from './pages/NowPlayingPage';
import PlaylistPage from './pages/PlaylistPage';
import SettingsPage from './pages/SettingsPage';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { RedditIcon } from './components/icons';

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

// Define the order of pages for swipe navigation and transitions
const pages: Page[] = ['NowPlaying', 'Playlist', 'Settings'];

const AboutModal = ({ onClose }: { onClose: () => void }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-200"
    onClick={onClose}
  >
    <div 
      className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-8 text-center relative border border-gray-700 animate-modal-enter"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <img 
        src="https://i.supaimg.com/1e815a52-6e4d-4750-bb48-2157fe21b36e.png" 
        alt="Fackson Musa" 
        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500 shadow-lg"
      />
      <h2 className="text-3xl font-bold text-white">Fackson Musa</h2>
      <p className="text-blue-400">Musathepoet LLC</p>
      <p className="text-sm text-gray-500 mb-6">Version v1.0.0</p>
      
      <div className="text-left my-6 border-t border-b border-gray-700 py-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About the App</h3>
          <p className="text-gray-300 mb-3">
              Built with React, Tailwind CSS, and jsmediatags.
          </p>
          <p className="text-gray-300">
              This web application is packaged within a native Android WebView app, developed with Kotlin in AIDE, to provide a complete offline experience.
          </p>
      </div>

      <a 
        href="https://www.reddit.com/user/Mwipapa_thePoet"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <RedditIcon className="w-5 h-5 mr-3" />
        <span>Visit on Reddit</span>
      </a>
      <p className="text-xs text-gray-600 mt-6">© 2025 Musathepoet LLC</p>
    </div>
  </div>
);


const App: React.FC = () => {
    const [page, setPage] = useState<Page>('Playlist');
    const [playlist, setPlaylist] = useState<Song[]>(SONGS);
    const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isShuffle, setIsShuffle] = useState<boolean>(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [toastMessage, setToastMessage] = useState('');
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    
    // State for swipe gestures
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const toastTimerRef = useRef<number | null>(null);

    const currentSong = currentSongIndex !== null ? playlist[currentSongIndex] : null;
    
    const showToast = useCallback((message: string) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToastMessage(message);
        toastTimerRef.current = window.setTimeout(() => {
            setToastMessage('');
            toastTimerRef.current = null;
        }, 1500);
    }, []);

    const playSong = useCallback((index: number) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    }, []);

    const togglePlayPause = useCallback(() => {
        if (currentSongIndex === null) {
            if (playlist.length > 0) {
                playSong(0);
            }
            return;
        }
        setIsPlaying(prev => !prev);
    }, [currentSongIndex, playlist, playSong]);

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => {
            const nextIsShuffle = !prev;
            showToast(nextIsShuffle ? 'Shuffle On' : 'Shuffle Off');
            return nextIsShuffle;
        });
    }, [showToast]);

    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'off') {
                showToast('Repeat All');
                return 'all';
            }
            if (prev === 'all') {
                showToast('Repeat One');
                return 'one';
            }
            showToast('Repeat Off');
            return 'off';
        });
    }, [showToast]);

    const playNext = useCallback(() => {
        if (currentSongIndex !== null) {
            if (isShuffle) {
                if (playlist.length <= 1) {
                    playSong(currentSongIndex); // Replay if only one song
                    return;
                }
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * playlist.length);
                } while (nextIndex === currentSongIndex);
                playSong(nextIndex);
            } else {
                const nextIndex = (currentSongIndex + 1) % playlist.length;
                playSong(nextIndex);
            }
        }
    }, [currentSongIndex, playlist.length, playSong, isShuffle]);

    const playPrev = useCallback(() => {
        if (currentSongIndex !== null) {
            const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            playSong(prevIndex);
        }
    }, [currentSongIndex, playlist.length, playSong]);

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentSong) {
            const isNewSong = audio.src !== currentSong.url;
            if (isNewSong) {
                audio.src = currentSong.url;
            }
    
            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Error playing audio:", error);
                        }
                    });
                }
            } else {
                audio.pause();
            }
        } else {
            audio.pause();
            audio.src = '';
        }
    }, [currentSong, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        
        const handleEnded = () => {
            if (currentSongIndex === null) return;
    
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
                return;
            }
    
            // With shuffle on, 'off' and 'all' behave the same: play a new random song.
            if (isShuffle) {
                playNext();
                return;
            }
    
            // Sequential playback
            const isLastSong = currentSongIndex === playlist.length - 1;
    
            if (!isLastSong) {
                playNext();
            } else { // It is the last song
                if (repeatMode === 'all') {
                    playNext(); // This will loop to the first song
                } else { // repeatMode is 'off'
                    setIsPlaying(false);
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [playNext, repeatMode, currentSongIndex, isShuffle, playlist.length]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        let target = e.target as HTMLElement;

        // Don't trigger swipe on interactive elements or horizontally scrollable containers
        if (target.closest('input, button, a')) {
            return;
        }

        while (target && target !== e.currentTarget) {
            if (target.scrollWidth > target.clientWidth) {
                return;
            }
            target = target.parentElement as HTMLElement;
        }

        setTouchStartX(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX === null || touchStartY === null) {
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        const swipeThreshold = 50; // Min pixels for a swipe

        // Check for horizontal swipe
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
            const currentPageIndex = pages.indexOf(page);
            if (diffX > 0) { // Swipe Left
                const nextPageIndex = (currentPageIndex + 1) % pages.length;
                setPage(pages[nextPageIndex]);
            } else { // Swipe Right
                const prevPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
                setPage(pages[prevPageIndex]);
            }
        }

        setTouchStartX(null);
        setTouchStartY(null);
    }, [page, touchStartX, touchStartY]);

    const contextValue: PlayerContextType = {
        isPlaying,
        currentSong,
        currentSongIndex,
        currentTime,
        duration,
        playlist,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        seek,
        setPlaylist,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
    };

    const pageIndex = useMemo(() => pages.indexOf(page), [page]);

    return (
        <PlayerContext.Provider value={contextValue}>
            <div className="bg-black text-gray-300 min-h-screen font-sans flex flex-col h-screen overflow-hidden">
                <main 
                    className="flex-1 overflow-hidden pb-20"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="flex h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${pageIndex * 100}%)` }}
                    >
                        <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                            <NowPlayingPage onNavigate={setPage} />
                        </div>
                        <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                            <PlaylistPage onNavigate={setPage} />
                        </div>
                        <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                            <SettingsPage onNavigate={setPage} onOpenAboutModal={() => setIsAboutModalOpen(true)} />
                        </div>
                    </div>
                </main>
                {isAboutModalOpen && page === 'Settings' && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
                <Toast message={toastMessage} />
                <BottomNav currentPage={page} setPage={setPage} />
                <audio ref={audioRef} />
            </div>
        </PlayerContext.Provider>
    );
};

export default App;
