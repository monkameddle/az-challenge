export default function TwitchEmbed() {
    return (
        <div className="w-full aspect-video">
            <iframe
                src="https://player.twitch.tv/?channel=YOUR_CHANNEL&parent=yourdomain"
                width="100%"
                height="100%"
                allowFullScreen
                className="border-0"
            />
        </div>
    )
}