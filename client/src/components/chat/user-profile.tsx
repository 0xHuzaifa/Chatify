"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getInitials from "@/utils/getInitialName";

export default function UserProfile() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const user = {
    name: "John Doe",
    email: "",
    avatar: "",
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="">
            {user.avatar && (
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
              />
            )}
            <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              Your Name
            </p>
            <p className="text-xs text-muted-foreground truncate">
              your.email@example.com
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
