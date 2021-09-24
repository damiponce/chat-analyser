import React from 'react';
import {Group} from '@visx/group';
import {ViolinPlot, BoxPlot} from '@visx/stats';
import {LinearGradient} from '@visx/gradient';
import {scaleBand, scaleLinear, scaleOrdinal} from '@visx/scale';
import {getSeededRandom, getRandomNormal} from '@visx/mock-data';
import {
   withTooltip,
   Tooltip,
   defaultStyles as defaultTooltipStyles,
} from '@visx/tooltip';
import {WithTooltipProvidedProps} from '@visx/tooltip/lib/enhancers/withTooltip';
import {PatternLines} from '@visx/pattern';
import {Stats} from './types';

import {BarGroup} from '@visx/shape';
import {AxisBottom} from '@visx/axis';
import cityTemperature, {
   CityTemperature,
} from '@visx/mock-data/lib/mocks/cityTemperature';
import {timeParse, timeFormat} from 'd3-time-format';

// seeded randomness
const seededRandom = getSeededRandom(0.1);
const randomNormal = getRandomNormal.source(getSeededRandom(0.789))(4, 3);
// const data: Stats[] = genStats(5, randomNormal, () => 10 * seededRandom());

// accessors
// const x = (d: Stats) => d.boxPlot.x;
const min = (d: Stats) => d.boxPlot.min;
const max = (d: Stats) => d.boxPlot.max;
const median = (d: Stats) => d.boxPlot.median;
const firstQuartile = (d: Stats) => d.boxPlot.firstQuartile;
const thirdQuartile = (d: Stats) => d.boxPlot.thirdQuartile;
const outliers = (d: Stats) => d.boxPlot.outliers;

interface TooltipData {
   name?: string;
   min?: number;
   median?: number;
   max?: number;
   firstQuartile?: number;
   thirdQuartile?: number;
}

export type StatsPlotProps = {
   width: number;
   height: number;
   data: Stats[][];
   keys: string[];
};

export default withTooltip<StatsPlotProps, TooltipData>(
   ({
      data,
      keys,
      width,
      height,
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip,
   }: StatsPlotProps & WithTooltipProvidedProps<TooltipData>) => {
      // bounds
      const xMax = width;
      const yMax = height - 120;

      // // scales
      // const xScale = scaleBand<string>({
      //    range: [0, xMax],
      //    round: true,
      //    domain: data.map(x),
      //    padding: 0.4,
      // });

      // const values = data.reduce((allValues, {boxPlot}) => {
      //    allValues.push(boxPlot.min, boxPlot.max);
      //    return allValues;
      // }, [] as number[]);
      // const minYValue = Math.min(...values);
      // const maxYValue = Math.max(...values);

      // const yScale = scaleLinear<number>({
      //    range: [yMax, 0],
      //    round: true,
      //    domain: [minYValue, maxYValue],
      // });

      // const boxWidth = xScale.bandwidth();
      // const constrainedWidth = Math.min(40, boxWidth);

      const formatTick = (value: number) => keys[value];

      const dateScale = scaleBand<string>({
         domain: keys,
         padding: 0.2,
      });
      const cityScale = scaleBand<string>({
         domain: keys,
         padding: 0.1,
      });
      const tempScale = scaleLinear<number>({
         domain: [0, 1000],
      });
      const colorScale = scaleOrdinal<string, string>({
         domain: keys,
      });

      // console.log(data);
      return width < 10 ? null : (
         <div style={{position: 'relative', flexShrink: 1}}>
            <svg width={width} height={height} fill={'#f00'}>
               <LinearGradient id="statsplot" to="#0000" from="#0000" />
               <rect
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  fill="url(#statsplot)"
                  rx={14}
               />
               <PatternLines
                  id="hViolinLines"
                  height={3}
                  width={3}
                  stroke="#0070f3"
                  strokeWidth={1}
                  // fill="rgba(0,0,0,0.3)"
                  orientation={['horizontal']}
               />
               <Group top={40}>
                  {/* {data.map((d: Stats[], i) => (
                     <g key={i}> */}
                  <BarGroup
                     data={data}
                     keys={keys}
                     height={yMax}
                     //@ts-ignore
                     x0={(d: Stats[]) => d[0].boxPlot.x}
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
                                    y={bar.y}
                                    width={bar.width}
                                    height={bar.height}
                                    fill={bar.color}
                                    rx={4}
                                 />
                              ))}
                           </Group>
                        ))
                     }
                  </BarGroup>
                  {/* <ViolinPlot
                           data={d.binData}
                           stroke="#0070f3"
                           left={xScale(x(d))!}
                           width={constrainedWidth}
                           valueScale={yScale}
                           fill="url(#hViolinLines)"
                        />
                        <BoxPlot
                           min={min(d)}
                           max={max(d)}
                           left={xScale(x(d))! + 0.3 * constrainedWidth}
                           firstQuartile={firstQuartile(d)}
                           thirdQuartile={thirdQuartile(d)}
                           median={median(d)}
                           boxWidth={constrainedWidth * 0.4}
                           fill="#0070f3"
                           fillOpacity={0.3}
                           stroke="#0070f3"
                           strokeWidth={2}
                           valueScale={yScale}
                           outliers={outliers(d)}
                           minProps={{
                              onMouseOver: () => {
                                 showTooltip({
                                    tooltipTop: yScale(min(d)) ?? 0 + 40,
                                    tooltipLeft:
                                       xScale(x(d))! + constrainedWidth + 5,
                                    tooltipData: {
                                       min: min(d),
                                       name: x(d),
                                    },
                                 });
                              },
                              onMouseLeave: () => {
                                 hideTooltip();
                              },
                           }}
                           maxProps={{
                              onMouseOver: () => {
                                 showTooltip({
                                    tooltipTop: yScale(max(d)) ?? 0 + 40,
                                    tooltipLeft:
                                       xScale(x(d))! + constrainedWidth + 5,
                                    tooltipData: {
                                       max: max(d),
                                       name: x(d),
                                    },
                                 });
                              },
                              onMouseLeave: () => {
                                 hideTooltip();
                              },
                           }}
                           boxProps={{
                              onMouseOver: () => {
                                 showTooltip({
                                    tooltipTop: yScale(median(d)) ?? 0 + 40,
                                    tooltipLeft:
                                       xScale(x(d))! + constrainedWidth + 5,
                                    tooltipData: {
                                       ...d.boxPlot,
                                       name: x(d),
                                    },
                                 });
                              },
                              onMouseLeave: () => {
                                 hideTooltip();
                              },
                           }}
                           medianProps={{
                              style: {
                                 stroke: '#0070f3',
                              },
                              onMouseOver: () => {
                                 showTooltip({
                                    tooltipTop: yScale(median(d)) ?? 0 + 40,
                                    tooltipLeft:
                                       xScale(x(d))! + constrainedWidth + 5,
                                    tooltipData: {
                                       median: median(d),
                                       name: x(d),
                                    },
                                 });
                              },
                              onMouseLeave: () => {
                                 hideTooltip();
                              },
                           }}
                        /> */}
                  {/* </g>
                  ))}*/}
               </Group>
               {/* <AxisBottom
                  top={yMax + margin.top}
                  // tickFormat={formatTick}
                  scale={dateScale}
                  hideAxisLine
                  tickLabelProps={() => ({
                     fill: "green",
                     fontSize: 11,
                     textAnchor: 'middle',
                  })}
               /> */}
            </svg>

            {tooltipOpen && tooltipData && (
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
                     {tooltipData.max && <div>max: {tooltipData.max}</div>}
                     {tooltipData.thirdQuartile && (
                        <div>third quartile: {tooltipData.thirdQuartile}</div>
                     )}
                     {tooltipData.median && (
                        <div>median: {tooltipData.median}</div>
                     )}
                     {tooltipData.firstQuartile && (
                        <div>first quartile: {tooltipData.firstQuartile}</div>
                     )}
                     {tooltipData.min && <div>min: {tooltipData.min}</div>}
                  </div>
               </Tooltip>
            )}
         </div>
      );
   },
);
