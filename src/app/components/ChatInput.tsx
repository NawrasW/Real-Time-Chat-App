// src/components/ChatInput.tsx

import { useState } from 'react';
import { Input } from './ui/input';
import {GifSearch} from './GifSearch';

interface ChatInputProps {
  onSendMessage: (content: string, gifUrl?: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifSearch, setShowGifSearch] = useState(false);

  const handleSend = () => {
    if (message || selectedGif) {
      onSendMessage(message,  selectedGif || undefined);
      setMessage('');
      setSelectedGif(null);
    }
  };

  return (
    <div>
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setShowGifSearch(true)} // Show GIF search when focused
      />
      <button onClick={() => setShowGifSearch((prev) => !prev)}>
        {showGifSearch ? 'Close GIF Search' : 'Add GIF'}
      </button>
      {showGifSearch && (
        <GifSearch onSelect={(gifUrl) => {
          setSelectedGif(gifUrl);
          setShowGifSearch(false);
        }} />
      )}
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
