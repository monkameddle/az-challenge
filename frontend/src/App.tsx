import TwitchEmbed from './components/TwitchEmbed'
import PollWidget from './components/PollWidget'
import WheelWidget from './components/WheelWidget'


export default function App(){
return (
<div className="max-w-5xl mx-auto p-4 space-y-6">
<TwitchEmbed />
<div className="grid md:grid-cols-2 gap-4">
<PollWidget />
<WheelWidget />
</div>
</div>
)
}
