import React, { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { isNoneOption } from "@/lib/utils";

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
    const isNoneSelected = selected.some(isNoneOption);
    if (isNoneSelected) return [];

    const q = query.toLowerCase();
    return options.filter(
      (option) =>
        option.toLowerCase().includes(q) && !selected.includes(option)
    );
  }, [options, query, selected]);

  const handleSelect = (option: string) => {
    if (isNoneOption(option)) {
      // If "None" is selected, clear everything else
      onChange([option]);
    } else {
      // If something else is selected, remove any "None" options
      const next = selected.filter(s => !isNoneOption(s));
      onChange([...next, option]);
    }
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

  const isNoneSelected = useMemo(() => selected.some(isNoneOption), [selected]);

  return (
    <div className="space-y-2 relative w-full">
      <div
        className={`min-h-[44px] border rounded-xl p-2 flex flex-wrap gap-2 items-center bg-white/50 backdrop-blur-sm transition-all shadow-sm ${
          isNoneSelected 
            ? "bg-gray-50/50 cursor-not-allowed border-gray-200" 
            : "focus-within:ring-2 focus-within:ring-[#009698]/20 focus-within:border-[#009698] cursor-text"
        }`}
        onClick={() => {
          if (!isNoneSelected) {
            inputRef.current?.focus();
            setIsOpen(true);
          }
        }}
      >
        {selected.map((option) => (
          <Badge
            key={option}
            variant="secondary"
            data-testid={`multi-select-tag-${option}`}
            className={`flex items-center gap-1.5 border-none rounded-lg px-3 py-1 font-semibold text-sm transition-colors ${
              isNoneOption(option)
                ? "bg-gray-200 text-gray-700"
                : "bg-[#009698]/10 text-[#009698] hover:bg-[#009698]/20"
            }`}
          >
            {option}
            <div
              role="button"
              className="transition-colors cursor-pointer rounded-full p-0.5 hover:bg-black/5"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(option);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </div>
          </Badge>
        ))}
        {!isNoneSelected && (
          <input
            ref={inputRef}
            value={query}
            data-testid="multi-select-input"
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent outline-none min-w-[150px] text-sm h-8 text-foreground font-medium"
          />
        )}
        {isNoneSelected && selected.length > 0 && (
          <span className="text-xs text-gray-400 font-medium italic ml-1">
            (Remove "{selected[0]}" to add others)
          </span>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[100] w-full top-[100%] mt-2 max-h-56 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-200">
          {filtered.map((option) => (
            <div
              key={option}
              data-testid={`multi-select-option-${option}`}
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
