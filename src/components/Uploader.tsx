import Uppy, {UppyFile} from '@uppy/core';
import Tus from '@uppy/tus';
import {DragDrop} from '@uppy/react';
import styles from '../styles/Uploader.module.scss';

interface Props {
   onFileAdded: (file: UppyFile) => void;
   currentMessage: string | undefined;
}

export const Uploader = (props: Props) => {
   const uppy = new Uppy({
      restrictions: {maxNumberOfFiles: 1, allowedFileTypes: ['.txt']},
      autoProceed: true,
   });

   // uppy.use(Tus, {endpoint: '/upload'});

   uppy.on('upload-success', (file, response) => {
      console.log(file);
   });

   uppy.on('error', error => {
      console.error(error.stack);
   });

   uppy.on('upload-progress', (file, progress) => {
      // file: { id, name, type, ... }
      // progress: { uploader, bytesUploaded, bytesTotal }
      console.log(file.id, progress.bytesUploaded, progress.bytesTotal);
   });

   uppy.on('file-added', file => {
      props.onFileAdded(file);
   });

   return (
      <div className="card">
         {props.currentMessage || false ? (
            <div
               className={
                  'uppy-DragDrop-container uppy-DragDrop--isDragDropSupported'
               }>
               <h1 className={'uppy-DragDrop-inner ' + styles.message}>
                  {props.currentMessage}
               </h1>
            </div>
         ) : (
            <DragDrop
               uppy={uppy}
               locale={{
                  strings: {
                     // Text to show on the droppable area.
                     // `%{browse}` is replaced with a link that opens the system file selection dialog.
                     dropHereOr: 'Drop here or %{browse}',
                     // Used as the label for the link that opens the system file selection dialog.
                     browse: 'browse',
                  },
               }}
            />
         )}
         {/* <div style={{width: '100%', height: '100%', backgroundColor: 'red'}} /> */}
      </div>
   );
};
