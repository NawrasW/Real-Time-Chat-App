'use client';
import { useSession } from "next-auth/react";
import { ChatRoom } from "./ChatRoom";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { CustomUser } from "next-auth";

export default function MainComponent() {
  const { data: session, status } = useSession();
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<CustomUser | null>(null);

  useEffect(() => {
    if (session?.user && !currentUser) {
      setCurrentUser(session.user as CustomUser);
    }
  }, [session, currentUser]);

  const handleSelectChatRoom = (chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

 
  return (
    <div className="flex min-h-screen w-full bg-background">
      {currentUser ? (
        <>
          <Sidebar currentUser={currentUser} onSelectChatRoom={handleSelectChatRoom} />
          <div className="flex-1 flex flex-col">
            {selectedChatRoomId ? (
              <ChatRoom key={selectedChatRoomId} chatRoomId={selectedChatRoomId} currentUser={currentUser} />
            ) : (
              <div className="flex-1 p-4">Select a chat room to start chatting.</div>
            )}
          </div>
        </>
      ) : (
        <div>Please log in to see chat rooms.</div>
      )}
    </div>
  );
}
