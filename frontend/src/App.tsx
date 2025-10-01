import TwitchEmbed from './components/TwitchEmbed'
import PollWidget from './components/PollWidget'
import WheelWidget from './components/WheelWidget'
import ProgressHeader from './components/ProgressHeader'
import RiotSummary from './components/RiotSummary'


export default function App() {

    const region = import.meta.env.VITE_REGION || "euw1"
    const summoner = import.meta.env.VITE_SUMMONER || "unknown"

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <TwitchEmbed/>
            <ProgressHeader/>
            <RiotSummary region={region} summoner={summoner} />
            <div className="grid md:grid-cols-2 gap-4">
                <PollWidget/>
                <WheelWidget/>
            </div>
        </div>
    )
}