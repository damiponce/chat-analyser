import {DataFrame} from 'danfojs/types/core/frame';

export function parseTextToDataFrame(text: string) {
   const dfd: any =
      typeof global !== 'undefined' ? require('danfojs/src/index') : null;
   var arr = text.split('\n');
   let datetimeIndex: Date[] = [];
   let userArray: string[] = [];
   let msgArray: string[] = [];

   console.log('Messages: ' + arr.length);

   for (var j = 0; j < arr.length; j++) {
      let dateRaw: string = '';
      let dateArr: any[] = []; // THIS SHOULD BE number[]
      let timeRaw: string = '';
      let timeArr: any[] = []; // THIS SHOULD BE number[]
      let userRaw: string = '';
      let msgRaw: string = '';
      let m: number = 999999;
      let i = 0;
      let valid = true;

      if (arr[j].length < 19) valid = false;
      let test = new RegExp(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/gm);
      let test2 = new RegExp(/\d{2}[\:]\d{2}/gm);

      for (const c of arr[j]) {
         if (i < 10) dateRaw += c;
         if (i === 10) {
            if (test.test(arr[j])) {
               dateArr = dateRaw.split('/');
            } else {
               valid = false;
            }
            if (!valid) continue;
         }
         if (i > 11 && i < 17) timeRaw += c;
         if (i === 18) {
            if (test2.test(arr[j])) {
               timeArr = timeRaw.split(':');
            } else {
               valid = false;
            }
         }
         if (i > 19 && i < m) {
            c === ':' ? (m = i + 1) : (userRaw += c);
         }
         if (i > m) {
            if (c !== '\n') msgRaw += c;
         }
         i++;
      }
      if (valid === false || arr[j].substring(18).indexOf(':') < 0) continue;

      let datetime = new Date(
         dateArr[2],
         dateArr[1],
         dateArr[0],
         timeArr[0],
         timeArr[1],
      );
      let datetimeStr =
         dateArr[2] + dateArr[1] + dateArr[0] + timeArr[0] + timeArr[1];
      // console.log(datetime);
      // console.log(userRaw);
      // console.log(msgRaw);
      // console.log(' ');

      datetimeIndex.push(datetimeStr);
      userArray.push(userRaw);
      msgArray.push(msgRaw);
   }

   // new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)

   //  const df_ = new dfd.DataFrame(
   //      { pig: [20, 18, 489, 675, 1776], horse: [4, 25, 281, 600, 1900] },
   //      { index: [1990, 1997, 2003, 2009, 2014] },
   //  );

   const df: DataFrame = new dfd.DataFrame(
      {user: userArray, msg: msgArray},
      {index: datetimeIndex},
   );

   return [datetimeIndex, userArray, msgArray];

   // return df;
}

async function dfToArray(df: DataFrame) {
   return await df.to_json().then(json => {
      let tempArr = [];
      let i = 0;
      for (var x of JSON.parse(json.toString())) {
         x.index = df.index[i];
         tempArr.push(x);
         i++;
      }
      // console.log(tempArr);
      return tempArr;
   });
}

export function resample(df: DataFrame) {
   // .catch(err => {
   //    console.log(err);
   // });

   return;
}
