
import React, { useRef, useState } from 'react';
import { Page, Song } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { usePlayer } from '../App';

// Make jsmediatags available from the window object
declare global {
  interface Window {
    jsmediatags: any;
  }
}

interface SettingItemProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ title, description, onClick }) => {
  return (
    <div className="flex justify-between items-center py-4 cursor-pointer" onClick={onClick}>
      <div>
        <p className="text-white">{title}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <ChevronRightIcon className="w-5 h-5 text-gray-500" />
    </div>
  );
};


const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-900 rounded-xl p-4">
    <h3 className="text-sm text-gray-400 px-2 pb-2">{title}</h3>
    <div className="divide-y divide-gray-800">{children}</div>
  </div>
);

const getAudioDuration = (file: File): Promise<string> => {
  return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
          const seconds = audio.duration;
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = Math.floor(seconds % 60);
          resolve(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
          URL.revokeObjectURL(audio.src);
      });
      audio.addEventListener('error', () => {
          resolve('0:00');
          URL.revokeObjectURL(audio.src);
      });
  });
};

const getCoverUrl = (picture: any): Promise<string> => {
    return new Promise((resolve) => {
        if (!picture) {
            resolve('');
            return;
        }
        try {
            const { data, format } = picture;
            const blob = new Blob([new Uint8Array(data)], { type: format });
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target?.result as string || '');
            };
            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                resolve('');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error("Error creating cover URL:", error);
            resolve('');
        }
    });
};

const parseFileName = (fileName: string): { title: string; artist: string } => {
    // 1. Remove file extension. e.g., "song.mp3" -> "song"
    const baseName = fileName.replace(/\.[^/.]+$/, "").trim();

    // 2. Remove common track number prefixes. e.g., "01. song" -> "song"
    // This regex looks for: start of string, optional space, 1-3 digits,
    // one or more common separators (., -, _, space), and optional space.
    let cleanedName = baseName.replace(/^\s*\d{1,3}[.\-_\s]+\s*/, '');
    
    // If removing the prefix resulted in an empty string (e.g. filename was "01.mp3"), revert.
    if (!cleanedName.trim()) {
        cleanedName = baseName;
    }

    // 3. Split by common "artist - title" separators.
    // This regex looks for dash, en-dash, or em-dash surrounded by one or more spaces.
    const parts = cleanedName.split(/\s+[-–—]\s+/);

    if (parts.length > 1) {
        // If a separator is found, assume the first part is the artist and the rest is the title.
        // This handles titles that might also contain a dash.
        return {
            artist: parts[0].trim(),
            title: parts.slice(1).join(' - ').trim(),
        };
    }
    
    // 4. Fallback if no clear separator is found.
    return {
        artist: 'Unknown Artist',
        title: cleanedName, // Use the name after removing track number
    };
};

const fetchOnlineCoverArt = async (artist: string, title: string): Promise<string> => {
    if (!artist || !title || artist === 'Unknown Artist') {
        return '';
    }
    try {
        const searchTerm = encodeURIComponent(`${artist} ${title}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=1&media=music`);
        if (!response.ok) {
            console.error(`iTunes API request failed with status: ${response.status}`);
            return '';
        }
        const data = await response.json();
        if (data.resultCount > 0 && data.results[0].artworkUrl100) {
            // Request a higher resolution image by replacing the size in the URL
            return data.results[0].artworkUrl100.replace('100x100', '600x600');
        }
    } catch (error) {
        console.error('Failed to fetch online cover art:', error);
    }
    return '';
};


const processAudioFile = (file: File, index: number): Promise<Song> => {
    return new Promise((resolve) => {
        const createSongObject = async (metadata: { title: string; artist: string; picture?: any }) => {
            const duration = await getAudioDuration(file);
            let coverUrl = '';

            if (metadata.picture) {
                coverUrl = await getCoverUrl(metadata.picture);
            }

            if (!coverUrl) {
                coverUrl = await fetchOnlineCoverArt(metadata.artist, metadata.title);
            }

            resolve({
                id: Date.now() + index,
                title: metadata.title,
                artist: metadata.artist,
                duration,
                cover: coverUrl,
                url: URL.createObjectURL(file),
            });
        };

        const { title: parsedTitle, artist: parsedArtist } = parseFileName(file.name);

        if (window.jsmediatags) {
            window.jsmediatags.read(file, {
                onSuccess: (tag: any) => {
                    const { tags } = tag;
                    createSongObject({
                        title: tags.title || parsedTitle,
                        artist: tags.artist || parsedArtist,
                        picture: tags.picture,
                    });
                },
                onError: (error: any) => {
                    console.error('Error reading metadata for file:', file.name, error);
                    createSongObject({ title: parsedTitle, artist: parsedArtist });
                },
            });
        } else {
            console.warn('jsmediatags library not found, using fallback.');
            createSongObject({ title: parsedTitle, artist: parsedArtist });
        }
    });
};

const SettingsPage: React.FC<{ onNavigate: (page: Page) => void; onOpenAboutModal: () => void; }> = ({ onNavigate, onOpenAboutModal }) => {
  const { setPlaylist } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Preparing to import...');

    const newSongs: Song[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const message = `Processing ${i + 1} of ${totalFiles}: ${file.name}`;
        setProcessingMessage(message);

        try {
            const song = await processAudioFile(file, i);
            newSongs.push(song);
        } catch (error) {
            console.error(`Failed to process file: ${file.name}`, error);
        }
        
        setProcessingProgress(((i + 1) / totalFiles) * 100);
    }
    
    setPlaylist(currentPlaylist => [...currentPlaylist, ...newSongs]);
    
    setIsProcessing(false);
    onNavigate('Playlist');
  };

  const handleUploadClick = () => {
    if (isProcessing) return;
    // FIX: Corrected variable name from fileInput to fileInputRef.
    fileInputRef.current?.click();
  };


  return (
    <div className="p-4 space-y-6">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
          <div className="w-11/12 max-w-sm bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Importing Music</h3>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${processingProgress}%` }}></div>
            </div>
            <p className="text-sm text-gray-300 truncate" title={processingMessage}>{processingMessage}</p>
          </div>
        </div>
      )}
      <header className="flex items-center relative">
        <button onClick={() => onNavigate('Playlist')} className="p-2 absolute left-0">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white text-center flex-grow">Settings</h1>
        <div className="w-6 absolute right-0"></div>
      </header>

      <SettingsSection title="Library Settings">
        <SettingItem title="Upload Local Playlist" description="Select audio files from your device" onClick={handleUploadClick} />
      </SettingsSection>

      <SettingsSection title="Application">
        <SettingItem title="About Melody Flow" description="Information about the app and developer" onClick={onOpenAboutModal} />
      </SettingsSection>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".mp3,.wav,.flac,.m4a"
        style={{ display: 'none' }}
        disabled={isProcessing}
      />
    </div>
  );
};

export default SettingsPage;
