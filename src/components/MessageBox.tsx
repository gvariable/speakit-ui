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
    IconButton,
    Grid,
    Collapse
} from "@mui/material";
import {
    PlayCircleRounded,
    PauseCircleRounded,
    TextFieldsRounded,
    FavoriteRounded,
    MoreRounded
} from '@mui/icons-material';
import {randomColor, formatDuration} from "@/utils";
import {useTheme} from "@mui/material";

interface IMessageBoxProps {
    audio: string;
    text?: string | undefined;
    height: number;
    width?: number;
}


export default function MessageBox(props : IMessageBoxProps) {
    const {audio, text, height} = props;
    let {width} = props;
    if (!width) {
        width = height * 6;
    }

    const [showTextEnabled, setShowTextEnabled] = useState < boolean > (true);
    const [showText, setShowText] = useState < boolean > (false);
    const [isPlaying, setIsPlaying] = useState < boolean > (false);
    const [currentTime, setCurrentTime] = useState(0);
    const [favorite, setFavorite] = useState < boolean > (false);

    let theme = useTheme();
    let waveSurferRef = useRef(null);
    let waveformRef = useRef < WaveSurfer > ();
    let regionsRef = useRef < RegionsPlugin > ();
    let activeRegionRef = useRef < Region > ();


    useEffect(() => {
        if (! waveSurferRef.current) 
            return;
        


        let waveSurfer = WaveSurfer.create({
            container: waveSurferRef.current,
            height: height * 0.9,
            autoCenter: true,
            barHeight: 3,
            progressColor: theme.palette.primary.light,
            waveColor: theme.palette.secondary.main,
            cursorColor: theme.palette.primary.dark,
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

        // waveSurfer.once('play', () => {
        //     const durationMs = waveSurfer.getDuration() * 1000;
        //     setTimeout(() => {
        //         setShowTextEnabled(true);
        //     }, durationMs > 3000 ? 3000 : durationMs);
        // })

        return() => {
            regionsRef.current ?. destroy();
            waveSurfer.destroy();
        };
    }, []);

    return (
        <>
            <Box sx={
                {
                    width: width,
                    p: 1,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default
                }
            }>
                <Box ref={waveSurferRef}
                    sx={
                        {
                            height: height,
                            borderRadius: height / 2,
                            border: 2,
                            alignItems: 'center',
                            px: 2
                        }
                }></Box>
                <Grid container
                    spacing={1}
                    display='flex'
                    sx={
                        {
                            px: 1,
                            mt: -1.5
                        }
                }>
                    <Grid item>
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
                    </Grid>
                    <Grid item>
                        <Stack sx={
                            {
                                display: 'flex',
                                width: width - 80
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
                                }
                                sx={
                                    {color: theme.palette.primary.light}
                            }></Slider>
                        <Box sx={
                            {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mt: -1.2
                            }
                        }>
                            <Typography sx={
                                {
                                    fontSize: '0.5rem',
                                    opacity: 0.5
                                }
                            }>
                                {
                                formatDuration(currentTime)
                            }</Typography>
                            <Typography sx={
                                {
                                    fontSize: '0.5rem',
                                    opacity: 0.5
                                }
                            }>
                                {
                                waveformRef.current ?. getDuration() ? '-' + formatDuration(waveformRef.current ?. getDuration() - currentTime) : '0:00'
                            }</Typography>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
            <Stack direction='row' display='flex' alignItems='center' justifyContent='space-between'
                sx={
                    {mt: -1}
            }>
                <Stack direction='row' display='flex' alignItems='center'
                    spacing={0.3}>
                    <IconButton aria-label="favorite" size="small"
                        onClick={
                            () => {
                                setFavorite(!favorite)
                            }
                    }>
                        <FavoriteRounded sx={
                            {
                                color: favorite ? 'red' : 'gray'
                            }
                        }></FavoriteRounded>
                    </IconButton>
                    <ToggleButton value='showText'
                        disabled={
                            !showTextEnabled
                        }
                        selected={showText}
                        onChange={
                            () => {
                                setShowText(!showText)
                            }
                        }
                        size="small"
                        sx={
                            {
                                width: "15px",
                                height: "15px",
                                px: 1
                            }
                    }>
                        <TextFieldsRounded sx={
                            {
                                width: "-1rem",
                                height: "-1rem",
                                fontWeight: 'bold'
                            }
                        }></TextFieldsRounded>
                    </ToggleButton>
                </Stack>

                <IconButton aria-label="more" size="small"
                    sx={
                        {
                            width: "20px",
                            height: "20px",
                            justifyContent: 'right'
                        }
                }>
                    <MoreRounded></MoreRounded>
                </IconButton>

            </Stack>

            <Collapse in={showText}
                unmountOnExit>
                <Typography> {text}</Typography>
            </Collapse>
        </Box>
    </>
    )
}
