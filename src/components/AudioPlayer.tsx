import {useRef, useEffect, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import {Region} from "wavesurfer.js/dist/plugins/regions.js";
import {
    Box,
    IconButton,
    Slider,
    Stack,
    Typography
} from "@mui/material";
import {
    PauseRounded,
    PlayArrowRounded,
    SkipNextRounded,
    SkipPreviousRounded,
    VolumeDownRounded,
    VolumeUpRounded
} from "@mui/icons-material";

interface Iprops {
    src: string;
}

export default function AudioPlayer(props : Iprops) {
    const {src} = props;
    const [isPlaying, setIsPlaying] = useState < boolean > (false);
    const [playBackRate, setPlaybackRate] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);

    let waveSurferRef = useRef(null);
    let waveformRef = useRef < WaveSurfer > ();
    let regionsRef = useRef < RegionsPlugin > ();
    let activeRegionRef = useRef < Region > ();

    const formatDuration = (value : number) => {
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}:${
            seconds < 10 ? '0' : ''
        }${seconds}`;
    }

    const random = (min : number, max : number) => Math.random() * (max - min) + min;
    const randomColor = (alpha : number) : string => {
        return `rgba(${
            random(0, 255)
        }, ${
            random(0, 255)
        }, ${
            random(0, 255)
        }, ${alpha})`
    }

    useEffect(() => {
        if (! waveSurferRef.current) 
            return;
        


        let waveSurfer = WaveSurfer.create({
            container: waveSurferRef.current,
            autoCenter: true,
            barWidth: 2,
            progressColor: "#8A2BE2",
            waveColor: "#E6E6FA",
            cursorColor: "#FFA500",
            minPxPerSec: 100,
            autoScroll: true,
            hideScrollbar: true
        });

        waveSurfer.load(src);

        waveSurfer.on('ready', () => {
            waveformRef.current = waveSurfer;
        })

        waveSurfer.on('timeupdate', (time : number) => {
            time = Number.parseFloat(time.toFixed(1));
            if (time !== currentTime) 
                setCurrentTime(time)
        })

        waveSurfer.on('decode', () => {
            let regions = waveSurfer.registerPlugin(RegionsPlugin.create());

            regions.enableDragSelection({color: randomColor(0.2)})
            regions.on('region-in', (region) => {
                activeRegionRef.current = region;
            })
            regions.on("region-clicked", (region, _) => {
                activeRegionRef.current = region;
            })
            regions.on('region-out', (region) => {
                if (activeRegionRef.current === region) {
                    console.log('region-out and activeRegionRef.current === region');
                    region.play();
                }
                console.log('region-out');
            })
            waveSurfer.on('interaction', () => {
                activeRegionRef.current = undefined;
            })

            regionsRef.current = regions;
        })

        return() => {
            regionsRef.current ?. destroy();
            waveSurfer.destroy();
        };
    }, []);

    function handleRegionRemove() {
        activeRegionRef.current ?. remove();
        activeRegionRef.current = undefined;
    }


    return (
        <Box>
            <div ref={waveSurferRef}></div>
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
                mt: -2
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
                formatDuration(waveformRef.current ?. getDuration() || 0)
            }</Typography>
        </Box>
        <Box sx={
            {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }>
            <IconButton aria-label="step-backward"
                onClick={
                    () => {
                        waveformRef.current ?. skip(-3)
                    }
            }>
                <SkipPreviousRounded></SkipPreviousRounded>
            </IconButton>
            <IconButton aria-label={
                    isPlaying ? 'play' : 'pause'
                }
                onClick={
                    () => {
                        waveformRef.current ?. playPause();
                        setIsPlaying(!isPlaying)
                    }
            }>
                {
                !isPlaying ? (
                    <PlayArrowRounded sx={
                        {fontSize: '3rem'}
                    }></PlayArrowRounded>
                ) : (
                    <PauseRounded sx={
                        {fontSize: '3rem'}
                    }></PauseRounded>
                )
            } </IconButton>
            <IconButton aria-label="step-forward"
                onClick={
                    () => {
                        waveformRef.current ?. skip(3)
                    }
            }>
                <SkipNextRounded></SkipNextRounded>
            </IconButton>
        </Box>
        <Stack spacing={2}
            direction='row'
            alignItems='center'
            sx={
                {
                    mb: 1,
                    px: 1
                }
        }>
            <VolumeDownRounded></VolumeDownRounded>
            <Slider aria-label="playback-speed" valueLabelDisplay="auto"
                step={0.05}
                min={0.1}
                max={3}
                defaultValue={1}
                onChange={
                    (_, val) => {
                        setPlaybackRate(val as number);
                        waveformRef.current ?. setPlaybackRate(playBackRate);
                    }
            }></Slider>
        <VolumeUpRounded></VolumeUpRounded>

    </Stack>
</Box>
    )

}