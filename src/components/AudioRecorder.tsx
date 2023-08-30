import {useRef, useState} from "react";

type RecordingStatus = "recording" | "stopped" | "paused";

export default function AudioRecorder() {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState < MediaStream > ();
    const [recordingStatus, setRecordingStatus] = useState < RecordingStatus > ('stopped');
    const [audioChunks, setAudioChunks] = useState < Array < Blob > > ();
    const [audio, setAudio] = useState < string > ();

    const mediaRecorderRef = useRef < MediaRecorder > ();

    async function getPermission() {
        try {
            const data = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
            setPermission(true);
            setStream(data);
        } catch (err) {
            alert(err)
        }
    }

    async function start() {
        if (!stream) {
            return;
        }

        setRecordingStatus('recording');
        const media = new MediaRecorder(stream, {mimeType: 'audio/webm'});
        mediaRecorderRef.current = media;
        media.start();

        let chunks: Array < Blob > = [];
        media.ondataavailable = (event) => {
            if (typeof event.data == 'undefined') {
                return;
            }

            if (event.data.size == 0) {
                return;
            }

            chunks.push(event.data);
        }
        setAudioChunks(chunks);
    }

    function stop() {
        setRecordingStatus("stopped");
        mediaRecorderRef.current ?. stop();

        (mediaRecorderRef.current !.onstop as() => any) = () => {
            const blob = new Blob(audioChunks, {type: 'audio/webm'});
            const audioURL = URL.createObjectURL(blob);
            setAudio(audioURL);
            setAudioChunks([]);
            console.log("audioURL", audioURL);
            console.log("blob", audioChunks)
        };
    }

    return (
        <>
            <h2>Audio Recorder</h2>
            <main>
                <div className="audio-controls">
                    {
                    audio ? (
                        <div className="audio-container">
                            <audio src={audio}
                                controls></audio>
                            <a download
                                href={audio}>
                                Download Recording
                            </a>
                        </div>
                    ) : null
                }
                    {
                    !permission ? (
                        <button onClick={getPermission}
                            type="button">
                            Get Microphone
                        </button>
                    ) : null
                }
                    {
                    permission && recordingStatus === "stopped" ? (
                        <button onClick={start}
                            type="button">
                            Start Recording
                        </button>
                    ) : null
                }
                    {
                    recordingStatus === "recording" ? (
                        <button onClick={stop}
                            type="button">
                            Stop Recording
                        </button>
                    ) : null
                } </div>
            </main>
        </>
    )
}
