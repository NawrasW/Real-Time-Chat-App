import { useState } from 'react';

// GIF Search Component
export function GifSearch({ onSelect }: { onSelect: (gifUrl: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);

  const handleSearch = async () => {
    const response = await fetch(`/api/gifs/search?query=${searchQuery}`);
    const data = await response.json();
    setGifs(data);
  };

  return (
    <div className="absolute inset-0 bg-white z-10 overflow-auto p-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search GIFs..."
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />
      <button onClick={handleSearch} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Search
      </button>
      <div className="grid grid-cols-3 gap-2">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height_small.url}
            alt="GIF"
            className="w-full cursor-pointer"
            onClick={() => onSelect(gif.images.fixed_height_small.url)}
          />
        ))}
      </div>
    </div>
  );
}
