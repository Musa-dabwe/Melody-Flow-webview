
import React from 'react';
import { Page } from '../types';
import { HomeIcon, ListIcon, CogIcon } from './icons';

interface BottomNavProps {
  currentPage: Page;
  setPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setPage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <NavItem
          label="Player"
          icon={<HomeIcon className="w-6 h-6" />}
          isActive={currentPage === 'NowPlaying'}
          onClick={() => setPage('NowPlaying')}
        />
        <NavItem
          label="Playlist"
          icon={<ListIcon className="w-6 h-6" />}
          isActive={currentPage === 'Playlist'}
          onClick={() => setPage('Playlist')}
        />
        <NavItem
          label="Settings"
          icon={<CogIcon className="w-6 h-6" />}
          isActive={currentPage === 'Settings'}
          onClick={() => setPage('Settings')}
        />
      </div>
    </div>
  );
};

export default BottomNav;
