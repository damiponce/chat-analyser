import {useContext, useEffect, useState} from 'react';
import {unstable_renderSubtreeIntoContainer} from 'react-dom';
import {PyodideContext} from './PyodideProvider';

export default function Pyodide({
   id,
   pythonCode,
   loadingMessage = 'Loading Python...',
   evaluatingMessage = 'Loading Python...', // 'Evaluating code...',
   processingMessage = 'Processing data...',
   onPythonOutput,
   currentStatus,
}) {
   const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/';
   const {
      pyodide,
      hasLoadPyodideBeenCalled,
      isPyodideLoading,
      setIsPyodideLoading,
   } = useContext(PyodideContext);
   const [pyodideOutput, setPyodideOutput] = useState(evaluatingMessage);

   // load pyodide wasm module and initialize it
   useEffect(() => {
      if (!hasLoadPyodideBeenCalled.current) {
         // immediately set hasLoadPyodideBeenCalled ref, which is part of context, to true
         // this prevents any additional Pyodide components from calling loadPyodide a second time
         hasLoadPyodideBeenCalled.current = true;
         (async function () {
            //@ts-ignore
            pyodide.current = await global.loadPyodide({indexURL});
            setIsPyodideLoading(false);
            // updating value of isPyodideLoading triggers second useEffect
         })();
      }
      // pyodide and hasLoadPyodideBeenCalled are both refs and setIsPyodideLoading is a setState function (from context)
      // as a result, these dependencies will be stable and never cause the component to re-render
      // }, []);
   }, [pyodide, hasLoadPyodideBeenCalled, setIsPyodideLoading]);

   // evaluate python code with pyodide and set output
   useEffect(() => {
      if (!isPyodideLoading) {
         const evaluatePython = async (pyodide, pythonCode) => {
            try {
               await pyodide.loadPackage('numpy');
               await pyodide.loadPackage('pandas');
               return await pyodide.runPython(pythonCode);
            } catch (error) {
               console.error(error);
               return 'Error evaluating Python code. See console for details.';
            }
         };
         (async function () {
            setPyodideOutput(await evaluatePython(pyodide.current, pythonCode));
         })();
      }
      // component re-renders when isPyodideLoading changes, which is set with first useEffect and updated via context
   }, [isPyodideLoading, pyodide, pythonCode]);

   useEffect(() => {
      if (pyodideOutput !== evaluatingMessage) {
         onPythonOutput(pyodideOutput, pyodide);
      }
   }, [pyodideOutput]);

   useEffect(() => {
      currentStatus(
         isPyodideLoading
            ? loadingMessage
            : pyodideOutput === evaluatingMessage
            ? evaluatingMessage
            : processingMessage,
      );
   }, [isPyodideLoading, pyodideOutput]);

   return <></>;

   // return (
   //    <div id={id}>
   //       Pyodide Output: {isPyodideLoading ? loadingMessage : pyodideOutput}
   //    </div>
   // );
}
