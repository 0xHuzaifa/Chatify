"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getInitials from "@/utils/getInitialName";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/queries/auth.queries";

export default function UserProfile() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  if (!user) return null;

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="">
            {user.avatar && (
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.fullName}
              />
            )}
            <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email || user.phone || "No contact info"}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          disabled={isPending}
          className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
