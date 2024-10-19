"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation"; // Hook to get the current path

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname(); // Get the current path

  // If on the home page ("/"), do not render the Navbar
  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-white py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Home button visible to everyone */}
        <Link href="/">
          <Button variant="ghost" className="text-xl font-bold">
            Home
          </Button>
        </Link>

        {/* Right side: Post an Ad, Inbox, and Profile dropdown */}
        <div className="flex items-center space-x-4">
          {/* Post an Ad and Inbox buttons visible only if user is signed in */}
          {session && (
            <>
              <Link href="/post-ad">
                <Button className="text-md">Post an Ad</Button>
              </Link>
              <Link href="/inbox">
                <Button variant="ghost" className="text-md">
                  Inbox
                </Button>
              </Link>
            </>
          )}

          {/* Profile dropdown visible only if user is signed in */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem>
                  <Link href="/edit-profile">Edit Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
