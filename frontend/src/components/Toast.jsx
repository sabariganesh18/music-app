import React from 'react';
import { useMusicData } from '../context/MusicDataContext';
import { Info } from 'lucide-react';

const Toast = () => {
  const { toastMessage } = useMusicData();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-[#1db954] text-black font-semibold text-xs md:text-sm px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
        <Info className="w-4 h-4 text-black" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default Toast;
