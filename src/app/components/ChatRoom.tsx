import { useState, useEffect, useRef, SVGProps } from 'react';
import { CustomUser } from 'next-auth';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import styles from './../styles/ChatRoom.module.css';
import { SendIcon } from 'lucide-react';
import { GifSearch } from './GifSearch';

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  userImage?: string;
}

interface ChatRoomProps {
  chatRoomId: string;
  currentUser: CustomUser;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export function ChatRoom({ chatRoomId, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifSearch, setShowGifSearch] = useState<boolean>(false);
  const { data: session } = useSession();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Function to update user status
  const updateUserStatus = async (status: 'online' | 'offline') => {
    if (!currentUser || !currentUser.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', currentUser.id);
      if (error) {
        console.error('Error updating status:', error.message);
      } else {
        // console.log(`User status updated to: ${status}`);
      }
    } catch (err) {
      console.error('Error setting user status:', err);
    }
  };

  useEffect(() => {
    // Set status to 'online' on component mount and 'offline' on unmount
    updateUserStatus('online');

    // Set user status to 'offline' on window close or tab change
    const handleBeforeUnload = () => updateUserStatus('offline');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Set user status to 'offline' on component unmount
      updateUserStatus('offline');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages?chatRoomId=${chatRoomId}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Expected an array but received:', data);
          setMessages([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setMessages([]);
      });

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          // console.log('Received new message:', payload);
          const newMessage = payload.new as Message;

          // Check if the message already exists in the state
          setMessages((prevMessages) => {
            if (!prevMessages.some((msg) => msg.id === newMessage.id)) {
              return [...prevMessages, newMessage];
            }
            return prevMessages; // If the message already exists, don't add it again
          });
        }
      )
      .subscribe((status, err) => {
        // console.log(`Message subscription status: ${status}`);
        if (err) {
          console.error('Error during message subscription:', err);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Message channel error');
        } else if (status === 'CLOSED') {
          //  console.log('Message channel closed');
        }
      });

    // Cleanup on unmount
    return () => {
      messageChannel.unsubscribe();
    };
  }, [chatRoomId]);

  useEffect(() => {
    // Fetch initial user statuses when the component mounts
    const fetchUserStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, status')
          .in('status', ['online', 'offline']); // Fetch only online/offline statuses

        if (error) {
          console.error('Error fetching user statuses:', error);
          return;
        }

        if (data) {
          const statusMap = new Map<string, 'online' | 'offline'>();

          data.forEach((user) => {
            statusMap.set(user.id, user.status);
          });

          setUserStatuses(statusMap);
        }
      } catch (error) {
        console.error('Error fetching user statuses:', error);
      }
    };

    fetchUserStatuses();

    // Subscribe to user status updates
    const statusChannel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: 'status=in.(online,offline)',
        },
        (payload) => {
          // console.log('Received user status update:', payload);
          const updatedUser = payload.new;

          if (updatedUser.status === 'online' || updatedUser.status === 'offline') {
            setUserStatuses((prevStatuses) => {
              const updatedStatuses = new Map(prevStatuses);
              updatedStatuses.set(updatedUser.id, updatedUser.status);
              return updatedStatuses;
            });
          }
        }
      )
      .subscribe((status, err) => {
        // console.log(`User status subscription status: ${status}`);
        if (err) {
          console.error('Error during user status subscription:', err);
        } else {
          //  console.log('Successfully subscribed to user status updates.');
        }
      });

    // Cleanup on unmount
    return () => {
      // console.log('Unsubscribing from status channel');
      statusChannel.unsubscribe();
    };
  }, []);

  const handleSendMessage = async () => {
    const messageToSend = selectedGif ? selectedGif : newMessage.trim();
    if (messageToSend) {
      const messageData: Partial<Message> = {
        id: crypto.randomUUID(),
        content: messageToSend,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        userImage: currentUser.image!,
      };

      setMessages((prevMessages) => [...prevMessages, messageData as Message]);
      setNewMessage('');
      setSelectedGif(null);

      try {
        const { error } = await supabase.from('messages').insert({
          id: messageData.id,
          content: messageData.content,
          user_id: currentUser.id,
          chat_room_id: chatRoomId,
        });
        if (error) console.error('Error saving message:', error.message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Message cannot be empty');
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  const isDifferentDay = (currentDate: string, previousDate: string | null) => {
    const current = new Date(currentDate);
    const previous = previousDate ? new Date(previousDate) : null;
    return !previous || current.toDateString() !== previous.toDateString();
  };

  const isGifUrl = (url: string) => {
    return url.endsWith('.gif') || url.includes('giphy.com');
  };

  const handleCloseGifSearch = () => {
    setShowGifSearch(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifSearch(false);
    // Optionally, you could put some text in the textarea to indicate a GIF is selected
    // setNewMessage('[GIF Selected]');
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className={`${styles.chatContainer} flex-1 overflow-auto p-4`} ref={messagesContainerRef}>
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 p-4">Start the conversation by saying hello.</div>
          ) : (
            messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showDateLabel = isDifferentDay(msg.createdAt, previousMessage?.createdAt || null);

              return (
                <div key={msg.id}>
                  {showDateLabel && (
                    <div className="text-center text-xs text-gray-500 mb-2">{formatDate(msg.createdAt)}</div>
                  )}
                  <div className={`flex items-start gap-4 ${msg.userId === currentUser.id ? '' : 'justify-end'}`}>
                    <div className={`relative flex ${msg.userId === currentUser.id ? '' : 'order-2'}`}>
                      {msg.userImage ? (
                        <img src={msg.userImage} alt="user profile" className="h-10 w-10 rounded-full" />
                      ) : (
                        <UserIcon />
                      )}
                      <div
                        className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          userStatuses.get(msg.userId) === 'online'
                            ? 'bg-green-500'
                            : 'bg-red-500' // Default to red if the status is not online
                        }`}
                      ></div>
                    </div>
                    <div
                      className={`grid gap-1 ${
                        msg.userId === currentUser.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary text-primary-foreground'
                      } rounded-md p-3 max-w-[75%]`}
                    >
                      <div>
                        {isGifUrl(msg.content) ? (
                          <img src={msg.content} alt="GIF" className="max-w-full max-h-60 object-contain rounded-md" />
                        ) : (
                          <span>{msg.content}</span>
                        )}
                      </div>
                      <div className="text-xs">{new Date(msg.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="relative p-4 bg-muted/40">
        {showGifSearch && (
          <div className="absolute bottom-full left-0 right-0 bg-white z-10 shadow-md rounded-md mb-2">
            <GifSearch onSelect={handleGifSelect} onClose={handleCloseGifSearch} />
          </div>
        )}
        <div className="flex items-center">
          {selectedGif ? (
            <>
              <img src={selectedGif} alt="Selected GIF" className="max-h-10 rounded-md mr-2" />
              

              <button onClick={() => setSelectedGif(null)} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
            </>
          ) : (
            <Textarea
  placeholder="Type your message..."
  className="w-full rounded-md bg-muted px-4 py-2 pr-16 resize-none min-h-[40px] max-h-[200px] overflow-y-auto"
  value={newMessage}
  onInput={(e) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto'; // Reset height
    target.style.height = `${target.scrollHeight}px`; // Set new height based on content
    setNewMessage(target.value);
  }}
/>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-16 transform -translate-y-1/2"
          onClick={() => setShowGifSearch(!showGifSearch)}
        >
          GIF
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-4 transform -translate-y-1/2"
          onClick={handleSendMessage}
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function UserIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  {...props}
  className="h-10 w-10 rounded-full border border-gray-200"
>
  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
  <path
    d="M12 14.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-6.93 5.36a8 8 0 0113.86 0"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

  );
}