import { useEffect, useState, useRef, useCallback } from 'react';
import { CustomUser, User } from 'next-auth';
import { Input } from './ui/input';
import { createClient } from '@supabase/supabase-js';
import { Loader2, UserIcon } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SidebarProps {
  currentUser: CustomUser;
  onSelectChatRoom: (chatRoomId: string) => void;
}

interface ChatRoom {
  id: string;
  otherUsers: User[];
  lastMessageContent: string;
  lastMessageDate: string | null;
}

export function Sidebar({ currentUser, onSelectChatRoom }: SidebarProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingChatRooms, setLoadingChatRooms] = useState(true);
  const [creatingChatRoom, setCreatingChatRoom] = useState(false);
  const chatRoomsRef = useRef<ChatRoom[]>([]);

  useEffect(() => {
    chatRoomsRef.current = chatRooms;
  }, [chatRooms]);

  const fetchInitialChatRooms = useCallback(async () => {
    setLoadingChatRooms(true);
    try {
      const response = await fetch(`/api/chatrooms?userId=${currentUser.id}`);
      const data = await response.json();
      if (data.error) {
        console.error('Error fetching chat rooms:', data.error);
        setChatRooms([]);
      } else if (Array.isArray(data)) {
        setChatRooms(data);
      } else {
        console.error('Expected an array but received:', data);
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
    } finally {
      setLoadingChatRooms(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchInitialChatRooms();
  }, [fetchInitialChatRooms]);

  useEffect(() => {
    const subscription = supabase
      .channel('chat_room_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        async () => {
          await fetchInitialChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser.id, fetchInitialChatRooms]);

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
    setCreatingChatRoom(true);
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
      
      if (data.chatRoom) {
        await fetchInitialChatRooms();
        onSelectChatRoom(data.chatRoom.id);
      }
    } catch (error) {
      console.error('Error creating or fetching chat room:', error);
    } finally {
      setCreatingChatRoom(false);
    }
  };

  return (
    <div className="flex h-screen w-1/4 min-w-[250px] p-4 border-r overflow-y-auto bg-primary text-white">
      <div className="w-full h-full">
        <p className="text-sm mb-2 text-gray-400">Search for users</p>
        <Input
          className="mb-4 w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
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
                className="text-left w-full py-2 px-4 hover:bg-gray-600 flex items-center gap-4"
                disabled={creatingChatRoom}
              >
                {user.image ? (
  <img
    src={user.image}
    alt="User Profile"
    className="h-10 w-10 rounded-full object-cover"
  />
) : (
  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
    <UserIcon className="h-6 w-6 text-white" />
  </div>
)}

                <span>{user.name || user.email}</span>
                {creatingChatRoom && <Loader2 className="animate-spin h-4 w-4 ml-auto" />}
              </button>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-gray-600" />

        <p className="text-sm mb-2 text-gray-400">Direct Messages</p>
        <ul className="mt-4">
          {loadingChatRooms ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin h-6 w-6 text-white" />
            </div>
          ) : (
            chatRooms.map(chatRoom => {
              const receiver = chatRoom.otherUsers?.[0];
              
              if (!receiver) {
                return null;
              }

              return (
                <li key={chatRoom.id} className="mb-4">
                  <button
                    onClick={() => onSelectChatRoom(chatRoom.id)}
                    className="flex justify-between w-full py-2 px-4 hover:bg-gray-700 items-center"
                  >
                    <div className="flex items-center gap-4">
                    {receiver.image ? (
 <img
 src={
   receiver.image ||
   `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name || 'User')}&background=555&color=fff`
 }
 alt="User Profile"
 className="h-10 w-10 rounded-full object-cover"
 onError={(e) => {
   e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name || 'User')}&background=555&color=fff`;
 }}
/>

) : (
  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
    <UserIcon className="h-6 w-6 text-white" />
  </div>
)}

                      <div>
                        <span className="font-bold text-sm">{receiver.name}</span>
                        <div className="text-xs text-gray-400 truncate max-w-[180px]">
  {chatRoom.lastMessageContent.length > 20
    ? chatRoom.lastMessageContent.slice(0, 20) + '...'
    : chatRoom.lastMessageContent}
</div>

                      </div>
                    </div>
                  </button>
                </li>
              );
            }).filter(Boolean)
          )}
        </ul>
      </div>
    </div>
  );
}