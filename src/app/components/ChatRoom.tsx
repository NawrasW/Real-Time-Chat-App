import { useState, useEffect, useRef } from 'react';
import { CustomUser } from 'next-auth';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import styles from './../styles/ChatRoom.module.css';
import { SendIcon } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  userImage?: string; // Optional userImage field
}

interface ChatRoomProps {
  chatRoomId: string;
  currentUser: CustomUser;
}

export function ChatRoom({ chatRoomId, currentUser }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages?chatRoomId=${chatRoomId}`)
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Error fetching messages:', error));

    // Setup socket connection
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3000', {
        path: '/api/socket',
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socketRef.current.on('message', (message) => {
        console.log('Received message:', message);
        setMessages((prevMessages) => {
          if (!prevMessages.find((msg) => msg.id === message.id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatRoomId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const messageData: Omit<Message, 'chatRoomId'> = {
        id: tempId,
        content: newMessage,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        userImage: currentUser.image!,
      };
  
      setMessages((prevMessages) => [...prevMessages, messageData]);
  
      setNewMessage('');
  
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
          body: JSON.stringify(messageData),
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
    }
  };
  

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div
        className={`${styles.chatContainer} flex-1 overflow-auto p-4`}
        ref={messagesContainerRef}
      >
        <div className="grid gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 p-4">Select a chat room to start chatting.</div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${msg.userId === currentUser.id ? '' : 'justify-end'}`}
                >
                  <div className={`flex ${msg.userId === currentUser.id ? '' : 'order-2'}`}>
                    <img
                      src={msg.userImage || '/path/to/default/image.png'}
                      alt="User Profile"
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div
                    className={`grid gap-1 ${
                      msg.userId === currentUser.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } rounded-md p-3 max-w-[75%]`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-xs">
                      {new Date(msg.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="relative p-4 bg-muted/40">
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
          className="absolute top-1/2 right-4 transform -translate-y-1/2"
          onClick={handleSendMessage}
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
