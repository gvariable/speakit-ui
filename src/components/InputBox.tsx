import WaveSurfer from "wavesurfer.js";
import {useEffect, useRef, useState} from "react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import {Box, Button} from "@mui/material";

type RecordingStatus = "recording" | "inactive" | "cancelled";

interface IProps {
    height: number;
    width?: number;
}

export default function InputBox(props : IProps) {
    const {height} = props;
    let {width} = props;
    if (!width) {
        width = height * 6;
    }

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

        const waveSurfer = WaveSurfer.create({
            container: waveSurferRef.current,
            height: height * 0.9,
            autoCenter: true,
            minPxPerSec: 200,
            hideScrollbar: true
        });
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
            console.log(url);
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
            setRecordingStatus("cancelled");
            recordRef.current ?. stopRecording();
            recordRef.current ?. stopMic();
        }
    }

    return (
        <>
            <Box ref={waveSurferRef}
                sx={
                    {
                        width: width,
                        height: height,
                        border: "1px solid black",
                        alignItems: 'center'
                    }
            }></Box>
            <Box sx={
                {
                    display: "flex",
                    width: width,
                    height: height,
                    border: "1px solid black",
                    alignItems: 'space-between'
                }
            }>
                <Button onClick={start}
                    disabled={
                        recordingStatus === "recording"
                }>Start</Button>
                <Button onClick={stop}
                    disabled={
                        recordingStatus !== "recording"
                }>Stop</Button>
                <Button onClick={cancel}
                    disabled={
                        recordingStatus !== "recording"
                }>Cancel</Button>
            </Box>
            {
            (recordingStatus === "inactive" && blobUrl) ? <audio src={blobUrl}
                controls/> : null
        } </>
    )
}
