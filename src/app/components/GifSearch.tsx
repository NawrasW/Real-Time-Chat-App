import { useState } from 'react';

// GIF Search Component
export function GifSearch({ onSelect, onClose }: { onSelect: (gifUrl: string) => void; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gifs/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGifs(data);
    } catch (e: any) {
      setError('Failed to load GIFs. Please try again.');
      console.error("GIF search error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 flex justify-center items-center">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search GIFs</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button onClick={handleSearch} className="mt-2 p-2 bg-blue-500 text-white rounded w-full">
            Search
          </button>
        </div>
        {loading && <p className="text-gray-600">Loading GIFs...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-96">
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.fixed_height_small.url}
              alt="GIF"
              className="w-full cursor-pointer rounded-md"
              onClick={() => {
                onSelect(gif.images.fixed_height_small.url);
                onClose();
              }}
            />
          ))}
          {gifs.length === 0 && !loading && !error && <p className="text-gray-500 col-span-3 text-center">No GIFs found for your search.</p>}
        </div>
      </div>
    </div>
  );
}