import React, {useMemo} from 'react';
import {Bar} from '@visx/shape';
import {Group} from '@visx/group';
import {GradientTealBlue} from '@visx/gradient';
import {scaleBand, scaleLinear} from '@visx/scale';
import {AxisLeft, AxisBottom, Axis} from '@visx/axis';

const verticalMargin = 60;

export type BarsProps = {
   width: number;
   height: number;
   data: {}[];
   events?: boolean;
};

export default function BarGraph({
   width,
   height,
   data,
   events = false,
}: BarsProps) {
   // accessors
   const getX = (d: any) => d.hour;
   const getY = (d: any) => d.mean;

   // bounds
   const xMax = width;
   const yMax = height - verticalMargin;

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

   return width < 10 ? null : (
      <svg width={width} height={height}>
         {/* <GradientTealBlue id="teal" /> */}
         <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#teal)"
            rx={14}
         />
         <Group top={verticalMargin / 2}>
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
                     height={barHeight}
                     fill="#337cff"
                     onClick={() => {
                        if (events)
                           alert(
                              `clicked: ${JSON.stringify(Object.values(d))}`,
                           );
                     }}
                  />
               );
            })}
         </Group>
         <AxisLeft
            scale={yScale}
            stroke={'#fff'}
            tickStroke={'#fff'}
            // tickFormat={formatDate}
            hideAxisLine
            tickLabelProps={() => ({
               fontSize: 11,
               textAnchor: 'end',
               dy: '0.33em',
            })}
         />
         <AxisBottom
            top={yMax}
            scale={xScale}
            numTicks={width > 520 ? 10 : 5}
         />
      </svg>
   );
}
