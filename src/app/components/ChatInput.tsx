// src/components/ChatInput.tsx

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { GifSearch } from './GifSearch';

interface ChatInputProps {
  onSendMessage: (content: string, gifUrl?: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifSearch, setShowGifSearch] = useState(false);

  const handleOpenGifSearch = () => {
    setShowGifSearch(true);
  };

  const handleCloseGifSearch = () => {
    setShowGifSearch(false);
  };

  const handleSelectGif = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifSearch(false);
    setMessage(''); // Clear any text message when a GIF is selected (optional)
  };

  const handleSend = () => {
    if (message.trim() || selectedGif) {
      onSendMessage(message.trim(), selectedGif || undefined);
      setMessage('');
      setSelectedGif(null);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={handleOpenGifSearch}
      />
      <div className="absolute top-0 right-0 mt-1 mr-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleOpenGifSearch}
        >
          GIF
        </Button>
      </div>

      {showGifSearch && (
        <div className="absolute bottom-full left-0 right-0 bg-white z-10 shadow-md rounded-md mb-2">
          <GifSearch onSelect={handleSelectGif} onClose={handleCloseGifSearch} />
        </div>
      )}

      <div className="mt-2">
        {selectedGif && (
          <div className="mb-2 flex items-center space-x-2">
            <img src={selectedGif} alt="Selected GIF Preview" className="max-h-16 rounded-md" />
            <Button size="sm" onClick={() => setSelectedGif(null)}>Remove GIF</Button>
          </div>
        )}
        <Button onClick={handleSend} disabled={!message.trim() && !selectedGif}>
          Send
        </Button>
      </div>
    </div>
  );
}