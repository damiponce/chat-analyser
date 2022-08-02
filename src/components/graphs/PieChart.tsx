import React from 'react';
import Pie, {ProvidedProps, PieArcDatum} from '@visx/shape/lib/shapes/Pie';
import {Group} from '@visx/group';
import {scaleBand, scaleLinear, scaleOrdinal} from '@visx/scale';
import {PieSlice} from '../../pages/types/dataTypes';
import {
   withTooltip,
   Tooltip,
   defaultStyles as defaultTooltipStyles,
} from '@visx/tooltip';
import {WithTooltipProvidedProps} from '@visx/tooltip/lib/enhancers/withTooltip';

export type PieProps = {
   width: number;
   height: number;
   data: PieSlice[];
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

export default withTooltip<PieProps, TooltipData>(
   ({
      width,
      height,
      data,
      events = false,
      margin = {left: 45, top: 60, right: 20, bottom: 60},
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      showTooltip,
      hideTooltip,
   }: PieProps & WithTooltipProvidedProps<TooltipData>) => {
      // colors
      const color = '#337cff';

      const radius = (Math.min(width, height) / 2) * 0.95;
      const innerRadius = radius * 0.6;

      const centerY = height / 2;
      const centerX = width / 2;
      const top = centerY;
      const left = centerX;

      data.sort((a, b) => b.count - a.count);

      const totalCount = data.reduce((accumulator, object) => {
         return accumulator + object.count;
      }, 0);

      const colorScale = scaleLinear<string>({
         domain: [data[0].count, 0],
         range: [color, '#253758'],
      });

      return width < 10 ? null : (
         <div style={{position: 'relative'}}>
            <svg width={width} height={height}>
               <rect x={0} y={0} width={width} height={height} fill={'#0000'} />
               <Group top={top} left={left}>
                  <Pie
                     data={data}
                     pieValue={(d: PieSlice) => d.count}
                     pieSortValues={(a, b) => b - a}
                     outerRadius={radius}
                     innerRadius={innerRadius}
                     cornerRadius={3}
                     padAngle={0.005}>
                     {pie =>
                        pie.arcs.map((arc, index) => {
                           const {user} = arc.data;
                           const [centroidX, centroidY] =
                              pie.path.centroid(arc);
                           const hasSpaceForLabel =
                              arc.endAngle - arc.startAngle >= 0.3;
                           const arcPath = pie.path(arc);
                           const arcFill = colorScale(arc.value);
                           return (
                              <g key={`arc-${user}-${index}`}>
                                 <path
                                    onClick={() => alert(arc.value)}
                                    d={arcPath!}
                                    fill={arcFill}
                                 />
                                 {hasSpaceForLabel && (
                                    <text
                                       x={centroidX}
                                       y={centroidY}
                                       dy=".33em"
                                       fill="#ffffff"
                                       fontSize={15}
                                       textAnchor="middle"
                                       pointerEvents="none">
                                       {arc.data.user}
                                    </text>
                                 )}
                              </g>
                           );
                        })
                     }
                  </Pie>
               </Group>
            </svg>
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
