"use client";

import { Button } from "@/components/ui/button";
import { TypographyH4 } from "@/components/ui/typography";
import { useUser } from "@/contexts/user/context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ShoppingCart } from "lucide-react"; 

export const Header = () => {
  const { user } = useUser();
  const router = useRouter();

  const handleProfileClick = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  const handleCartClick = () => {
    router.push("/cart");
  };

  const handleChatClick = () => {
    router.push("/chats");
  };

  return (
    <header className="w-full flex items-center p-4 border-b shadow-md">
      <Link href="/" className="mr-auto">
        <TypographyH4>Farmus</TypographyH4>
      </Link>

      <nav className="flex items-center gap-4">
        {user?.role === "Admin" && (
          <Link className="underline" href="/dashboard">
            Dashboard
          </Link>
        )}
        {user?.role === "Buyer" && (
          <>
            <button onClick={handleCartClick} className="bg-white text-black p-2">
              <ShoppingCart size={24} />
            </button>
            <button onClick={handleChatClick} className="bg-white text-black p-2">
              <MessageCircle size={24} />
            </button>
          </>
        )}
      </nav>

      <Button className="ml-4" onClick={handleProfileClick}>
        {user ? "Profile" : "Login"}
      </Button>
    </header>
  );
};
