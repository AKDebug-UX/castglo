import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { COUNTRIES, Country } from "@/lib/countriesList";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  className,
  placeholder = "Enter phone number",
  disabled,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [localNumber, setLocalNumber] = React.useState("");

  // Parse the current value to find the country
  const selectedCountry = React.useMemo(() => {
    if (!value) return COUNTRIES[0]; // Default to first country (United Kingdom)
    return COUNTRIES.find((c) => value.startsWith(c.dial_code)) || COUNTRIES[0];
  }, [value]);

  // Sync local number when prop value changes
  React.useEffect(() => {
    if (!value) {
      setLocalNumber("");
      return;
    }
    if (value.startsWith(selectedCountry.dial_code)) {
      setLocalNumber(value.slice(selectedCountry.dial_code.length));
    } else {
      // If value doesn't start with selected country (e.g. changed externally)
      // find the new country
      const newCountry = COUNTRIES.find((c) => value.startsWith(c.dial_code)) || COUNTRIES[0];
      setLocalNumber(value.slice(newCountry.dial_code.length));
    }
  }, [value, selectedCountry.dial_code]);

  const handleCountrySelect = (country: Country) => {
    const nextValue = country.dial_code + localNumber;
    onChange(nextValue);
    setOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNumber = e.target.value.replace(/[^\d]/g, ""); // Keep only digits
    setLocalNumber(rawNumber);
    onChange(selectedCountry.dial_code + rawNumber);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] justify-between px-3"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-xs font-medium">{selectedCountry.dial_code}</span>
            </span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => handleCountrySelect(country)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2 text-lg">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-muted-foreground text-xs">{country.dial_code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1"
        disabled={disabled}
      />
    </div>
  );
}
