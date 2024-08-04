import { useEffect, useState } from 'react';
import { CustomUser } from 'next-auth';
import { Input } from './ui/input';

interface SidebarProps {
  currentUser: CustomUser;
  onSelectChatRoom: (chatRoomId: string) => void;
}

export function Sidebar({ currentUser, onSelectChatRoom }: SidebarProps) {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/chatrooms?userId=${currentUser.id}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched chat rooms:', data);
        setChatRooms(data);
      })
      .catch(error => console.error('Error fetching chat rooms:', error));
  }, [currentUser.id]);

  const handleSearch = () => {
    fetch(`/api/users?query=${searchQuery}`)
      .then(response => response.json())
      .then(data => {
        console.log('Search results:', data); // Log the response to verify
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          console.error('Expected an array but received:', data);
          setSearchResults([]);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setSearchResults([]);
      });
  };

  const handleSelectUser = async (userId: string) => {
    console.log('Selected user ID:', userId); // Log selected user ID
    try {
      const response = await fetch('/api/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: currentUser.id, // Assuming currentUser is set correctly
          userId2: userId,
        }),
      });

      const data = await response.json();
      console.log('Chat room data:', data); // Log chat room data
      onSelectChatRoom(data.chatRoom.id);
    } catch (error) {
      console.error('Error creating or fetching chat room:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 min-w-[300px] p-4 border-r h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <ul>
          {searchResults.map(user => (
            <li key={user.id}>
              <button
                onClick={() => handleSelectUser(user.id)}
                className="text-left w-full py-2 px-4 hover:bg-gray-200"
              >
                {user.name || user.email}
              </button>
            </li>
          ))}
        </ul>
        <ul>
          {chatRooms.map(chatRoom => (
            <li key={chatRoom.id}>
              <button
                onClick={() => onSelectChatRoom(chatRoom.id)}
                className="text-left w-full py-2 px-4 hover:bg-gray-200"
              >
                {chatRoom.userNames || 'Unnamed Chat Room'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
