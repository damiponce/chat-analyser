import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/layout.module.scss';
import indexStyles from '../styles/index.module.css';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import {useEffect} from 'react';

export const Layout = ({children}: {children: any}) => {
   return (
      <div className={styles.container}>
         <Head>
            <link rel="icon" href="/favicon.ico" />
         </Head>
         <header className={styles.header}>
            <Link href="/" passHref>
               <a>
                  <a className={styles.title}>
                     chat<span className={styles.title_accent}>analyser</span>
                  </a>
               </a>
            </Link>
         </header>
         <main>{children}</main>
         <div className={styles.footer}></div>
      </div>
   );
};
