// components/TwitchEmbed.tsx
export default function TwitchEmbed() {
    const channel = import.meta.env.VITE_TWITCH_CHANNEL || "your_channel"

    // mögliche Eltern sammeln: ENV & tatsächlicher Host zur Laufzeit
    const rawParents = [
        import.meta.env.VITE_URL,                  // z.B. "localhost" oder "stream.example.com"
        window.location.hostname,                  // z.B. "localhost"
        import.meta.env.VITE_ALT_DOMAIN,           // optional: "www.example.com"
    ].filter(Boolean) as string[]

    // Normalize: ohne schema/port, deduplizieren
    const parents = Array.from(new Set(
        rawParents.map(p => p.replace(/^https?:\/\//, "").split(":")[0].trim()).filter(Boolean)
    ))

    // Twitch erlaubt mehrere parent= Einträge
    const parentQS = parents.map(p => `parent=${encodeURIComponent(p)}`).join("&")

    const src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parentQS}&muted=true`

    return (
        <div className="w-full aspect-video">
            <iframe
                src={src}
                width="100%"
                height="100%"
                allowFullScreen
                className="border-0"
                // sandbox ist nicht nötig; Twitch setzt seine eigenen Headers
            />
        </div>
    )
}
