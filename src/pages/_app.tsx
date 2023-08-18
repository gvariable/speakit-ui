import type {AppProps}
from 'next/app';

export default function APP({Component, pageProps} : AppProps) {
    return (<div>
        <Component {...pageProps}/>
    </div>)
}
