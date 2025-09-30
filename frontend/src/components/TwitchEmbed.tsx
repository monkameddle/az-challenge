export default function TwitchEmbed(){
return (
<div className="w-full aspect-video">
<iframe
src="https://player.twitch.tv/?channel=YOUR_CHANNEL&parent=yourdomain"
height="100%" width="100%" allowFullScreen frameBorder={0}
/>
</div>
)
}
