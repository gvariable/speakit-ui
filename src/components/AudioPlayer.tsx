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
import {PauseRounded, PlayArrowRounded, Forward5Rounded, Replay5Rounded} from "@mui/icons-material";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBackwardStep, faBackwardFast, faForwardStep, faForwardFast} from "@fortawesome/free-solid-svg-icons";
import {randomColor, formatDuration} from "@/utils";

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


    useEffect(() => {
        if (! waveSurferRef.current) 
            return;
        


        let waveSurfer = WaveSurfer.create({
            container: waveSurferRef.current,
            height: 46,
            autoCenter: true,
            barHeight: 4,
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
                        waveformRef.current ?. skip(-5)
                    }
            }>
                <Replay5Rounded></Replay5Rounded>
            </IconButton>
            <IconButton aria-label="slow-down"
                onClick={
                    () => {
                        setPlaybackRate(playBackRate - 0.1 > 0.1 ? playBackRate - 0.1 : 0.1);
                        waveformRef.current ?. setPlaybackRate(playBackRate)
                    }
            }>
                {/* <FastRewindRounded></FastRewindRounded> */}
                <FontAwesomeIcon icon={faBackwardStep}
                    size="1x"/>
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
                        {fontSize: '4rem'}
                    }></PlayArrowRounded>
                ) : (
                    <PauseRounded sx={
                        {fontSize: '4rem'}
                    }></PauseRounded>
                )
            } </IconButton>
            <IconButton aria-label="speed-up"
                onClick={
                    () => {
                        const rate = playBackRate + 0.1 < 4 ? playBackRate + 0.1 : 4;
                        setPlaybackRate(Number(rate.toFixed(1)));
                        waveformRef.current ?. setPlaybackRate(playBackRate)
                    }
            }>
                <FontAwesomeIcon icon={faForwardStep}/>
            </IconButton>
            <IconButton aria-label="step-forward"
                onClick={
                    () => {
                        waveformRef.current ?. skip(5)
                    }
            }>
                <Forward5Rounded></Forward5Rounded>
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
            <FontAwesomeIcon icon={faBackwardFast}
                size="xl"/>
            <Slider aria-label="playback-speed" valueLabelDisplay="auto"
                step={0.1}
                min={0.1}
                max={3}
                defaultValue={1}
                value={playBackRate}
                onChange={
                    (_, val) => {
                        setPlaybackRate(val as number);
                        waveformRef.current ?. setPlaybackRate(playBackRate);
                    }
            }></Slider>
        <FontAwesomeIcon icon={faForwardFast}
            size="xl"/>

    </Stack>
</Box>
    )

}
