import {useState, useRef, useEffect} from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import {Region} from "wavesurfer.js/dist/plugins/regions.js";
import {
    Box,
    Slider,
    ToggleButton,
    Stack,
    Typography,
    IconButton
} from "@mui/material";
import {PlayCircleRounded, PauseCircleRounded, TextFieldsRounded} from '@mui/icons-material';
import {randomColor, formatDuration} from "@/utils";

interface IMessageBoxProps {
    audio: string;
    text?: string | undefined;
    height: number;
}

export default function MessageBox(props : IMessageBoxProps) {
    const {audio, text, height} = props;
    const [showText, setShowText] = useState < boolean > (false);
    const [isPlaying, setIsPlaying] = useState < boolean > (false);
    const [currentTime, setCurrentTime] = useState(0);

    let waveSurferRef = useRef(null);
    let waveformRef = useRef < WaveSurfer > ();
    let regionsRef = useRef < RegionsPlugin > ();
    let activeRegionRef = useRef < Region > ();


    useEffect(() => {
        if (! waveSurferRef.current) 
            return;
        


        let waveSurfer = WaveSurfer.create({
            container: waveSurferRef.current,
            height: height - 2,
            autoCenter: true,
            barHeight: 3,
            progressColor: "#8A2BE2",
            waveColor: "#E6E6FA",
            cursorColor: "#FFA500",
            minPxPerSec: 100,
            autoScroll: true,
            hideScrollbar: true
        });

        waveSurfer.load(audio);

        waveSurfer.on('ready', () => {
            waveformRef.current = waveSurfer;
        })

        waveSurfer.on('timeupdate', (time : number) => {
            time = Number.parseFloat(time.toFixed(1));
            if (time !== currentTime) {
                setCurrentTime(time)
            }
        })

        waveSurfer.on('decode', () => {
            let regions = waveSurfer.registerPlugin(RegionsPlugin.create());

            waveSurfer.on('interaction', (time) => {
                activeRegionRef.current = undefined;

                for (let region of regions.getRegions()) {
                    if (time >= region.start && time <= region.end) {
                        waveSurfer.setTime(time);
                        activeRegionRef.current = region;
                    }
                }
            })

            regions.enableDragSelection({color: randomColor(0.5)})
            regions.on('region-in', (region) => {
                activeRegionRef.current = region;
            })
            regions.on("region-double-clicked", (region, _) => {
                region.remove();
            })
            regions.on('region-out', (region) => {
                if (activeRegionRef.current === region) {
                    region.play();
                }
            })
            regions.on("region-created", (region) => {
                region.setOptions({color: randomColor(0.15)})
            })

            regionsRef.current = regions;
        })

        return() => {
            regionsRef.current ?. destroy();
            waveSurfer.destroy();
        };
    }, []);

    return (
        <>
            <Box sx={
                {
                    width: 320,
                    p: 1,
                    borderRadius: 3,
                    border: 2
                }
            }>
                <Box ref={waveSurferRef}
                    sx={
                        {
                            width: 300,
                            height: height,
                            borderRadius: height / 2,
                            border: 2,
                            alignItems: 'center',
                            px: 2
                        }
                }></Box>
                <Stack display="flex" alignItems='baseline' direction='row'
                    spacing={0.8}
                    sx={
                        {
                            width: 300,
                            alignmentBaseline: 'central',
                            px: 1
                        }
                }>
                    <IconButton aria-label={
                            isPlaying ? 'play' : 'pause'
                        }
                        onClick={
                            () => {
                                waveformRef.current ?. playPause();
                                setIsPlaying(!isPlaying);
                            }
                        }
                        size="small">
                        {
                        !isPlaying ? <PlayCircleRounded></PlayCircleRounded> : <PauseCircleRounded></PauseCircleRounded>
                    } </IconButton>
                    <Stack sx={
                        {
                            display: 'flex',
                            width: 230
                        }
                    }>
                        <Slider aria-label="time-indicator" size="small"
                            min={0}
                            step={0.1}
                            max={
                                waveformRef.current ?. getDuration()
                            }
                            value={currentTime}
                            onChange={
                                (_, val) => {
                                    waveformRef.current ?. setTime(val as number)
                                    setCurrentTime(val as number)
                                }
                        }></Slider>
                    <Box sx={
                        {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: -1,
                            width: 230
                        }
                    }>
                        <Typography sx={
                            {
                                fontSize: '0.7rem',
                                opacity: 0.5
                            }
                        }>
                            {
                            formatDuration(currentTime)
                        }</Typography>
                        <Typography sx={
                            {
                                fontSize: '0.7rem',
                                opacity: 0.5
                            }
                        }>
                            {
                            waveformRef.current ?. getDuration() ? '-' + formatDuration(waveformRef.current ?. getDuration() - currentTime) : '0:00'
                        }</Typography>
                    </Box>
                </Stack>

            </Stack>
            <ToggleButton value='showText'
                selected={showText}
                onChange={
                    () => {
                        setShowText(!showText)
                    }
            }>
                <TextFieldsRounded></TextFieldsRounded>
            </ToggleButton>
            {
            showText ? <Typography>Hello World</Typography> : ''
        } </Box>
    </>
    )
}
