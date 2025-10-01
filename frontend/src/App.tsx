import TwitchEmbed from './components/TwitchEmbed'
import PollWidget from './components/PollWidget'
import WheelWidget from './components/WheelWidget'
import ProgressHeader from './components/ProgressHeader'
import RiotSummary from './components/RiotSummary'


export default function App() {
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <TwitchEmbed/>
            <ProgressHeader/>
            <RiotSummary region="euw1" summoner="YOUR_SUMMONER"/>
            <div className="grid md:grid-cols-2 gap-4">
                <PollWidget/>
                <WheelWidget/>
            </div>
        </div>
    )
}