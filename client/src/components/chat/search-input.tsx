"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchUsers } from "@/queries/auth.queries";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getInitials from "@/utils/getInitialName";

export default function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  filteredCount,
  totalCount,
  onSelectUser,
  onSelectGroup,
  isAccessingChat,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  filteredCount: number;
  totalCount: number;
  onSelectUser?: (user: { _id: string }) => Promise<void>;
  onSelectGroup?: (group: { _id: string }) => Promise<void>;
  isAccessingChat?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const { data: users = [], isFetching: isSearching } = useSearchUsers(
    onSelectUser ? debouncedValue : "",
  );

  const showUserResults = useMemo(() => {
    return isOpen && !!onSelectUser && value.trim().length >= 2;
  }, [isOpen, onSelectUser, value]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search chats or people..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setIsOpen(true);
          onFocus();
        }}
        onBlur={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(() => setIsOpen(false), 150);
          onBlur();
        }}
        className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 transition"
        style={{
          backgroundColor: "var(--color-bg-tertiary)",
          borderColor: "var(--color-bg-tertiary)",
          color: "var(--color-text-primary)",
        }}
      />
      <span
        className="absolute right-4 top-3"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        🔍
      </span>

      {value && filteredCount > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 text-xs px-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {filteredCount} of {totalCount} chats
        </div>
      )}

      {showUserResults && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-50"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            borderColor: "var(--color-bg-tertiary)",
          }}
          onMouseDown={(e) => {
            // Prevent input blur so clicks register
            e.preventDefault();
          }}
        >
          <div
            className="px-3 py-2 text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {isSearching
              ? "Searching people..."
              : users.length
                ? "People"
                : "No people found"}
          </div>

          {users.length > 0 && (
            <div
              className="max-h-64 overflow-y-auto"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-tertiary)",
              }}
            >
              {users.map((u: any) => (
                <button
                  key={u._id}
                  disabled={!!isAccessingChat}
                  className="w-full px-3 py-2 flex items-center gap-3 text-left hover:opacity-90 disabled:opacity-60"
                  style={{ color: "var(--color-text-primary)" }}
                  onClick={async () => {
                    if (!onSelectUser) return;
                    await onSelectUser({ _id: String(u._id) });
                    onChange("");
                    setIsOpen(false);
                  }}
                >
                  <Avatar className="h-9 w-9">
                    {u.avatar && (
                      <AvatarImage src={u.avatar} alt={u.fullName} />
                    )}
                    <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {getInitials(u.fullName || "User")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">
                      {u.fullName}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {u.email || u.phone || ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
