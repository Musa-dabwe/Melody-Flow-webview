
import React, { useState } from 'react';
import { Page } from '../types';
import { ScanIcon } from '../components/icons';

const ScanMediaPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [foundFiles, setFoundFiles] = useState(0);

    const handleStartScan = () => {
        setIsScanning(true);
        setScanProgress(0);
        setFoundFiles(0);

        // Simulate scanning process
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const nextProgress = prev + 5;
                if (nextProgress >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    return 100;
                }
                if (Math.random() > 0.7) {
                    setFoundFiles(f => f + Math.floor(Math.random() * 3));
                }
                return nextProgress;
            });
        }, 200);
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <header className="flex items-center relative mb-6">
                <h1 className="text-xl font-bold text-white text-center flex-grow">Scan Media</h1>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="bg-gray-800/50 p-8 rounded-full mb-8 border border-gray-700">
                     <ScanIcon className="w-20 h-20 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Scan Device for Music</h2>
                <p className="text-gray-400 max-w-xs">
                    Find all the audio files on your device and add them to your Melody Flow library.
                </p>

                <div className="w-full max-w-sm mt-10">
                    {isScanning ? (
                        <div className="w-full">
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-300">Scanning... {scanProgress}%</p>
                            <p className="text-sm text-gray-400 mt-1">Found {foundFiles} new songs.</p>
                        </div>
                    ) : (
                        <button 
                            onClick={handleStartScan}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg transform hover:scale-105"
                        >
                            Start Scan
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-600 mt-6 px-4">
                    This feature is designed to connect with a native Android application to scan for local files.
                </p>
            </div>
        </div>
    );
};

export default ScanMediaPage;
