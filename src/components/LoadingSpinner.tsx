import React from 'react';
import {GooSpinner} from 'react-spinners-kit';
import styles from '../styles/Loading.module.scss';

function LoadingSpinner({
   condition,
   message,
   color,
}: {
   condition: boolean;
   message: string;
   color?: string;
}) {
   return condition ? (
      <div className={styles.main}>
         <GooSpinner color={color ?? '#fff'} />
         <span className={styles.message} style={{color: color ?? '#fff'}}>
            {message.toString()}
         </span>
      </div>
   ) : null;
}

export default LoadingSpinner;
