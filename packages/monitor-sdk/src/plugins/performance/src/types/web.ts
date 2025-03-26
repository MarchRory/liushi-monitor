import {
    LCPMetricWithAttribution,
    FCPMetricWithAttribution,
    TTFBMetricWithAttribution,
    INPMetricWithAttribution,
} from 'web-vitals/attribution'

export type OnWebVitalsType = 'LCP' | "FCP" | "TTFB" | "INP"
export type MetricParam<T extends OnWebVitalsType = OnWebVitalsType>
    = T extends 'LCP' ? LCPMetricWithAttribution
    : T extends 'FCP' ? FCPMetricWithAttribution
    : T extends 'TTFB' ? TTFBMetricWithAttribution
    : T extends 'INP' ? INPMetricWithAttribution
    : never