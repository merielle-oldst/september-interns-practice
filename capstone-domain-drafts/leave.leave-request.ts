export const LeaveStatusEnum = { // define Leave Status constants inside an object
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
} as const;

// a closed set of leave status
export type LeaveStatus = (typeof LeaveStatusEnum)[keyof typeof LeaveStatusEnum];

export const LeaveTypeEnum = { // define Leave Type constants inside an object
  SICK: 'sick',
  EMERGENCY: 'emergency',
  VACATION: 'vacation'
} as const;

// a closed set of leave type
export type LeaveType = (typeof LeaveTypeEnum)[keyof typeof LeaveTypeEnum];

type LeaveRequest {
  id: string,
  personId: string,
  start: string,
  end: string,
  type: LeaveType,
  status: LeaveStatus,
  reason?: string
}
    

// Rules:
// - Leave reason up to 500 characters only. 
// - One person can't have two pending or approved requests whose dates overlap.
//   Declined requests don't count.
// - A request can only be approved or declined once.

// Balance (derived from the person's allowance, never stored):
// - balance = the person's leaveAllowanceDays (0 or more)
// - usedDays = total days of the person's APPROVED vacation requests
// - balance = allowanceDays − usedDays
// - pending and declined requests don't count toward usedDays

// NEED TO CLARIFY
// - sick and emergency leave don't count toward usedDays (need confirmation)
// - does the request also count weekends or weekdays only?

}

