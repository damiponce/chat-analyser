import React, {useEffect, useMemo} from 'react';
import {HeatmapRect} from '@visx/heatmap';
import {BoxPlot} from '@visx/stats';
import {Bar} from '@visx/shape';
import {Group} from '@visx/group';
import {scaleBand, scaleLinear, scaleOrdinal} from '@visx/scale';
import {AxisLeft, AxisBottom} from '@visx/axis';
import {GridRows} from '@visx/grid';
import {
   HourlyBox,
   DailyBox,
   HeatmapBin,
   HeatmapDelayBin,
} from '../../types/dataTypes';
import {
   withTooltip,
   Tooltip,
   defaultStyles as defaultTooltipStyles,
} from '@visx/tooltip';
import {WithTooltipProvidedProps} from '@visx/tooltip/lib/enhancers/withTooltip';

import {
   interpolateInferno,
   interpolateTurbo,
   interpolateGreys,
} from 'd3-scale-chromatic';
import {
   scaleLog,
   scalePow,
   scaleSequential,
   scaleSequentialLog,
   scaleSequentialPow,
   scaleSequentialSqrt,
} from 'd3-scale';

import {Direction, Range} from 'react-range';

export type HeatmapProps = {
   width: number;
   height: number;
   data: HeatmapBin[];
   labels: {x: string; y: string};
   events?: boolean;
   margin?: {left: number; top: number; right: number; bottom: number};
};

interface TooltipData {
   name?: string;
   min?: number;
   median?: number;
   max?: number;
   firstQuartile?: number;
   thirdQuartile?: number;
   outlier?: number;
}

export default withTooltip<HeatmapProps, TooltipData>(
   ({
      width,
      height,
      data,
      events = false,
      margin = {left: 45, top: 5, right: 20, bottom: 60},
      labels,
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip,
   }: HeatmapProps & WithTooltipProvidedProps<TooltipData>) => {
      // colors
      const color = '#337cff';

      const hot1 = '#77312f';
      const hot2 = '#f33d15';
      const cool1 = '#122549';
      const cool2 = '#b4fbde';
      const background = '#28272c';

      function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
         return Math.max(...data.map(value));
      }

      function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
         return Math.min(...data.map(value));
      }

      // accessors
      const bins = (d: HeatmapBin) => d.bins;
      const count = (d: HeatmapDelayBin) => d.count;

      const colorMax = max(data, d => max(bins(d), count));
      const bucketSizeMax = max(data, d => bins(d).length);

      // scales
      const xScale = scaleLinear<number>({
         domain: [0, data.length],
      });
      const yScale = scaleLinear<number>({
         domain: [0, bucketSizeMax],
      });
      const circleColorScale = scaleLinear<string>({
         range: [hot1, hot2],
         domain: [0, colorMax],
      });
      const rectColorScale = scaleLinear<string>({
         range: [cool1, cool2],
         domain: [0, colorMax],
      });

      // bounds
      const xMax = width - margin.left - margin.right;
      const yMax = height - margin.bottom;

      const binWidth = xMax / data.length;
      const binHeight = yMax / bucketSizeMax;

      xScale.range([0, xMax]);
      yScale.range([0, yMax]);
      // debugger;

      // Legend({
      //    color: colorScale,
      //    title: 'Temperature (°F)',
      //    tickFormat: (d: number) => d.toFixed(0),
      //    tickValues: [],
      // });

      const [expSlider, setExpSlider] = React.useState(0.4);

      const expScale = scalePow().exponent(expSlider).domain([0, 1]);

      const colorScale = scaleSequential<string>()
         .domain([0, colorMax])
         .interpolator(d => interpolateInferno(expScale(d)));
      return width < 10 ? null : (
         <div style={{position: 'relative'}}>
            <svg width={width} height={height}>
               {/* <rect x={0} y={0} width={width} height={height} fill={'#0000'} /> */}
               <Group left={45} top={margin.top}>
                  <Group>
                     <HeatmapRect
                        data={data}
                        xScale={d => xScale(d) ?? 0}
                        yScale={d => yScale(d) ?? 0}
                        colorScale={colorScale}
                        // opacityScale={opacityScale}
                        binWidth={binWidth}
                        binHeight={binHeight}
                        gap={2}>
                        {heatmap =>
                           heatmap.map(heatmapBins =>
                              heatmapBins.map(bin => (
                                 <rect
                                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                                    className="visx-heatmap-rect"
                                    width={bin.width}
                                    height={bin.height}
                                    x={bin.x}
                                    y={bin.y}
                                    fill={bin.color}
                                    // fillOpacity={bin.opacity}
                                    onClick={() => {
                                       if (!events) return;
                                       const {row, column} = bin;
                                       alert(
                                          JSON.stringify({
                                             row,
                                             column,
                                             bin: bin.bin,
                                          }),
                                       );
                                    }}
                                 />
                              )),
                           )
                        }
                     </HeatmapRect>
                  </Group>
                  {/* <GridRows
                     scale={yScale}
                     width={xMax}
                     height={yMax}
                     stroke={color + '44'}
                     strokeDasharray="2 2"
                  />*/}
                  <text
                     x={0}
                     y={0}
                     transform={`translate(${-35}, ${yMax / 2}) rotate(-90)`}
                     fill={color}
                     // transform="rotate(-90)"
                     fontSize={13}
                     textAnchor="middle">
                     {labels.y}
                  </text>
                  <AxisLeft
                     scale={yScale}
                     stroke={color}
                     tickStroke={color}
                     hideAxisLine
                     hideTicks
                     numTicks={bucketSizeMax}
                     // @ts-ignore
                     tickFormat={(d: number) =>
                        [null, 180, 120, 60, 30, 10, 5, 2, 1, 0][d]
                     }
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
                     hideAxisLine
                     tickStroke={color}
                     left={binWidth / 2}
                     // @ts-ignore
                     tickFormat={d => (d < 24 ? d : null)}
                     tickValues={
                        xMax > 750
                           ? [
                                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                             ]
                           : [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
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
            <div className="heatmap-slider">
               <Range
                  step={0.0001}
                  min={0.1}
                  max={1}
                  values={[expSlider]}
                  onChange={values => setExpSlider(values[0])}
                  direction={Direction.Up}
                  renderTrack={({props, children}) => (
                     <div
                        {...props}
                        style={{
                           ...props.style,
                           width: '6px',
                           borderRadius: '3px',
                           height: '200px',
                           backgroundColor: '#888',
                        }}>
                        {children}
                     </div>
                  )}
                  renderThumb={({props}) => (
                     <div
                        {...props}
                        style={{
                           ...props.style,
                           height: '24px',
                           width: '24px',
                           aspectRatio: '1',
                           borderRadius: '50%',
                           backgroundColor: '#337cff',
                        }}
                     />
                  )}
               />
            </div>
            {/* {tooltipOpen && tooltipData && (
               <Tooltip
                  top={tooltipTop}
                  left={tooltipLeft}
                  style={{
                     ...defaultTooltipStyles,
                     backgroundColor: '#283238',
                     color: 'white',
                  }}>
                  <div>
                     <strong>{tooltipData.name}</strong>
                  </div>
                  <div style={{marginTop: '5px', fontSize: '12px'}}>
                     {tooltipData.max && (
                        <div>Upper whisker: {tooltipData.max}</div>
                     )}
                     {tooltipData.thirdQuartile && (
                        <div>Third quartile: {tooltipData.thirdQuartile}</div>
                     )}
                     {tooltipData.median && (
                        <div>Median: {tooltipData.median}</div>
                     )}
                     {tooltipData.firstQuartile && (
                        <div>First quartile: {tooltipData.firstQuartile}</div>
                     )}
                     {tooltipData.min && (
                        <div>Lower whisker: {tooltipData.min}</div>
                     )}
                     {tooltipData.outlier && (
                        <div>Outlier: {tooltipData.outlier}</div>
                     )}
                  </div>
               </Tooltip>
            )} */}
         </div>
      );
   },
);
