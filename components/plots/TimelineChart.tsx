import React, {useRef, useState, useMemo, useEffect} from 'react';
import {scaleTime, scaleLinear} from '@visx/scale';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import {Brush} from '@visx/brush';
import {Bounds} from '@visx/brush/lib/types';
import BaseBrush, {
   BaseBrushState,
   UpdateBrush,
} from '@visx/brush/lib/BaseBrush';
import {ClipPath, CircleClipPath, RectClipPath} from '@visx/clip-path';
import {PatternLines} from '@visx/pattern';
import {LinearGradient} from '@visx/gradient';
// @ts-ignore
import {max, extent} from 'd3-array';

import AreaChart from './AreaChart';

import {Timeline} from './types';
import AreaStacked from './AreaStacked';
import XYChart from './XYChart';
import TooltipAreaChart from './TooltipAreaChart';

export const accentColor = '#0070f3';
export const background = '#535da6';
export const background2 = '#ececec';

export type BrushProps = {
   width: number;
   height: number;
   margin?: {top: number; right: number; bottom: number; left: number};
   compact?: boolean;
   data: Timeline[];
   enabled: boolean[];
};

function TimelineChart({
   compact = false,
   width,
   height,
   margin = {
      top: 20,
      left: 50,
      bottom: 20,
      right: 20,
   },
   data,
   enabled,
}: BrushProps) {
   // Initialize some variables
   const stock = data;
   const brushMargin = {top: 10, bottom: 15, left: 50, right: 20};
   const chartSeparation = 30;
   const PATTERN_ID = 'brush_pattern';
   const GRADIENT_ID = 'brush_gradient';
   const selectedBrushStyle = {
      fill: `url(#${PATTERN_ID})`,
      stroke: accentColor,
   };

   // accessors
   const getDate = (d: Timeline) => new Date(d.date);
   const getStockValue = (d: Timeline) => d.qty;

   const brushRef = useRef<BaseBrush | null>(null);
   const [filteredStock, setFilteredStock] = useState(stock);

   const onBrushChange = (domain: Bounds | null) => {
      if (!domain) return;
      const {x0, x1, y0, y1} = domain;
      const stockCopy = stock.filter(s => {
         const x = getDate(s).getTime();
         const y = getStockValue(s);
         return x > x0 && x < x1 && y > y0 && y < y1;
      });
      setFilteredStock(stockCopy);
   };

   const innerHeight = height - margin.top - margin.bottom;
   const topChartBottomMargin = compact
      ? chartSeparation / 2
      : chartSeparation + 10;
   const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
   const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

   // bounds
   const xMax = Math.max(width - margin.left - margin.right, 0);
   const yMax = Math.max(topChartHeight, 0);
   const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
   const yBrushMax = Math.max(
      bottomChartHeight - brushMargin.top - brushMargin.bottom,
      0,
   );

   // scales
   const dateScale = useMemo(
      () =>
         scaleTime<number>({
            range: [0, xMax],
            domain: extent(filteredStock, getDate) as [Date, Date],
            // domain: extent(filteredStock, getDate) as [Date, Date],
         }),
      [xMax, filteredStock],
   );
   const stockScale = useMemo(
      () =>
         scaleLinear<number>({
            range: [yMax, 0],
            domain: [0, max(filteredStock, getStockValue) || 0],
            nice: true,
         }),
      [yMax, filteredStock],
   );
   const brushDateScale = useMemo(
      () =>
         scaleTime<number>({
            range: [0, xBrushMax],
            domain: extent(stock, getDate) as [Date, Date],
            // domain: extent(stock, getDate) as [Date, Date],
         }),
      [xBrushMax],
   );
   const brushStockScale = useMemo(
      () =>
         scaleLinear({
            range: [yBrushMax, 0],
            domain: [0, max(stock, getStockValue) || 0],
            // domain: [0, max(stock, getStockValue) || 0],
            nice: true,
         }),
      [yBrushMax],
   );

   const initialBrushPosition = useMemo(
      () => ({
         start: {x: brushDateScale(getDate(stock[0]))},
         end: {x: brushDateScale(getDate(stock[0]))},
      }),
      [brushDateScale],
   );

   // event handlers
   const handleClearClick = () => {
      if (brushRef?.current) {
         setFilteredStock(stock);
         brushRef.current.reset();
      }
   };

   const handleResetClick = () => {
      if (brushRef?.current) {
         const updater: UpdateBrush = prevBrush => {
            const newExtent = brushRef.current!.getExtent(
               initialBrushPosition.start,
               initialBrushPosition.end,
            );

            const newState: BaseBrushState = {
               ...prevBrush,
               start: {y: newExtent.y0, x: newExtent.x0},
               end: {y: newExtent.y1, x: newExtent.x1},
               extent: newExtent,
            };

            return newState;
         };
         brushRef.current.updateBrush(updater);
      }
   };

   const borderWidth = 3;

   // useEffect(() => {
   //    brushRef.current?.updateBrush(function () {
   //       return {
   //          start: {
   //             x: 0,
   //             y: 0,
   //          },
   //          end: {
   //             x: 0,
   //             y: 0,
   //          },
   //          extent: {
   //             x0: -1,
   //             x1: -1,
   //             y0: -1,
   //             y1: -1,
   //          },
   //          bounds: {
   //             x0: 0,
   //             x1: width,
   //             y0: 0,
   //             y1: height,
   //          },
   //          isBrushing: false,
   //          brushPageOffset: undefined,
   //          activeHandle: null,
   //          brushingType: undefined,
   //       };
   //    });
   // }, [enabled]);

   return (
      <div id="chart_main">
         <svg width={width} height={height}>
            <LinearGradient
               id={GRADIENT_ID}
               from={background}
               to={background2}
               rotate={45}
            />
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
            <TooltipAreaChart
               hideBottomAxis={compact}
               data={filteredStock}
               width={width}
               height={topChartHeight + topChartBottomMargin}
               margin={{...margin, bottom: topChartBottomMargin}}
               yMax={yMax}
               xScale={dateScale}
               yScale={stockScale}
               gradientColor={'#0070f3'}
            />
            {/* <TooltipAreaChart
               hideBottomAxis={compact}
               data={filteredStock}
               width={width}
               height={height - topChartBottomMargin}
               margin={{...margin, bottom: topChartBottomMargin}}
               yMax={yMax}
               xScale={dateScale}
               yScale={stockScale}
               // gradientColor={'#0070f3'}
            /> */}
            {/* <XYChart
               data={filteredStock}
               enabled={enabled}
               xScale={dateScale}
               yScale={stockScale}
            /> */}
            <AreaChart
               hideBottomAxis
               hideLeftAxis
               data={stock}
               width={width}
               yMax={yBrushMax}
               xScale={brushDateScale}
               yScale={brushStockScale}
               margin={brushMargin}
               top={topChartHeight + topChartBottomMargin + margin.top}
               gradientColor={'#0070f388'}>
               <PatternLines
                  id={PATTERN_ID}
                  height={10}
                  width={10}
                  stroke={accentColor}
                  strokeWidth={1}
                  orientation={['diagonalRightToLeft']}
               />

               <Brush
                  xScale={brushDateScale}
                  yScale={brushStockScale}
                  width={xBrushMax}
                  height={yBrushMax}
                  margin={brushMargin}
                  handleSize={8}
                  innerRef={brushRef}
                  resizeTriggerAreas={['left', 'right']}
                  brushDirection="horizontal"
                  initialBrushPosition={initialBrushPosition}
                  onChange={onBrushChange}
                  onClick={() => setFilteredStock(stock)}
                  selectedBoxStyle={selectedBrushStyle}
                  useWindowMoveEvents></Brush>
            </AreaChart>
         </svg>
         {/* 
         <button onClick={handleClearClick}>Clear</button>&nbsp;
         <button onClick={handleResetClick}>Reset</button> 
         */}
      </div>
   );
}

export default TimelineChart;
