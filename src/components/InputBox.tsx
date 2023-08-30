import WaveSurfer from "wavesurfer.js";
import {useEffect, useRef, useState} from "react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import {Box, Button} from "@mui/material";

type RecordingStatus = "recording" | "inactive" | "paused";

export default function InputBox() {
    const [blob, setBlob] = useState < Blob > ();
    const [blobUrl, setBlobUrl] = useState < string > ();
    const [recordingStatus, setRecordingStatus] = useState < RecordingStatus > ("inactive");

    let waveSurferRef = useRef();
    let waveformRef = useRef < WaveSurfer > ();
    let recordRef = useRef < RecordPlugin > ();


    useEffect(() => {
        if (! waveSurferRef.current) {
            return;
        }

        const waveSurfer = WaveSurfer.create({container: waveSurferRef.current});
        const record = waveSurfer.registerPlugin(RecordPlugin.create({mimeType: "audio/webm"}));

        record.on('record-start', () => {
            setBlob(undefined);
            setBlobUrl(undefined);
            setRecordingStatus("recording");

        });
        record.on('record-end', (blob) => {
            const url = URL.createObjectURL(blob);

            setBlob(blob);
            setBlobUrl(url);
            setRecordingStatus("inactive");
        });

        waveformRef.current = waveSurfer;
        recordRef.current = record;

        return() => {
            waveSurfer.destroy();
            record.destroy();
        }
    }, [])

    function start() {
        stop();
        setRecordingStatus("recording");
        recordRef.current ?. startRecording();
        recordRef.current ?. startMic();
    }

    function stop() {
        if (recordingStatus === "recording") {
            setRecordingStatus("inactive");
            recordRef.current ?. stopRecording();
            recordRef.current ?. stopMic();
        }
    }

    function cancel() {
        if (recordingStatus === "recording") {
            setRecordingStatus("paused");
            setBlob(undefined);
            setBlobUrl(undefined);
            recordRef.current ?. stopRecording();
            recordRef.current ?. stopMic();
        }
    }

    return (
        <>
            <Box ref={waveSurferRef}
                sx={
                    {
                        width: 500,
                        height: 100,
                        border: "1px solid black"
                    }
            }>
                {
                recordingStatus === "recording" ? <Box>
                    <Button onClick={cancel}>Cancel</Button>
                    <Button onClick={stop}>Stop</Button>
                </Box> : <Button onClick={start}>Start</Button>
            } </Box>
            {
            (recordingStatus !== "recording" && blobUrl) ? <audio src={blobUrl}
                controls/> : null
        }
            <div id='waveform'></div>
            <p>{blobUrl}</p>
            <p>{
                blob ?. size
            }</p>
        </>
    )
}
