import React from 'react';
import {Group} from '@visx/group';
import {BarGroup, BarStack} from '@visx/shape';
import {AxisBottom} from '@visx/axis';
import cityTemperature, {
   CityTemperature,
} from '@visx/mock-data/lib/mocks/cityTemperature';
import {scaleBand, scaleLinear, scaleOrdinal} from '@visx/scale';
import {timeParse, timeFormat} from 'd3-time-format';
import {PatternLines} from '@visx/pattern';

import {BarStats} from './types';

export type BarGroupProps = {
   width: number;
   height: number;
   margin?: {top: number; right: number; bottom: number; left: number};
   events?: boolean;
   data: BarStats[];
   colours: string[];
};

const defaultMargin = {top: 40, right: 0, bottom: 40, left: 0};

export default function Example({
   width,
   height,
   events = true,
   margin = defaultMargin,
   data,
   colours,
}: BarGroupProps) {
   type CityName = 'New York' | 'San Francisco' | 'Austin';

   const blue = '#aeeef8';
   const green = '#e5fd3d';
   const purple = '#9caff6';
   const background = '#612efb';

   // const data = cityTemperature.slice(0, 8);
   const keys = Object.keys(data[0]).filter(d => d !== 'label');

   const parseDate = timeParse('%Y-%m-%d');
   const format = timeFormat('%b %d');
   const formatDate = (label: string) => label;

   // accessors
   const getDate = (d: BarStats) => d.label;

   // scales
   const dateScale = scaleBand<string>({
      domain: data.map(d => d.label),
      padding: 0.2,
      paddingOuter: 0.3,
   });
   const cityScale = scaleBand<string>({
      domain: keys,
      padding: 0.1,
   });

   let data_parsed: any[] = [];
   for (let day of data) {
      var temp_day: BarStats = {label: ''};
      for (let user in day) {
         //@ts-ignore
         temp_day[user] = user === 'label' ? day[user] : day[user]['mean'];
      }
      data_parsed.push(temp_day);
   }

   const temperatureTotals = data_parsed.reduce((allTotals, currentDate) => {
      const totalTemperature = keys.reduce((dailyTotal, k) => {
         dailyTotal += Number(currentDate[k]);
         return dailyTotal;
      }, 0);
      allTotals.push(totalTemperature);
      return allTotals;
   }, [] as number[]);

   const tempScale = scaleLinear<number>({
      domain: [
         0,
         Math.max(
            ...temperatureTotals,
            // ...data.map(d =>
            //    Math.max(...keys.map(key => Number(d[key]['mean']))),
            // ),
         ),
      ],
   });
   const colorScale = scaleOrdinal<string, string>({
      domain: keys,
      range: [blue, green, purple],
   });

   // bounds
   const xMax = width - margin.left - margin.right;
   const yMax = height - margin.top - margin.bottom;

   // update scale output dimensions
   dateScale.rangeRound([0, xMax]);
   cityScale.rangeRound([0, dateScale.bandwidth()]);
   tempScale.range([yMax, 0]);

   const borderWidth = 3;

   return width < 10 ? null : (
      <div id="chart_main">
         <svg width={width} height={height}>
            <rect
               x={borderWidth / 2}
               y={borderWidth / 2}
               width={width - borderWidth}
               height={height - borderWidth}
               fill="#0000"
               stroke="#0000" //"#0070f350"
               strokeWidth={borderWidth}
               strokeLinejoin="round"
               strokeLinecap="round"
               strokeDasharray="10 10"
               rx={14}
            />
            <Group top={margin.top} left={margin.left}>
               <BarStack
                  data={data_parsed}
                  keys={keys}
                  x={getDate}
                  xScale={dateScale}
                  yScale={tempScale}
                  color={colorScale}>
                  {barStacks =>
                     barStacks.map(barStack =>
                        barStack.bars.map(bar => (
                           <>
                              <rect
                                 key={`bar-stack-${barStack.index}-${bar.index}`}
                                 x={bar.x}
                                 y={bar.y}
                                 height={bar.height}
                                 width={bar.width}
                                 fill={colours[barStack.index]}
                                 onClick={() => {
                                    if (!events) return;
                                    console.log('==>>>>=====================');
                                    console.log(data_parsed);
                                    console.log(barStacks);
                                    console.log(barStack);
                                    console.log(bar);
                                    console.log('==>>>>===================== ');
                                    alert(JSON.stringify(bar));
                                 }}>
                                 {/* <PatternLines
                                 id="lines"
                                 height={5}
                                 width={5}
                                 stroke={'black'}
                                 strokeWidth={1}
                                 orientation={['diagonal']}
                              /> */}
                              </rect>
                           </>
                        )),
                     )
                  }
               </BarStack>
               {/* <BarGroup
                  data={data}
                  keys={keys}
                  height={yMax}
                  x0={getDate}
                  x0Scale={dateScale}
                  x1Scale={cityScale}
                  yScale={tempScale}
                  color={colorScale}>
                  {barGroups =>
                     barGroups.map(barGroup => (
                        <Group
                           key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                           left={barGroup.x0}>
                           {barGroup.bars.map(bar => (
                              <rect
                                 key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                                 x={bar.x}
                                 y={tempScale(bar.value['mean'])}
                                 width={bar.width}
                                 height={
                                    bar.height -
                                    (tempScale(bar.value['mean']) || 0)
                                 }
                                 fill={colours[bar.index]}
                                 rx={4}
                                 onClick={() => {
                                    if (!events) return;
                                    console.log('==>>>>=====================');
                                    console.log(barGroups);
                                    console.log('==>>>>===================== ');
                                    const {key, value} = bar;
                                    alert(JSON.stringify({key, value}));
                                 }}
                              />
                           ))}
                        </Group>
                     ))
                  }
               </BarGroup> */}
            </Group>
            <AxisBottom
               top={yMax + margin.top}
               tickFormat={formatDate}
               scale={dateScale}
               stroke={'#0070f3'}
               tickStroke={'#0070f3'}
               hideAxisLine
               tickLabelProps={() => ({
                  fill: '#0070f3',
                  fontSize: 11,
                  textAnchor: 'middle',
               })}
               numTicks={24}
            />
         </svg>
      </div>
   );
}
