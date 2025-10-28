

import React, { useMemo } from 'react';
import { usePlayer } from '../App';
import { Page, Song } from '../types';
import {
  ShuffleIcon, SkipBackIcon,
  PlayIcon, PauseIcon, SkipForwardIcon, RepeatIcon, ChevronRightIcon, PlaceholderIcon, RepeatOneIcon
} from '../components/icons';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ProgressBar: React.FC = () => {
    const { currentTime, duration, seek } = usePlayer();
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(Number(e.target.value));
    };

    return (
        <div className="w-full px-8">
            <div className="relative h-1.5 bg-gray-700 rounded-full">
                <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
};

const PlayerControls: React.FC = () => {
    const { isPlaying, togglePlayPause, playNext, playPrev, isShuffle, toggleShuffle, repeatMode, toggleRepeat } = usePlayer();

    const renderRepeatIcon = () => {
        if (repeatMode === 'one') {
            return <RepeatOneIcon className="w-6 h-6" />;
        }
        return <RepeatIcon className="w-6 h-6" />;
    };

    const repeatButtonColor = repeatMode === 'off' ? 'text-gray-400' : 'text-blue-400';

    return (
        <div className="flex items-center justify-center space-x-6 text-white px-8">
            <button onClick={toggleShuffle} className={`${isShuffle ? 'text-blue-400' : 'text-gray-400'} hover:text-white transition-colors`}><ShuffleIcon className="w-6 h-6" /></button>
            <button onClick={playPrev}><SkipBackIcon className="w-10 h-10" /></button>
            <button onClick={togglePlayPause} className="bg-blue-500 rounded-full p-5 shadow-lg transform hover:scale-105 transition-transform">
                {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
            </button>
            <button onClick={playNext}><SkipForwardIcon className="w-10 h-10" /></button>
            <button onClick={toggleRepeat} className={`${repeatButtonColor} hover:text-white transition-colors`}>
                {renderRepeatIcon()}
            </button>
        </div>
    );
};

const UpNextCard: React.FC<{ song: Song; isActive?: boolean }> = ({ song, isActive }) => (
  <div className={`flex-shrink-0 w-32 rounded-lg p-3 space-y-2 ${isActive ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-800/50'}`}>
    {song.cover ? (
      <img src={song.cover} alt={song.title} className="w-full h-24 object-cover rounded" />
    ) : (
      <div className="w-full h-24 bg-gray-700 rounded flex items-center justify-center">
        <PlaceholderIcon className="w-10 h-10 text-gray-500" />
      </div>
    )}
    <div>
      <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{song.title}</p>
      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
    </div>
  </div>
);


const NowPlayingPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const { currentSong, playlist, currentSongIndex, isShuffle } = usePlayer();

  const upNextSongs = useMemo(() => {
    if (!currentSong || currentSongIndex === null || playlist.length <= 1) {
        return [];
    }

    if (isShuffle) {
        const otherSongs = playlist.filter(s => s.id !== currentSong.id);
        for (let i = otherSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }
        return otherSongs.slice(0, 3);
    } else {
        const nextThree = [];
        for (let i = 1; i <= 3 && i < playlist.length; i++) {
            const nextIndex = (currentSongIndex + i) % playlist.length;
            nextThree.push(playlist[nextIndex]);
        }
        return nextThree;
    }
  }, [currentSong, currentSongIndex, playlist, isShuffle]);

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>No song selected.</p>
        <button onClick={() => onNavigate('Playlist')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Go to Playlist
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-gray-900 via-black to-black p-4 pt-8">
      <header className="flex justify-center items-center px-4">
        <h2 className="font-semibold text-lg">Now Playing</h2>
      </header>
      
      <div className="flex-1 flex flex-col justify-center space-y-8 mt-4">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 shadow-2xl mx-auto">
            {currentSong.cover ? (
              <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <PlaceholderIcon className="w-24 h-24 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
          </div>
        
        <div className="text-center w-full max-w-[560px] mx-auto px-4">
          <h1 className="text-3xl font-bold text-white truncate">{currentSong.title}</h1>
          <p className="text-lg text-gray-400 truncate">{currentSong.artist}</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <ProgressBar />
        <PlayerControls />

        <div className="px-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Up Next</h3>
                <button onClick={() => onNavigate('Playlist')} className="text-sm text-blue-400 flex items-center">View All <ChevronRightIcon className="w-4 h-4 ml-1" /></button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                {upNextSongs.map((song) => (
                    <UpNextCard key={song.id} song={song} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingPage;