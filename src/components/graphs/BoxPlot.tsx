import React, {useMemo} from 'react';
import {BoxPlot} from '@visx/stats';
import {Bar} from '@visx/shape';
import {Group} from '@visx/group';
import {scaleBand, scaleLinear} from '@visx/scale';
import {AxisLeft, AxisBottom} from '@visx/axis';
import {GridRows} from '@visx/grid';
import {HourlyBox, DailyBox} from '../../pages/types/dataTypes';
import {
   withTooltip,
   Tooltip,
   defaultStyles as defaultTooltipStyles,
} from '@visx/tooltip';
import {WithTooltipProvidedProps} from '@visx/tooltip/lib/enhancers/withTooltip';
import Checkbox from '../Checkbox';

export type BoxProps = {
   width: number;
   height: number;
   data: HourlyBox[] | DailyBox[];
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

export default withTooltip<BoxProps, TooltipData>(
   ({
      width,
      height,
      data,
      events = false,
      margin = {left: 45, top: 60, right: 20, bottom: 60},
      labels,
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip,
   }: BoxProps & WithTooltipProvidedProps<TooltipData>) => {
      const [showOutliers, setShowOutliers] = React.useState(true);

      // accessors
      const x = (d: HourlyBox | DailyBox) => {
         let hourly = d as HourlyBox;
         let daily = d as DailyBox;
         return hourly.hour || daily.day;
      };
      const min = (d: HourlyBox | DailyBox) => d.lwhisk;
      const max = (d: HourlyBox | DailyBox) => d.uwhisk;
      const median = (d: HourlyBox | DailyBox) => d.median;
      const firstQuartile = (d: HourlyBox | DailyBox) => d.q1;
      const thirdQuartile = (d: HourlyBox | DailyBox) => d.q3;
      const outliers = (d: HourlyBox | DailyBox) => d.outliers ?? undefined;

      // bounds
      const xMax = width - margin.left - margin.right;
      const yMax = height - margin.top - margin.bottom;

      // scales, memoize for performance
      const xScale = useMemo(
         () =>
            scaleBand<string>({
               range: [0, xMax],
               round: true,
               domain: data.map(x),
               padding: 0.4,
            }),
         [xMax],
      );

      const minYValue = Math.min(...data.map(d => d.min));
      const maxYValue = Math.max(...data.map(d => d.max));

      const minYValueBoxOnly = Math.min(...data.map(d => d.lwhisk));
      const maxYValueBoxOnly = Math.max(...data.map(d => d.uwhisk));

      const yScale = useMemo(
         () =>
            scaleLinear<number>({
               range: [yMax, 0],
               round: true,
               domain: [minYValue, maxYValue],
            }),
         [yMax],
      );

      const yScaleBoxOnly = useMemo(
         () =>
            scaleLinear<number>({
               range: [yMax, 0],
               round: true,
               domain: [minYValueBoxOnly, maxYValueBoxOnly],
            }),
         [yMax],
      );

      const boxWidth = xScale.bandwidth();
      const constrainedWidth = Math.min(40, boxWidth);

      // colors
      const color = '#337cff';

      return width < 10 ? null : (
         <div style={{position: 'relative'}}>
            <Checkbox
               label="OUTLIERS"
               checked={showOutliers}
               onChange={setShowOutliers}></Checkbox>
            <svg width={width} height={height}>
               <rect x={0} y={0} width={width} height={height} fill={'#0000'} />
               <Group left={0} top={margin.top}>
                  <Group>
                     {data.map((d: HourlyBox | DailyBox) => {
                        return (
                           <BoxPlot
                              key={d.hour || d.day}
                              min={min(d)}
                              max={max(d)}
                              left={xScale(x(d))!}
                              firstQuartile={firstQuartile(d)}
                              thirdQuartile={thirdQuartile(d)}
                              median={median(d)}
                              boxWidth={boxWidth}
                              fill={color}
                              fillOpacity={0.3}
                              stroke={color}
                              strokeWidth={2}
                              valueScale={showOutliers ? yScale : yScaleBoxOnly}
                              rx={boxWidth / 16}
                              ry={boxWidth / 16}
                              outliers={showOutliers ? outliers(d) : []}
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
                                          ...d,
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
                                    stroke: color,
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
                              outlierProps={{
                                 style: {},
                                 onMouseOver: () => {
                                    showTooltip({
                                       tooltipTop: yScale(median(d)) ?? 0 + 40,
                                       tooltipLeft:
                                          xScale(x(d))! + constrainedWidth + 5,
                                       tooltipData: {
                                          outlier: outliers(d),
                                          name: x(d),
                                       },
                                    });
                                 },
                                 onMouseLeave: () => {
                                    hideTooltip();
                                 },
                              }}
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
                     tickLabelProps={() => ({
                        fontSize: 11,
                        textAnchor: 'middle',
                        dy: '0.33em',
                        fill: color,
                     })}
                  />
               </Group>
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
            )}
         </div>
      );
   },
);
