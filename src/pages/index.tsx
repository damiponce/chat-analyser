import type {NextPage} from 'next';
import {Layout} from '../components/layout';
import styles from '../styles/Home.module.scss';
import Pyodide from '../components/pyodide/Pyodide';
import {Uploader} from '../components/Uploader';
import {parseTextToDataFrame} from './api/DataFunctions';
import {useEffect, useState} from 'react';
//@ts-ignore
import code from '../public/code.py';
//@ts-ignore
import processing from '../public/processing.py';

import TimelineChart from '../components/plots/TimelineChart';
import BoxPlot from '../components/plots/BoxPlot';
import {
   Bin,
   Heatmap,
   Stats,
   Timeline,
   BarStats,
} from '../components/plots/types';

import Example from '../components/plots/Heatmap';
import Wordcloud from '../components/plots/WordCloud';
import XY from '../components/plots/TimelineChart copy';
import TEST from '../components/plots/XY';
import Testing from '../components/plots/TESTING';
import BarGroup from '../components/plots/BarGroup';
import {getHash, getSeed} from './api/RNG';
import * as Colour from './api/Colour';

const Home: NextPage = () => {
   const [df, setDf] = useState<(string[] | Date[])[]>();
   const [output, setOutput] = useState<any>();
   const [pyodide, setPyodide] = useState<any>();
   const [status, setStatus] = useState<string>();
   const [didOutput, setDidOutput] = useState(false);

   // DATA
   const [df_timeline, setDf_tl] = useState<Timeline[][]>();
   const [df_daily, setDf_dy] = useState<BarStats[]>();
   const [df_hourly, setDf_hr] = useState<BarStats[]>();
   const [df_heatmap, setDf_hm] = useState<Heatmap[]>();
   const [df_words, setDf_w] = useState<string>();

   // GRAPH SETTINGS
   const [users, setUsers] = useState<string[]>([]);
   const [user_colours, setUserColours] = useState<string[]>([]);
   const [tl_users, setTimelineUsers] = useState<boolean[]>([]);

   function clearStates() {
      setDf_tl(undefined);
      setDf_dy(undefined);
      setDf_hr(undefined);
      setDf_hm(undefined);
      setDf_w(undefined);
      setUsers([]);
      setTimelineUsers([]);
   }

   useEffect(() => {
      // typeof df !== 'undefined' ? df.print() : null;
      typeof df !== 'undefined' ? console.log(df) : null;
      return;
   }, [df]);

   useEffect(() => {
      if (didOutput === true) {
         console.log('============= PYTHON =============');
         let pd = pyodide.current.globals.get('pd');
         let data = {user: df[1], msg: df[2]};
         // let d = {col1: [1, 2], col2: [3, 4]};
         // let dt = pd.DataFrame(d);
         pyodide.current.globals.set('data', data);
         pyodide.current.globals.set('index', df[0]);
         pyodide.current.runPython(`
            df = pd.DataFrame(data=data.to_py(), index=pd.to_datetime(index.to_py(), format="%Y%m%d%H%M"))
         `);
         pyodide.current.runPython(processing);

         clearStates();

         const map = (
            value: number,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
         ) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

         var fetch_users: string[] = pyodide.current.globals
            .get('df_user_list')
            .toJs();
         setUsers(fetch_users);
         let temp: boolean[] = [];
         let temp_colours: string[] = [];
         for (let i = 0; i <= fetch_users.length; i++) {
            temp.push(true);

            // yourNumber.toString(16);
            let t_col = Colour.hslToRgb(
               Math.random(),
               map(Math.random(), 0, 1, 0.4, 0.6),
               map(Math.random(), 0, 1, 0.3, 0.7),
            );
            let t_hex = '#';
            for (let x of t_col) {
               t_hex += Math.round(x).toString(16);
            }
            temp_colours.push(t_hex);
         }
         console.log('USER ARR: ');
         console.log(fetch_users);
         console.log('STATE ARR: ');
         console.log(temp);
         setTimelineUsers(temp);
         setUserColours(temp_colours);

         let df_tl: [] = [];
         for (let x of pyodide.current.globals.get('df_timeline_dict').toJs()) {
            //@ts-ignore
            df_tl.push(JSON.parse(x));
         }
         let temp_df_tl_user = [];
         for (let x of df_tl) {
            let temp_df_tl: Timeline[] = [];
            var i = 0;
            for (let date of x.index) {
               temp_df_tl.push({date: date, qty: x.data[i][0]});
               i++;
            }
            temp_df_tl_user.push(temp_df_tl);
         }
         setDf_tl(temp_df_tl_user);

         let df_dy: [] = [];
         for (let x of pyodide.current.globals
            .get('df_daily_stats_dict')
            .toJs()) {
            //@ts-ignore
            df_dy.push(JSON.parse(x));
         }
         let temp_df_dy_user: BarStats[] = [];

         //@ts-ignore
         for (let day in df_dy[0]) {
            // var temp_user: Stats[] = [];
            let temp_user_daily: BarStats = {label: day};
            for (let k = 0; k < df_dy.length; k++) {
               let data = df_dy[k][day];
               // temp_user.push({
               //    boxPlot: {
               //       min: data['min'],
               //       firstQuartile: data['25%'],
               //       median: data['50%'],
               //       thirdQuartile: data['75%'],
               //       max: data['max'],
               //       outliers: data['outliers'],
               //    },
               //    binData: [{value: 0, count: 0}],
               //    mean: data['mean'],
               // });

               temp_user_daily[fetch_users[k]] = {
                  boxPlot: {
                     min: data['min'],
                     firstQuartile: data['25%'],
                     median: data['50%'],
                     thirdQuartile: data['75%'],
                     max: data['max'],
                     outliers: data['outliers'],
                  },
                  binData: [{value: 0, count: 0}],
                  mean: data['mean'],
               };
            }
            temp_df_dy_user.push(temp_user_daily);
         }
         console.log('====================================');
         console.log(temp_df_dy_user);
         console.log('====================================');
         setDf_dy(temp_df_dy_user);

         // for (let x of df_dy) {
         //    let temp_df_dy: Stats[] = [];
         //    i = 0;
         //    console.log(x);
         //    for (let day in x) {
         //       temp_df_dy.push({
         //          boxPlot: {
         //             min: x[`${day}`]['min'],
         //             firstQuartile: x[`${day}`]['25%'],
         //             median: x[`${day}`]['50%'],
         //             thirdQuartile: x[`${day}`]['75%'],
         //             max: x[`${day}`]['max'],
         //             outliers: x[`${day}`]['outliers'],
         //          },
         //          binData: [{value: 0, count: 0}],
         //          mean: x[`${day}`]['mean'],
         //       });
         //       i++;
         //    }
         //    temp_df_dy_user.push(temp_df_dy);
         // }
         // setDf_dy(temp_df_dy_user);

         let df_hr: [] = [];
         for (let x of pyodide.current.globals
            .get('df_hourly_stats_dict')
            .toJs()) {
            //@ts-ignore
            df_hr.push(JSON.parse(x));
         }
         let temp_df_hr_user: BarStats[] = [];

         //@ts-ignore
         for (let hour in df_hr[0]) {
            // var temp_user: Stats[] = [];
            let temp_user_hourly: BarStats = {label: hour};
            for (let k = 0; k < df_hr.length; k++) {
               let data = df_hr[k][hour];
               // temp_user.push({
               //    boxPlot: {
               //       min: data['min'],
               //       firstQuartile: data['25%'],
               //       median: data['50%'],
               //       thirdQuartile: data['75%'],
               //       max: data['max'],
               //       outliers: data['outliers'],
               //    },
               //    binData: [{value: 0, count: 0}],
               //    mean: data['mean'],
               // });

               temp_user_hourly[fetch_users[k]] = {
                  boxPlot: {
                     min: data['min'],
                     firstQuartile: data['25%'],
                     median: data['50%'],
                     thirdQuartile: data['75%'],
                     max: data['max'],
                     outliers: data['outliers'],
                  },
                  binData: [{value: 0, count: 0}],
                  mean: data['mean'],
               };
            }
            temp_df_hr_user.push(temp_user_hourly);
         }
         console.log('====================================');
         console.log(temp_df_hr_user);
         console.log('====================================');
         setDf_hr(temp_df_hr_user);

         // let df_hr = JSON.parse(
         //    pyodide.current.globals.get('df_hourly_stats_dict'),
         // );
         // let temp_df_hr: Stats[] = [];
         // i = 0;
         // for (let hour in df_hr) {
         //    temp_df_hr.push({
         //       boxPlot: {
         //          min: df_hr[`${hour}`]['min'],
         //          firstQuartile: df_hr[`${hour}`]['25%'],
         //          median: df_hr[`${hour}`]['50%'],
         //          thirdQuartile: df_hr[`${hour}`]['75%'],
         //          max: df_hr[`${hour}`]['max'],
         //          outliers: df_hr[`${hour}`]['outliers'],
         //       },
         //       binData: [{value: 0, count: 0}],
         //       mean: 0,
         //    });
         //    i++;
         // }
         // setDf_hr(temp_df_hr);

         let df_hm = JSON.parse(pyodide.current.globals.get('df_heatmap'));
         let temp_df_hm: Heatmap[] = [];
         i = 0;
         for (let hour in df_hm) {
            let temp_df_hm_del: Bin[] = [];
            for (let delay in df_hm[hour]) {
               let n = df_hm[hour][delay];
               temp_df_hm_del.unshift({bin: 0, count: n ?? 0});
            }
            temp_df_hm.push({
               bin: parseInt(hour),
               bins: temp_df_hm_del,
            });
            i++;
         }
         setDf_hm(temp_df_hm);

         setDf_w(pyodide.current.globals.get('df_words'));

         pd.destroy();
         setStatus(undefined);
         return;
      }
   }, [didOutput, df]);

   useEffect(() => {
      console.log(output);
      return;
   }, [output]);

   function onChangeValue(event: any) {
      // setTimelineUser(event.target.value);
      let temp = tl_users;
      temp[event.target.value] = !temp[event.target.value];
      setTimelineUsers(temp);
      console.log(tl_users);
   }

   const f: BarStats[] = [
      {
         label: 'hoy',
         dam: {
            boxPlot: {
               min: 0,
               firstQuartile: 0,
               median: 0,
               thirdQuartile: 0,
               max: 0,
               outliers: [0],
            },
            binData: [{value: 0, count: 0}],
            mean: 30,
         },
         santi: {
            boxPlot: {
               min: 0,
               firstQuartile: 0,
               median: 0,
               thirdQuartile: 0,
               max: 0,
               outliers: [0],
            },
            binData: [{value: 0, count: 0}],
            mean: 10,
         },
      },
      {
         label: 'mañana',
         dam: {
            boxPlot: {
               min: 0,
               firstQuartile: 0,
               median: 0,
               thirdQuartile: 0,
               max: 0,
               outliers: [0],
            },
            binData: [{value: 0, count: 0}],
            mean: 100,
         },
         santi: {
            boxPlot: {
               min: 0,
               firstQuartile: 0,
               median: 0,
               thirdQuartile: 0,
               max: 0,
               outliers: [0],
            },
            binData: [{value: 0, count: 0}],
            mean: 50,
         },
      },
   ];

   return (
      <Layout>
         {df ? (
            <Pyodide
               id="a"
               pythonCode={code}
               onPythonOutput={(pythonOutput: any, pyodideInstance: any) => (
                  setOutput(pythonOutput),
                  setPyodide(pyodideInstance),
                  setDidOutput(true)
               )}
               currentStatus={(status: string) => {
                  setStatus(status);
               }}
            />
         ) : null}
         <Uploader
            onFileAdded={(file: any) =>
               file.data.text().then((text: string) => {
                  setDf(parseTextToDataFrame(text));
               })
            }
            currentMessage={status}
         />

         {/* <Testing width={800} height={500} /> */}

         {df_timeline && df_daily && df_hourly && df_heatmap && df_words ? (
            <>
               {/* <div className={styles.section}>
                  <XY
                     width={800}
                     height={500}
                     data={df_timeline}
                     enabled={tl_users}
                  />
               </div> */}

               <div className={styles.section}>
                  <TimelineChart
                     width={800}
                     height={500}
                     data={df_timeline[df_timeline.length - 1]}
                     enabled={tl_users}
                  />
                  <div className={styles.details}>
                     <h1 className={styles.graph_title}>Timeline</h1>
                     <div
                        onChange={onChangeValue}
                        className={styles.radio_group}>
                        {df_timeline.map((value, index) => (
                           <label>
                              <input
                                 defaultChecked
                                 type="checkbox"
                                 value={index}
                                 // checked={true}
                              />
                              {index < users.length ? users[index] : 'Total'}
                           </label>
                        ))}
                     </div>
                  </div>
               </div>

               <div className={styles.section}>
                  <BarGroup
                     width={800}
                     height={500}
                     data={df_daily}
                     colours={user_colours}
                  />
               </div>

               <div className={styles.section}>
                  <BarGroup
                     width={800}
                     height={500}
                     data={df_hourly}
                     colours={user_colours}
                  />
               </div>

               {/* <div className={styles.section}>
                  <div className={styles.graph}>
                     <BoxPlot
                        width={800}
                        height={500}
                        data={df_daily}
                        keys={users}
                     />
                  </div>
                  <div className={styles.details}>
                     <h1 className={styles.graph_title}>Daily box plot</h1>
                  </div>
               </div>
               <div className={styles.section}>
                  <div className={styles.graph}>
                     <BoxPlot width={800} height={500} data={df_hourly} />
                  </div>
                  <div className={styles.details}>
                     <h1 className={styles.graph_title}>Hourly box plot</h1>
                  </div>
               </div> */}
               {/* <div className={styles.section}>
                  <Example width={800} height={500} data={df_heatmap} />
                  <div className={styles.details}>
                     <h1 className={styles.graph_title}>Heatmap</h1>
                  </div>
               </div> */}
               {/* <div className={styles.section}>
                  <Wordcloud width={800} height={500} data={df_words} />
                  <div className={styles.details}>
                     <h1 className={styles.graph_title}>Word cloud</h1>
                  </div>
               </div> */}
            </>
         ) : null}
      </Layout>
   );
};

export default Home;
