import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm active:shadow-none",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs hover:shadow-sm active:shadow-none",
        outline: "border border-border/80 bg-background text-foreground hover:bg-muted/70 hover:text-foreground shadow-2xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-2xs",
        ghost: "hover:bg-muted/70 hover:text-foreground text-muted-foreground font-medium",
        link: "text-primary underline-offset-4 hover:underline active:scale-100 p-0 h-auto font-medium",
        // CASTGLO premium specific variants
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg font-bold hover:scale-[1.02] active:scale-[0.98]",
        "hero-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98]",
        tab: "bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-xs",
        "tab-outline": "border border-border bg-background text-foreground rounded-full hover:bg-muted",
        social: "border border-border bg-background text-foreground hover:bg-muted justify-center gap-3 shadow-2xs",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow-sm active:shadow-none",
        info: "bg-sky-600 text-white hover:bg-sky-700 shadow-xs hover:shadow-sm active:shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm",
        xl: "h-13 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
