const random = (min : number, max : number) => Math.random() * (max - min) + min;
export const randomColor = (alpha : number) : string => {
    return `rgba(${
        random(0, 255)
    }, ${
        random(0, 255)
    }, ${
        random(0, 255)
    }, ${alpha})`
}

export const formatDuration = (value : number) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${
        seconds < 10 ? '0' : ''
    }${seconds}`;
}
