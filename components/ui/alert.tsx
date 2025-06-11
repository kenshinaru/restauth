import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const alertVariants = cva(
  "w-full rounded-md border border-destructive/50 bg-destructive/10 py-2 px-3 text-sm text-destructive [&>[svg]]:h-4 [&>[svg]]:w-4",
  {
    variants: {
      variant: {
        default: "bg-background border-muted text-foreground",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive [&>[svg]]:h-4 [&>[svg]]:w-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  },
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
