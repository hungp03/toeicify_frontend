export interface StatItem {
  title: string;
  value: string;
}

export interface MonthlyDataItem {
  name: string;
  users: number;
  tests: number;
}

export interface WeeklyGrowthItem {
  name: string;
  value: number;
}

export interface ActivityItem {
  action: string;
  user: string;
  time: string;
}