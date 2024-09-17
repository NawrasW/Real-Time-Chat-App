import { ChatRoom } from "@/app/components/ChatRoom";
import Navbar from "@/app/components/Navbar";
import { Sidebar } from "@/app/components/Sidebar";
import ChatApp from "./components/ChatApp";
import Head from "next/head";


export default function Component() {
  return (
    <>
     <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

    <div className="flex flex-col min-h-screen w-full bg-background">

    <ChatApp />
    </div></>
  )
}
