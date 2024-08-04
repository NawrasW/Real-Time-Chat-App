import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignUp: boolean;
  onGoogleSignIn: () => void;
}

export default function AuthModal({ isOpen, onClose, isSignUp, onGoogleSignIn }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Sign Up" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Create a new account" : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isSignUp && (
            <Input type="email" placeholder="Email" className="w-full rounded-md bg-muted px-3 py-2 text-sm" />
          )}
          <Input type="text" placeholder="Name" className="w-full rounded-md bg-muted px-3 py-2 text-sm" />
          <Input type="password" placeholder="Password" className="w-full rounded-md bg-muted px-3 py-2 text-sm" />
        </div>
        <DialogFooter>
          <Button variant="default" className="w-full">{isSignUp ? "Sign Up" : "Sign In"}</Button>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span>{isSignUp ? "or Sign Up with" : "or Sign In with"}</span>
            <Button variant="secondary" onClick={onGoogleSignIn}>Google</Button>
          </div>
        </DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-2 right-2">X</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
