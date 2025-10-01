export const fadeInUp = {
    initial: {opacity: 0, y: 12},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: -8},
    transition: {duration: 0.22}
}
export const pop = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 }
}