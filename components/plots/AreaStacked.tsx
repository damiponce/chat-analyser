import React from 'react';
import {Group} from '@visx/group';
import {AreaClosed} from '@visx/shape';
import {AxisLeft, AxisBottom, AxisScale} from '@visx/axis';
import {LinearGradient} from '@visx/gradient';
import {curveLinear, curveMonotoneX} from '@visx/curve';

import {Timeline} from './types';

// Initialize some variables
const axisColor = '#0070f3aa';
const axisBottomTickLabelProps = {
   textAnchor: 'middle' as const,
   fontFamily: 'Lexend',
   fontSize: 10,
   fill: axisColor.slice(0, -2),
};
const axisLeftTickLabelProps = {
   dx: '-0.25em',
   dy: '0.25em',
   fontFamily: 'Lexend',
   fontSize: 10,
   textAnchor: 'end' as const,
   fill: axisColor.slice(0, -2),
};

// accessors
const getDate = (d: Timeline) => new Date(d.date);
const getStockValue = (d: Timeline) => d.qty;

export default function AreaChart({
   data,
   enabled,
   gradientColor,
   width,
   yMax,
   margin,
   xScale,
   yScale,
   hideBottomAxis = false,
   hideLeftAxis = false,
   top,
   left,
   children,
}: {
   data: Timeline[][];
   enabled: boolean[];
   gradientColor: string;
   xScale: AxisScale<number>;
   yScale: AxisScale<number>;
   width: number;
   yMax: number;
   margin: {top: number; right: number; bottom: number; left: number};
   hideBottomAxis?: boolean;
   hideLeftAxis?: boolean;
   top?: number;
   left?: number;
   children?: React.ReactNode;
}) {
   if (width < 10) return null;
   return (
      <Group left={left || margin.left} top={top || margin.top}>
         <LinearGradient
            id="gradient"
            from={gradientColor}
            fromOpacity={0.15}
            to={gradientColor}
            toOpacity={0.0}
         />
         {data
            .slice(0)
            .reverse()
            .map((value, index, array) => {
               return enabled[index] ? (
                  <AreaClosed<Timeline>
                     data={value}
                     x={d => xScale(getDate(d)) || 0}
                     y={d => yScale(getStockValue(d)) || 0}
                     yScale={yScale}
                     strokeWidth={1}
                     stroke={gradientColor}
                     fill="url(#gradient)"
                     curve={curveMonotoneX}
                  />
               ) : null;
            })}
         {!hideBottomAxis && (
            <AxisBottom
               top={yMax}
               scale={xScale}
               numTicks={width > 520 ? 10 : 5}
               stroke={axisColor}
               tickStroke={axisColor}
               tickLabelProps={() => axisBottomTickLabelProps}
            />
         )}
         {!hideLeftAxis && (
            <AxisLeft
               scale={yScale}
               numTicks={5}
               stroke={axisColor}
               tickStroke={axisColor}
               tickLabelProps={() => axisLeftTickLabelProps}
            />
         )}
         {children}
      </Group>
   );
}
