export const metadata = {
  title: 'Chattix',
  description: 'Chat app',
};

import { ChatRoom } from "@/app/components/ChatRoom";
import Navbar from "@/app/components/Navbar";
import { Sidebar } from "@/app/components/Sidebar";
import ChatApp from "./components/ChatApp";

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <ChatApp />
    </div>
  )
}