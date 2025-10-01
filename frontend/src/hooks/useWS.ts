type Handler = (payload: any) => void
const handlers = new Map<string, Set<Handler>>()


export function useWS(url: string) {
    // ... (Verbindungscode wie gehabt)

    return {
        on: (event: string, handler: Handler): (() => void) => {
            if (!handlers.has(event)) handlers.set(event, new Set())
            handlers.get(event)!.add(handler)
            // 👇 Cleanup darf nichts zurückgeben
            return () => {
                handlers.get(event)?.delete(handler) // ignorier den boolean
            }
        }
    }
}
