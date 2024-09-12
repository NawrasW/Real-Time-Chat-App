'use client';
import { useSession } from "next-auth/react";
import { ChatRoom } from "./ChatRoom";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { CustomUser } from "next-auth";
import Navbar from "./Navbar";

export default function MainComponent() {
  const { data: session, status } = useSession();
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>('');

  const currentUser = session?.user as CustomUser | null;

  const handleSelectChatRoom = (chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId);
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen justify-center items-center">
               <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN9YS8q3nINAN0Lqqi0kcoEjJ8J3da95LwCw&s" alt="Logo" className="h-12 w-15"/>

      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex gap-2">            
      <Navbar />
      <div className="flex h-screen justify-center items-center">
        
        <div>Please log in to see chat rooms.</div>
      </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar currentUser={currentUser} onSelectChatRoom={handleSelectChatRoom} />
      <div className="flex-1 flex flex-col">
      <Navbar />
        {selectedChatRoomId ? (
          <ChatRoom key={selectedChatRoomId} chatRoomId={selectedChatRoomId} currentUser={currentUser} />
        ) : (
          <div className="flex-1 p-4">Select a chat room to start chatting.</div>
        )}
      </div>
    </div>
  );
}
