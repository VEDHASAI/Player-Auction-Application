import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'destructive', size?: 'default' | 'sm' | 'lg' | 'icon' }>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variant === 'default' && "bg-[#3B82F6] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20",
                    variant === 'destructive' && "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
                    variant === 'outline' && "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
                    variant === 'ghost' && "hover:bg-slate-800 text-slate-200",
                    size === 'default' && "h-10 px-4 py-2",
                    size === 'sm' && "h-9 rounded-md px-3",
                    size === 'lg' && "h-11 rounded-md px-8",
                    size === 'icon' && "h-10 w-10",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
