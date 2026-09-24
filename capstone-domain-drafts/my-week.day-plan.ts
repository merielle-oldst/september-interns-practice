// Day Plan Domain

import { WorkEntry } from "./my-week.work-entry";

export type DayPlan = {
    date: string; // should be an ISO date
    workEntry: WorkEntry[]; // if any entry has kind 'leave', it must be the only entry for the day
                            // sum of hours across entries should not exceed the daily cap (24)
}