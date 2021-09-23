import React, {useCallback} from 'react';
import {Group} from '@visx/group';
import {AreaClosed, Line, Bar} from '@visx/shape';
import {AxisLeft, AxisBottom, AxisScale} from '@visx/axis';
import {LinearGradient} from '@visx/gradient';
import {curveLinear, curveMonotoneX} from '@visx/curve';
import {AppleStock} from '@visx/mock-data/lib/mocks/appleStock';
import {
   useTooltip,
   useTooltipInPortal,
   TooltipWithBounds,
   Tooltip,
} from '@visx/tooltip';
import {localPoint} from '@visx/event';
//@ts-ignore
import {max, extent, bisector} from 'd3-array';
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
   data: Timeline[];
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
   const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      showTooltip,
      hideTooltip,
   } = useTooltip();

   // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
   // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
   const {containerRef, TooltipInPortal} = useTooltipInPortal({
      // use TooltipWithBounds
      detectBounds: true,
      // when tooltip containers are scrolled, this will correctly update the Tooltip position
      scroll: true,
   });

   // const handleMouseOver = (event: MouseEvent, datum: Timeline[]) => {
   //    const coords = localPoint(event);
   //    showTooltip({
   //       tooltipLeft: coords.x,
   //       tooltipTop: coords.y,
   //       tooltipData: 'HOLA',
   //    });
   // };

   const bisectDate = bisector<Timeline, Date>(
      (d: Timeline) => new Date(d.date),
   ).left;

   // tooltip handler
   const handleTooltip = useCallback(
      (
         event:
            | React.TouchEvent<SVGRectElement>
            | React.MouseEvent<SVGRectElement>,
      ) => {
         debugger;
         const {x} = localPoint(event) || {x: 0};
         const x0 = xScale(getDate(data[0]));
         const index = bisectDate(data, x0, 1);
         const d0 = data[index - 1];
         const d1 = data[index];
         let d = d0;
         if (d1 && getDate(d1)) {
            d =
               x0.valueOf() - getDate(d0).valueOf() >
               getDate(d1).valueOf() - x0.valueOf()
                  ? d1
                  : d0;
         }
         showTooltip({
            tooltipData: d.qty,
            tooltipLeft: x,
            tooltipTop: yScale(getStockValue(d)),
         });
      },
      [showTooltip, yScale, xScale],
   );

   if (width < 10) return null;
   return (
      <Group
         left={left || margin.left}
         top={top || margin.top}
         ref={containerRef}>
         <LinearGradient
            id="gradient"
            from={gradientColor}
            fromOpacity={0.15}
            to={gradientColor}
            toOpacity={0.0}
         />
         <AreaClosed<Timeline>
            data={data}
            x={d => xScale(getDate(d)) || 0}
            y={d => yScale(getStockValue(d)) || 0}
            yScale={yScale}
            strokeWidth={1}
            stroke={gradientColor}
            fill="url(#gradient)"
            curve={curveMonotoneX}
            // onMouseOver={event => handleMouseOver(event, data)}
            // onMouseOut={hideTooltip}
         />
         <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={() => handleTooltip}
            onTouchMove={() => handleTooltip}
            onMouseMove={() => handleTooltip}
            onMouseLeave={() => hideTooltip()}
         />
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

         {tooltipData && (
            <g>
               <Line
                  from={{x: tooltipLeft, y: margin.top}}
                  to={{x: tooltipLeft, y: innerHeight + margin.top}}
                  stroke={gradientColor}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
               />
               <circle
                  cx={tooltipLeft}
                  cy={tooltipTop + 1}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
               />
               <circle
                  cx={tooltipLeft}
                  cy={tooltipTop}
                  r={4}
                  fill={gradientColor}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
               />
            </g>
         )}

         {tooltipData && (
            <div>
               <TooltipWithBounds
                  key={Math.random()}
                  top={tooltipTop - 12}
                  left={tooltipLeft + 12}>
                  {/* {`$${getStockValue(tooltipData)}`} */}
               </TooltipWithBounds>
               <Tooltip
                  top={innerHeight + margin.top - 14}
                  left={tooltipLeft}
                  style={{
                     minWidth: 72,
                     textAlign: 'center',
                     transform: 'translateX(-50%)',
                  }}>
                  {/* {formatDate(getDate(tooltipData))} */}
               </Tooltip>
            </div>
         )}

         {/* {tooltipData && (
            <TooltipInPortal
               // set this to random so it correctly updates with parent bounds
               key={Math.random()}
               top={tooltipTop}
               left={tooltipLeft}>
               Data value <strong>{tooltipData}</strong>
            </TooltipInPortal>
         )} */}
         {children}
      </Group>
   );
}
