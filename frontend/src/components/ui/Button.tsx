import * as React from 'react'
import {Slot} from '@radix-ui/react-slot'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '../../lib/cn'


const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 shadow-sm',
    {
        variants: {
            variant: {
                default: 'bg-black text-white hover:bg-black/90',
                outline: 'border border-neutral-200 hover:bg-neutral-50',
                ghost: 'hover:bg-neutral-100',
            },
            size: {
                sm: 'h-9 px-3',
                default: 'h-10 px-4',
                lg: 'h-11 px-6 text-base',
            },
        },
        defaultVariants: {variant: 'default', size: 'default'},
    }
)


export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}


export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({variant, size}), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'