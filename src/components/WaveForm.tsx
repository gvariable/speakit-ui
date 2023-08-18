'use client';
import {set} from "date-fns";
import {useRef, useEffect, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import {Region} from "wavesurfer.js/dist/plugins/regions.js";

interface Iprops {
    src: string;
}

export default function WaveForm(props : Iprops) {
    const {src} = props;
    const [isPlaying, setIsPlaying] = useState < boolean > (false);
    let waveSurferRef = useRef(null);
    let waveformRef = useRef < WaveSurfer > ();
    let regionsRef = useRef < RegionsPlugin > ();
    let activeRegionRef = useRef < Region > ();


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
            minPxPerSec: 50,
            autoScroll: true
        });


        waveSurfer.load(src);

        waveSurfer.on('ready', () => {
            waveformRef.current = waveSurfer;
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


    return (<>
        <div>
            <button className="mx-1  rounded-lg px-2 border-solid bg-indigo-400"
                onClick={
                    () => {
                        waveformRef.current ?. playPause();
                        setIsPlaying(!isPlaying);
                    }
            }> {
                isPlaying ? 'Pause' : 'Play'
            } </button>
            <button className="mx-1 rounded-lg px-2 border-solid bg-indigo-400"
                onClick={
                    () => {
                        waveformRef.current ?. skip(1);
                    }
            }>
                forward 1s
            </button>
            <button className="mx-1 rounded-lg px-2 border-solid bg-indigo-400"
                onClick={
                    () => {
                        waveformRef.current ?. skip(-1);
                    }
            }>
                backward 1s
            </button>
            <button className="mx-1 rounded-lg px-2 border-solid bg-indigo-400"
                onClick={handleRegionRemove}>
                Remove Region
            </button>
            <div ref={waveSurferRef}></div>
        </div>
    </>)

}
