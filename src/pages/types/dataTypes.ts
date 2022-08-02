interface Bar {
   mean: number;
}

interface Box {
   min: number;
   max: number;
   lwhisk: number;
   uwhisk: number;
   median: number;
   q1: number;
   q3: number;
   outliers: number[] | null;
}

interface Raw {
   data: number[];
}

export interface HourlyBar extends Bar {
   hour: number;
}

export interface DailyBar extends Bar {
   day: string;
}

export interface HourlyBox extends Box {
   hour: number;
}

export interface DailyBox extends Box {
   day: string;
}

export interface HourlyRaw extends Raw {
   hour: number;
}
export interface DailyRaw extends Raw {
   day: string;
}

export interface HeatmapBin {
   delay: string;
   bins: HeatmapDelayBin[];
}

export interface HeatmapDelayBin {
   hour: number;
   count: number;
}

export interface PieSlice {
   user: string;
   count: number;
}
