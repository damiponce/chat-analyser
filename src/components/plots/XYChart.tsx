import {
   AnimatedAxis, // any of these can be non-animated equivalents
   AnimatedGrid,
   AnimatedLineSeries,
   AnimatedAreaSeries,
   XYChart,
   Tooltip,
} from '@visx/xychart';
import {Timeline} from './types';
import React from 'react';
import {Group} from '@visx/group';
import {AreaClosed} from '@visx/shape';
import {AxisLeft, AxisBottom, AxisScale} from '@visx/axis';
import {LinearGradient} from '@visx/gradient';
import {curveLinear, curveMonotoneX} from '@visx/curve';
import {CurveFactory} from 'd3-shape';

const render = ({
   data,
   enabled,
   gradientColor,
   width,
   margin,
   top,
   left,
   children,
   curve = curveMonotoneX,
}: {
   data: Timeline[][];
   enabled: boolean[];
   gradientColor: string;
   width: number;
   margin: {top: number; right: number; bottom: number; left: number};
   top?: number;
   left?: number;
   children?: React.ReactNode;
   curve?: CurveFactory;
}) => {
   // accessors
   const getDate = (d: Timeline) => new Date(d.date);
   const getStockValue = (d: Timeline) => d.qty;

   const accessors = {
      xAccessor: (d: Timeline) => getDate(d) || 0,
      yAccessor: (d: Timeline) => getStockValue(d) || 0,
   };

   if (width < 10) return null;
   return (
      // <div
      //    style={{
      //       left: left || margin.left,
      //       top: top || margin.top,
      //       flexGrow: 1,
      //    }}>
      <>
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
                  <AnimatedAreaSeries
                     dataKey={index.toString()}
                     {...accessors}
                     data={value}
                     stroke={gradientColor}
                     fill="url(#gradient)"
                     curve={curve}
                  />
               ) : null;
            })}
         {children}
      </>
   );
};

export default render;
