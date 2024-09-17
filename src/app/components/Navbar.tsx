'use client';
import { SVGProps, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import SignInModal from "@/app/components/SignInModal";
import SignUpModal from "@/app/components/SignUpModal";


export default function Navbar() {
  const { data: session, status, update } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    // console.log("Session object:", session);
  }, [session]);

  useEffect(() => {
    // Log session and status for debugging
 
  }, [status, session]);

 

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-10 md:px-10 border-b  ">
      <Link href="/" className="mr-6  lg:flex" prefetch={false}>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN9YS8q3nINAN0Lqqi0kcoEjJ8J3da95LwCw&s" alt="Logo" className="h-12 w-15"/>
      
      </Link>
    
      <div className="flex-1">
        <nav className="hidden lg:flex">
       
        </nav>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="User Profile"
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <UserIcon className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle user menu</span>
          
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {session ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <LogInIcon className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOutIcon className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setIsSignInOpen(true)}>
                <LogInIcon className="h-4 w-4" />
                <span>Sign In</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSignUpOpen(true)}>
                <LogOutIcon className="h-4 w-4" />
                <span>Sign Up</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      <SignUpModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </header>
  );
}

function LogInIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function LogOutIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function MessageCircleIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}

function UserIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
