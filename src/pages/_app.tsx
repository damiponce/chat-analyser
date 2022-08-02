import '../styles/globals.scss';
import type {AppProps} from 'next/app';
import PyodideProvider from './pyodide/PyodideProvider';

import '../styles/uppy-core.css';
import '../styles/uppy-drag-drop.css';

function MyApp({Component, pageProps}: AppProps) {
   return (
      <PyodideProvider>
         <Component {...pageProps} />
      </PyodideProvider>
   );
}

export default MyApp;
