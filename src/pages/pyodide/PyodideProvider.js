import {createContext, useRef, useState} from 'react';

import Script from 'next/script';
export const PyodideContext = createContext();

export default function PyodideProvider({children}) {
   const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.20.0/full/';
   const pyodide = useRef(null);
   const hasLoadPyodideBeenCalled = useRef(false);
   const [isPyodideLoading, setIsPyodideLoading] = useState(true);

   return (
      <>
         <Script src={`${indexURL}pyodide.js`} strategy="beforeInteractive" />
         <PyodideContext.Provider
            value={{
               pyodide,
               hasLoadPyodideBeenCalled,
               isPyodideLoading,
               setIsPyodideLoading,
            }}>
            {children}
         </PyodideContext.Provider>
      </>
   );
}
