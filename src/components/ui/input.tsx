import * as React from "react"
import { cn } from "@/lib/utils"

// Utility helper if not already present
// I will create utils.ts next if it's missing, but I can inline it here or assume I'll make it.
// Actually, `cn` was used in `button.tsx` but I didn't verify `lib/utils` existence. 
// I should create `lib/utils.ts` to be safe, or just inline `cn` here.
// I'll inline `cn` logic here to be self-contained or better yet, create `lib/utils.ts` in this same turn.

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={twMerge(clsx(
                    "flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white",
                    className
                ))}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
