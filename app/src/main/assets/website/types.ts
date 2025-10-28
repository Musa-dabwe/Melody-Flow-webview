
import type { Dispatch, SetStateAction } from 'react';

export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
  url: string;
}

export type Page = 'NowPlaying' | 'Playlist' | 'Settings';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerContextType {
  isPlaying: boolean;
  currentSong: Song | null;
  currentSongIndex: number | null;
  currentTime: number;
  duration: number;
  playlist: Song[];
  playSong: (index: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setPlaylist: Dispatch<SetStateAction<Song[]>>;
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
}
