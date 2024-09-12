import { SVGProps, useEffect, useState } from 'react';
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
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error('Error fetching chat rooms:', data.error);
          setChatRooms([]); // Fallback to an empty array
        } else if (Array.isArray(data)) {
          setChatRooms(data);
        } else {
          console.error('Expected an array but received:', data);
          setChatRooms([]); // Fallback to an empty array if not an array
        }
      })
      .catch((error) => {
        console.error('Error fetching chat rooms:', error);
        setChatRooms([]); // Fallback in case of error
      });
  }, [currentUser.id]);
  
  const handleSearch = () => {
    fetch(`/api/users?query=${searchQuery}`)
      .then(response => response.json())
      .then(data => {
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
    try {
      const response = await fetch('/api/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: currentUser.id,
          userId2: userId,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Chat room response data:', data); // Debug logging
      
      if (data.chatRoom && data.chatRoom.id) {
        onSelectChatRoom(data.chatRoom.id);
      } else {
        console.error('Invalid chat room data:', data);
      }
    } catch (error) {
      console.error('Error creating or fetching chat room:', error);
    }
  };
  

  const isGif = (content: string) => {
    return content.toLowerCase().endsWith('.gif') || content.toLowerCase().includes('giphy.com');
  };

  return (
    <div className="flex h-screen w-1/4 min-w-[250px] p-4 border-r overflow-y-auto  bg-gray-800 text-white">
      <div className="w-full h-full">
    
  
        {/* Text above the search input */}
        <p className="text-sm mb-2 text-gray-400">Search for users</p>
        <Input
          className="mb-4 w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
  
        {/* Display search results */}
        <ul>
          {searchResults.map(user => (
            <li key={user.id}>
              <button
                onClick={() => handleSelectUser(user.id)}
                className="text-left w-full py-2 px-4 hover:bg-gray-600 flex items-center gap-4"
              >
              {user.image ?(
                <img src={user.image} alt="User Profile" className="h-10 w-10 rounded-full" />
                    ) : (
                      <UserIcon />
                    )}
                <span>{user.name || user.email}</span>
              </button>
            </li>
          ))}
        </ul>
  
        {/* Separator line */}
        <hr className="my-4 border-gray-600" />
  
        {/* Text and Direct Messages below the input */}
        <p className="text-sm mb-2 text-gray-400">Direct Messages</p>
        <ul className="mt-4">
          {chatRooms.map(chatRoom => {
            const receiver = chatRoom.otherUsers?.[0]; // Access the first other user
  
            if (!receiver) {
              console.error('No receiver found for chat room:', chatRoom.id);
              return null; // Skip rendering this chat room if no receiver is found
            }
  
            const lastMessage = chatRoom.lastMessageContent || 'No messages yet';
            const isMessageGif = isGif(lastMessage);
  
            return (
              <li key={chatRoom.id} className="mb-4">
                <button
                  onClick={() => onSelectChatRoom(chatRoom.id)}
                  className="flex justify-between w-full py-2 px-4 hover:bg-gray-700 items-center"
                >
                  <div className="flex items-center gap-4 ">
                    {receiver.image ? (
                      <img src={receiver.image} alt="User Profile" className="h-10 w-10 rounded-full" />
                    ) : (
                      <UserIcon />
                    )}
                    <div>
                      <span className="font-bold text-sm j">{receiver.name }</span>
                      <div className="text-xs text-gray-400">
                        {isMessageGif ? 'GIF' : lastMessage}
                      </div>
                    </div>
                  </div>
                {/*  <span className="text-xs text-gray-500">{chatRoom.lastMessageDate}</span> */}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
  
  
}

function UserIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
