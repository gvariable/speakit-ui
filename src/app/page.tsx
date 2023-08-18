import WaveForm from "@/components/WaveForm";

export default function Home() {
    return (<div>
        <h1 className="px-10">WaveForm</h1>
        <h2>This is a test</h2>
        <WaveForm src="/audio.mp3"></WaveForm>
    </div>)
}
