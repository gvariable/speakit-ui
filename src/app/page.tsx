'use client';
import AudioPlayer from "@/components/AudioPlayer"
import {ThemeProvider} from "@emotion/react"
import {getTheme} from "@/theme";
import {useMemo} from "react";

export default function Home() {
    const theme = useMemo(() => getTheme(10), []);
    return (
        <ThemeProvider theme={theme}>
            <AudioPlayer src="/audio.mp3"></AudioPlayer>
        </ThemeProvider>
    )
}
