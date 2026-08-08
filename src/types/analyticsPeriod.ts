export type AnalyticsPeriodDays =
  | 7
  | 30
  | 90
  | 365;

export interface AnalyticsPeriodOption {
  label: string;
  days: AnalyticsPeriodDays;
}

export const ANALYTICS_PERIOD_OPTIONS: AnalyticsPeriodOption[] = [
  {
    label: "7 Days",
    days: 7,
  },
  {
    label: "30 Days",
    days: 30,
  },
  {
    label: "90 Days",
    days: 90,
  },
  {
    label: "1 Year",
    days: 365,
  },
];

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriodDays = 30;