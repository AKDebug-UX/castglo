import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CombinedCurrencyRateInputProps {
  currencyValue: string;
  rateValue: string;
  onCurrencyChange: (value: string) => void;
  onRateChange: (value: string) => void;
  currencyOptions: string[];
  rateOptions: string[];
  errors?: Record<string, string>;
}

export function CombinedCurrencyRateInput({
  currencyValue,
  rateValue,
  onCurrencyChange,
  onRateChange,
  currencyOptions,
  rateOptions,
  errors = {}
}: CombinedCurrencyRateInputProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        {/* Currency Selector (Left side) */}
        <div className="w-[120px] shrink-0">
          <Select value={currencyValue || ""} onValueChange={onCurrencyChange}>
            <SelectTrigger className="rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Cur" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.includes("(") ? opt.split("(")[1].replace(")", "") : opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rate Range Selector or Free Input (Right side) */}
        <div className="flex-1">
          {rateOptions && rateOptions.length > 0 ? (
            <Select value={rateValue || ""} onValueChange={onRateChange}>
              <SelectTrigger className="rounded-l-none focus:ring-0 focus:ring-offset-0 border-l">
                <SelectValue placeholder="Select Range">
                  {rateValue ? (
                    rateValue === "Open to discussion" || rateValue === "Other" 
                      ? rateValue 
                      : String(rateValue).replace(/(\d+)/g, `${(currencyValue || "").match(/\((.+)\)/)?.[1] || ""}$1`)
                  ) : "Select Range"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {rateOptions.map((opt) => {
                  const symbol = (currencyValue || "").match(/\((.+)\)/)?.[1] || "";
                  let display = opt;
                  if (opt !== "Open to discussion" && opt !== "Other") {
                    display = String(opt).replace(/(\d+)/g, `${symbol}$1`);
                  }
                  return (
                    <SelectItem key={opt} value={opt}>
                      {display}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                {(currencyValue || "").match(/\((.+)\)/)?.[1] || ""}
              </span>
              <input
                type="number"
                value={rateValue || ""}
                onChange={(e) => onRateChange(e.target.value)}
                placeholder="Enter Amount"
                className="w-full h-10 px-3 py-2 bg-background border border-input rounded-r-md rounded-l-none border-l pl-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
        </div>
      </div>
      {(errors.currency || errors.expected_rate_range) && (
        <p className="text-[10px] font-medium text-destructive">
          {errors.currency || errors.expected_rate_range}
        </p>
      )}
    </div>
  );
}
