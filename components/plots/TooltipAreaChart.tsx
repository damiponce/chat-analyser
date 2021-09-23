import React, {useMemo, useCallback} from 'react';
import {AreaClosed, Line, Bar} from '@visx/shape';
import {curveMonotoneX, curveStep} from '@visx/curve';
import {GridRows, GridColumns} from '@visx/grid';
import {Group} from '@visx/group';
import {scaleTime, scaleLinear} from '@visx/scale';
import {
   withTooltip,
   Tooltip,
   TooltipWithBounds,
   defaultStyles,
} from '@visx/tooltip';
import {WithTooltipProvidedProps} from '@visx/tooltip/lib/enhancers/withTooltip';
import {localPoint} from '@visx/event';
import {LinearGradient} from '@visx/gradient';
import {AxisLeft, AxisBottom, AxisScale} from '@visx/axis';
//@ts-ignore
import {max, extent, bisector} from 'd3-array';
import {timeFormat} from 'd3-time-format';
import {Timeline} from './types';

type TooltipData = Timeline;

export type AreaProps = {
   width: number;
   height: number;
   margin?: {top: number; right: number; bottom: number; left: number};
   data: Timeline[];
   xScale: AxisScale<number>;
   yScale: AxisScale<number>;
   yMax: number;
   hideBottomAxis?: boolean;
   hideLeftAxis?: boolean;
   top?: number;
   left?: number;
   children?: React.ReactNode;
   gradientColor: string;
};

export default withTooltip<AreaProps, TooltipData>(
   ({
      data,
      xScale,
      yScale,
      yMax,
      width,
      height,
      gradientColor,
      margin = {top: 0, right: 0, bottom: 0, left: 0},
      showTooltip,
      hideTooltip,
      tooltipData,
      tooltipTop = 0,
      tooltipLeft = 0,
      hideBottomAxis,
      hideLeftAxis,
      top,
      left,
      children,
   }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
      if (width < 10) return null;

      const stock = data;
      const background = '#3b6978';
      const background2 = '#204051';
      const accentColor = '#edffea';
      const accentColorDark = '#75daad';
      const tooltipStyles = {
         ...defaultStyles,
         background,
         border: '1px solid white',
         color: 'white',
         width: 40,
         height: 40,
      };
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

      const xMax = Math.max(width - margin.left - margin.right, 0);
      // util
      const formatDate = timeFormat("%b %d, '%y");

      // accessors
      const getDate = (d: Timeline) => new Date(d.date);
      const getStockValue = (d: Timeline) => d.qty;
      const bisectDate = bisector<Timeline, Date>(
         (d: Timeline) => new Date(d.date),
      ).left;

      // bounds
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // scales
      const dateScale = useMemo(
         () =>
            scaleTime<number>({
               range: [0, xMax],
               domain: extent(data, getDate) as [Date, Date],
            }),
         [xMax, data],
      );
      const stockValueScale = useMemo(
         () =>
            scaleLinear<number>({
               range: [yMax, 0],
               domain: [0, max(data, getStockValue) || 0],
               nice: true,
            }),
         [yMax, data],
      );

      // tooltip handler
      const offset = left || margin.left;
      const handleTooltip = useCallback(
         (
            event:
               | React.TouchEvent<SVGRectElement>
               | React.MouseEvent<SVGRectElement>,
         ) => {
            const {x} = localPoint(event) || {x: 0};
            const x0 = dateScale.invert(x - offset);
            const index = bisectDate(stock, x0, 1);
            const d0 = stock[index - 1];
            const d1 = stock[index];
            let d = d0;
            if (d1 && getDate(d1)) {
               d =
                  x0.valueOf() - getDate(d0).valueOf() >
                  getDate(d1).valueOf() - x0.valueOf()
                     ? d1
                     : d0;
            }
            showTooltip({
               tooltipData: d,
               tooltipLeft: x,
               tooltipTop: stockValueScale(getStockValue(d)),
            });
         },
         [showTooltip, stockValueScale, dateScale],
      );

      return (
         <>
            <svg width={width} height={height}>
               <Group left={left || margin.left} top={top || margin.top}>
                  <LinearGradient
                     id="area-background-gradient"
                     from={background}
                     to={background2}
                  />
                  <LinearGradient
                     id="area-gradient"
                     from={accentColor}
                     to={accentColor}
                     toOpacity={0.1}
                  />
                  <LinearGradient
                     id="gradient"
                     from={gradientColor}
                     fromOpacity={0.3}
                     to={gradientColor}
                     toOpacity={0.0}
                  />
                  <AreaClosed<Timeline>
                     data={stock}
                     x={d => dateScale(getDate(d)) || 0}
                     y={d => stockValueScale(getStockValue(d)) || 0}
                     yScale={stockValueScale}
                     strokeWidth={1}
                     stroke={gradientColor}
                     fill="url(#gradient)"
                     curve={curveMonotoneX}
                  />
                  <Bar
                     x={0}
                     y={0}
                     width={width}
                     height={height}
                     fill="transparent"
                     rx={14}
                     onTouchStart={handleTooltip}
                     onTouchMove={handleTooltip}
                     onMouseMove={handleTooltip}
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
                           from={{x: tooltipLeft - offset, y: margin.top}}
                           to={{
                              x: tooltipLeft - offset,
                              y: innerHeight + margin.top,
                           }}
                           stroke={gradientColor}
                           strokeWidth={2}
                           pointerEvents="none"
                           strokeDasharray="5,2"
                        />
                        <circle
                           cx={tooltipLeft - offset}
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
                           cx={tooltipLeft - offset}
                           cy={tooltipTop}
                           r={4}
                           fill={gradientColor}
                           stroke="white"
                           strokeWidth={2}
                           pointerEvents="none"
                        />
                     </g>
                  )}
               </Group>
               {tooltipData && (
                  <>
                     <TooltipWithBounds
                        key={Math.random()}
                        top={tooltipTop - 12}
                        left={tooltipLeft + 12}
                        style={tooltipStyles}>
                        {'HOLA'}
                        {/* {`$${getStockValue(tooltipData)}`} */}
                     </TooltipWithBounds>
                     <Tooltip
                        top={innerHeight + margin.top - 14}
                        left={tooltipLeft}
                        style={{
                           ...defaultStyles,
                           minWidth: 72,
                           textAlign: 'center',
                           transform: 'translateX(-50%)',
                        }}>
                        {formatDate(getDate(tooltipData))}
                     </Tooltip>
                  </>
               )}
            </svg>
         </>
      );
   },
   {style: {}},
   function renderContainer(children, props) {
      return <>{children}</>;
   },
);
