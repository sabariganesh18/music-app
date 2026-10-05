import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/artist/${artist.id}`)}
      className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-md hover:shadow-card-hover"
    >
      {/* Round Artist Image */}
      <div className="relative w-full aspect-square mb-3.5 rounded-full overflow-hidden bg-[#242424] shadow-lg">
        <img
          src={artist.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
          alt={artist.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play Button on hover */}
        <div className="absolute right-2 bottom-2 w-11 h-11 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </div>
      </div>

      <div className="w-full min-w-0">
        <h3 className="font-semibold text-sm text-white truncate mb-1">
          {artist.name}
        </h3>
        <p className="text-xs text-[#a0a0a0]">
          Artist
        </p>
      </div>
    </div>
  );
};

export default ArtistCard;
