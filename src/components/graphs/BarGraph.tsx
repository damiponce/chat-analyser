import React, {useMemo} from 'react';
import {Bar} from '@visx/shape';
import {Group} from '@visx/group';
import {GradientTealBlue} from '@visx/gradient';
import {scaleBand, scaleLinear} from '@visx/scale';
import {AxisLeft, AxisBottom} from '@visx/axis';
import {GridRows} from '@visx/grid';
import {HourlyBar, DailyBar} from '../../pages/types/dataTypes';

export type BarsProps = {
   width: number;
   height: number;
   data: HourlyBar[] | DailyBar[];
   labels: {x: string; y: string};
   events?: boolean;
   margin?: {left: number; top: number; right: number; bottom: number};
};

export default function BarGraph({
   width,
   height,
   data,
   events = false,
   margin = {left: 45, top: 5, right: 20, bottom: 60},
   labels,
}: BarsProps) {
   // accessors
   const getX = (d: HourlyBar | DailyBar) => {
      let hourly = d as HourlyBar;
      let daily = d as DailyBar;
      return hourly.hour || daily.day;
   };
   const getY = (d: HourlyBar | DailyBar): number => d.mean;
   // FIX TYPE HERE !!!!!!!!!

   // bounds
   const xMax = width - margin.left - margin.right;
   const yMax = height - margin.bottom;

   // scales, memoize for performance
   const xScale = useMemo(
      () =>
         scaleBand<string>({
            range: [0, xMax],
            round: true,
            domain: data.map(getX),
            padding: 0.4,
         }),
      [xMax],
   );
   const yScale = useMemo(
      () =>
         scaleLinear<number>({
            range: [yMax, 0],
            round: true,
            domain: [0, Math.max(...data.map(getY))],
         }),
      [yMax],
   );

   // colors
   const color = '#337cff';

   return width < 10 ? null : (
      <svg width={width} height={height}>
         {/* <rect x={0} y={0} width={width} height={height} fill={'#0000'} /> */}
         <Group left={45} top={margin.top}>
            <Group>
               {data.map(d => {
                  const letter = getX(d);
                  const barWidth = xScale.bandwidth();
                  const barHeight = yMax - (yScale(getY(d)) ?? 0);
                  const barX = xScale(letter);
                  const barY = yMax - barHeight;
                  return (
                     <Bar
                        key={`bar-${letter}`}
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight + barWidth / 4}
                        rx={barWidth / 4}
                        fill={color}
                        onClick={() => {
                           if (events)
                              alert(
                                 `clicked: ${JSON.stringify(Object.values(d))}`,
                              );
                        }}
                        clipPath={`inset(0 0 ${barWidth / 4} 0)`}
                     />
                  );
               })}
            </Group>
            <GridRows
               scale={yScale}
               width={xMax}
               height={yMax}
               stroke={color + '44'}
               strokeDasharray="2 2"
            />
            {/* <text
               x={0}
               y={0}
               transform={`translate(${-35}, ${yMax / 2}) rotate(-90)`}
               fill={color}
               // transform="rotate(-90)"
               fontSize={13}
               textAnchor="middle">
               {labels.y}
            </text> */}
            <AxisLeft
               scale={yScale}
               stroke={color}
               tickStroke={color}
               hideAxisLine
               hideTicks
               tickLabelProps={() => ({
                  fontSize: 11,
                  textAnchor: 'end',
                  dy: '0.33em',
                  fill: color,
               })}
            />
            <AxisBottom
               top={yMax}
               scale={xScale}
               // numTicks={width > 520 ? 10 : 5}
               stroke={color}
               tickStroke={color}
               hideAxisLine
               tickFormat={label =>
                  data.map(getX).length === 7
                     ? xMax > 650
                        ? label
                        : String(label).charAt(0)
                     : parseInt(label) < 24
                     ? label
                     : null
               }
               hideZero
               tickValues={
                  data.map(getX).length === 24
                     ? xMax > 750
                        ? [
                             '0',
                             '1',
                             '2',
                             '3',
                             '4',
                             '5',
                             '6',
                             '7',
                             '8',
                             '9',
                             '10',
                             '11',
                             '12',
                             '13',
                             '14',
                             '15',
                             '16',
                             '17',
                             '18',
                             '19',
                             '20',
                             '21',
                             '22',
                             '23',
                          ]
                        : [
                             '0',
                             '2',
                             '4',
                             '6',
                             '8',
                             '10',
                             '12',
                             '14',
                             '16',
                             '18',
                             '20',
                             '22',
                          ]
                     : null
               }
               tickLabelProps={() => ({
                  fontSize: 11,
                  textAnchor: 'middle',
                  dy: '0.33em',
                  fill: color,
               })}
            />
         </Group>
      </svg>
   );
}
