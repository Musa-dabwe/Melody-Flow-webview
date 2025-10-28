
import React, { useState, useMemo } from 'react';
import { usePlayer } from '../App';
import { Page, Song } from '../types';
import { CogIcon, MoreVerticalIcon, SearchIcon, SoundWaveIcon, PlaceholderIcon } from '../components/icons';

interface SongItemProps {
  song: Song;
  isPlaying: boolean;
  onPlay: () => void;
}

const SongItem: React.FC<SongItemProps> = ({ song, isPlaying, onPlay }) => (
  <li
    onClick={onPlay}
    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
      isPlaying ? 'bg-blue-900/50' : 'hover:bg-gray-800/70'
    }`}
  >
    {song.cover ? (
      <img src={song.cover} alt={song.title} className="w-12 h-12 rounded object-cover" />
    ) : (
      <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center">
        <PlaceholderIcon className="w-6 h-6 text-gray-500" />
      </div>
    )}
    <div className="ml-4 flex-1 min-w-0">
      <p className={`font-semibold truncate ${isPlaying ? 'text-blue-400' : 'text-white'}`}>{song.title}</p>
      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-400">{song.duration}</span>
      {isPlaying && <SoundWaveIcon className="w-5 h-5 text-blue-400" />}
      <button className="text-gray-500 hover:text-white p-1">
        <MoreVerticalIcon className="w-5 h-5" />
      </button>
    </div>
  </li>
);

const PlaylistPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const { playlist, playSong, currentSong } = usePlayer();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = useMemo(() => {
    return playlist.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [playlist, searchTerm]);

  return (
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-center">
         <h1 className="text-3xl font-bold text-white">Playlist</h1>
         <button onClick={() => onNavigate('Settings')} className="p-2 text-gray-400 hover:text-white">
          <CogIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="relative">
        <input
          type="text"
          placeholder="Search Playlist"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-400 mb-2">{filteredSongs.length} songs</p>
        {filteredSongs.length > 0 ? (
          <ul className="space-y-1">
            {filteredSongs.map((song) => {
              const originalIndex = playlist.findIndex(p => p.id === song.id);
              return (
                <SongItem
                  key={song.id}
                  song={song}
                  isPlaying={currentSong?.id === song.id}
                  onPlay={() => {
                      playSong(originalIndex);
                      onNavigate('NowPlaying');
                  }}
                />
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">Your playlist is empty.</p>
            <p>Go to <button onClick={() => onNavigate('Settings')} className="text-blue-400 font-semibold hover:underline">Settings</button> to upload your music.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
