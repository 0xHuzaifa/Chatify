"use client"

export default function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  filteredCount,
  totalCount,
}: {
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  filteredCount: number
  totalCount: number
}) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-1 transition"
        style={{
          backgroundColor: "var(--color-bg-tertiary)",
          borderColor: "var(--color-bg-tertiary)",
          color: "var(--color-text-primary)",
        }}
      />
      <span className="absolute right-4 top-3" style={{ color: "var(--color-text-tertiary)" }}>
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
    </div>
  )
}
