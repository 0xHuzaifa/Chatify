"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ChatHeader({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };
  return (
    <div
      className="border-b p-4 flex items-center justify-between"
      style={{
        borderColor: "var(--color-bg-tertiary)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: "var(--color-bg-tertiary)" }}
        >
          <Avatar className="">
            {avatar && (
              <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            )}
            <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2
            className="font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {name}
          </h2>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Online
          </p>
        </div>
      </div>
    </div>
  );
}
