import { useState, useEffect, useRef, SVGProps } from 'react';
import { CustomUser } from 'next-auth';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import styles from './../styles/ChatRoom.module.css';
import { SendIcon } from 'lucide-react';
import { GifSearch } from './GifSearch'; // Adjust path as necessary

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  userImage?: string;
}

interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
}

interface ChatRoomProps {
  chatRoomId: string;
  currentUser: CustomUser;
}

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://real-time-chat-app-eta-eight.vercel.app/'
  : 'http://localhost:3000';

export function ChatRoom({ chatRoomId, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifSearch, setShowGifSearch] = useState<boolean>(false);
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages?chatRoomId=${chatRoomId}`)
      .then((response) => response.json())
      .then((data) => {
        // Ensure the fetched data is an array
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Expected an array but received:', data);
          setMessages([]); // Fallback to an empty array
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setMessages([]); // Fallback to an empty array on error
      });

    // Ensure the socket connection exists only once
    if (!socketRef.current) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        path: '/api/socket',
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');

        // Register the user when connected
        if (session?.user?.id) {
          socketRef.current?.emit('register', session.user.id);
        }
      });

      socketRef.current.on('message', (message) => {
        // console.log('Received message:', message);
        setMessages((prevMessages) => {
          // Ensure no duplicate messages
          if (!prevMessages.find((msg) => msg.id === message.id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      });

      socketRef.current.on('userStatus', (status) => {
        // console.log('Received user status:', status);
        setUserStatuses((prevStatuses) => new Map(prevStatuses).set(status.userId, status.status));
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return () => {
      // Clean up socket connection when component is unmounted or dependencies change
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatRoomId, session]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedGif) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const messageData: Omit<Message, 'chatRoomId'> = {
        id: tempId,
        content: selectedGif ? selectedGif : newMessage.trim(),
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        userImage: currentUser.image!,
      };

      if (!messageData.content) {
        console.error('Message content cannot be empty');
        return;
      }

      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage('');
      setSelectedGif(null);

      if (socketRef.current?.connected) {
        socketRef.current.emit('message', messageData, (error: any) => {
          if (error) {
            console.error('Error emitting message:', error);
          }
        });
      } else {
        console.error('Socket is not connected');
      }

      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageData.content,
            userId: currentUser.id,
            chatRoomId: chatRoomId,
          }),
        });

        if (response.ok) {
          const savedMessage = await response.json();
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === tempId ? { ...msg, ...savedMessage } : msg
            )
          );
        } else {
          console.error('Error saving message:', response.statusText);
        }
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

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Helper function to check if a message is from a different day than the previous one
  const isDifferentDay = (currentDate: string, previousDate: string | null) => {
    const current = new Date(currentDate);
    const previous = previousDate ? new Date(previousDate) : null;

    return !previous || current.toDateString() !== previous.toDateString();
  };

  const isGifUrl = (url: string) => {
    return url.endsWith('.gif') || url.includes('giphy.com');
  };
  
  return (
    <div className="flex-1 flex flex-col h-screen ">
      <div
        className={`${styles.chatContainer} flex-1 overflow-auto p-4`}
        ref={messagesContainerRef}
      >
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 p-4">Start the conversation by saying hello.</div>
          ) : (
            <>
              {messages.map((msg, index) => {
                
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showDateLabel = isDifferentDay(msg.createdAt, previousMessage?.createdAt || null);

                return (
                  <div key={msg.id}>
                    {/* Show date label if it's a new day */}
                    {showDateLabel && (
                      <div className="text-center text-xs text-gray-500 mb-2">
                        {formatDate(msg.createdAt)}
                      </div>
                    )}

                    <div
                      className={`flex items-start gap-4 ${msg.userId === currentUser.id ? '' : 'justify-end'}`}
                    >
                      <div className={`relative flex ${msg.userId === currentUser.id ? '' : 'order-2'}`}>
                        {msg.userImage ? (
                          <img src={msg.userImage} alt="user profile" className="h-10 w-10 rounded-full" />
                        ) : (
                          <UserIcon />
                        )}
                        <div
                          className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            userStatuses.get(msg.userId) === 'online' ? 'bg-green-500' : 'bg-red-500'
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
                            <img
                              src={msg.content}
                              alt="GIF"
                              className="max-w-full max-h-60 object-contain rounded-md"
                            />
                          ) : (
                            <span>{msg.content}</span>
                          )}
                        </div>
                        <div className="text-xs">
                          {new Date(msg.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <div className="relative p-4 bg-muted/40">
        {showGifSearch && (
          <div className="absolute inset-0 bg-white z-10">
            <GifSearch onSelect={(gifUrl) => { setSelectedGif(gifUrl); setShowGifSearch(false); }} />
          </div>
        )}
        <Textarea
          placeholder="Type your message..."
          className="w-full rounded-md bg-muted px-4 py-2 pr-16 resize-none"
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
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
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        borderRadius: '50%', // Makes the SVG circular
        display: 'block', // Ensures the SVG is treated as a block element
      }}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
