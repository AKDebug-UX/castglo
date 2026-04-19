import React, { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiSelectChecklistProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function MultiSelectChecklist({
  options,
  selected,
  onChange,
  placeholder = "Type to search options...",
}: MultiSelectChecklistProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter(
      (option) =>
        option.toLowerCase().includes(q) && !selected.includes(option)
    );
  }, [options, query, selected]);

  const handleSelect = (option: string) => {
    onChange([...selected, option]);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        // We delay slightly to allow click events on the list to fire
        setTimeout(() => setIsOpen(false), 200);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative w-full">
      <div
        className="min-h-[44px] border rounded-xl p-2 flex flex-wrap gap-2 items-center bg-white/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-[#009698]/20 focus-within:border-[#009698] transition-all cursor-text shadow-sm"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {selected.map((option) => (
          <Badge
            key={option}
            variant="secondary"
            className="flex items-center gap-1.5 bg-[#009698]/10 text-[#009698] hover:bg-[#009698]/20 border-none rounded-lg px-3 py-1 font-semibold text-sm transition-colors"
          >
            {option}
            <div
              role="button"
              className="text-[#009698]/60 hover:text-[#009698] transition-colors cursor-pointer rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(option);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </div>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none min-w-[150px] text-sm h-8 text-foreground font-medium"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[100] w-full top-[100%] mt-2 max-h-56 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-200">
          {filtered.map((option) => (
            <div
              key={option}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#009698]/10 hover:text-[#009698] rounded-lg transition-colors font-medium text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
