export interface Timeline {
   date: string;
   qty: number;
}

export interface BoxPlot {
   min: number;
   firstQuartile: number;
   median: number;
   thirdQuartile: number;
   max: number;
   outliers: number[];
}

export interface BinData {
   value: number;
   count: number;
}

export interface Stats {
   boxPlot: BoxPlot;
   binData: BinData[];
   mean: number;
}

export interface BarStats {
   label: string;
   [key: string]: string | Stats;
}

export interface Heatmap {
   bin: number;
   bins: Bin[];
}

export interface Bin {
   bin: number;
   count: number;
}

// export interface Daily {
//    BoxPlot
// }

// export interface Hourly {
//    hour: number;
//    qty: number;
// }
