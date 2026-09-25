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
export type LeaveType = (typeof LeaveTypeEnum)[keyof typeof LeaveTypeEnum]

type LeaveRequest = {
  id: string,
  personId: string,
  start: string, // date format: YYYY-MM-DD
  end: string,   // date format: YYYY-MM-DD (inclusive)
  type: LeaveType,
  status: LeaveStatus,
  reason?: string,
  decidedBy?: string, // the id of the person who approved or decline the leave request. It stays empty while pending
  decidedAt?: string  // it stays empty while pending
  createdAt: string
}
    

// Rules:
// - Leave reason up to 500 characters only. 
// - Leave counts weekdays only.
// - Leave days = weekdays from start to end, both included.
//   e.g. Wed 1 Oct → Fri 3 Oct = 3 days; Fri 3 Oct → Mon 6 Oct = 2 days.
// - start and end can be the same day (a one-day leave).
// - One person can't have two pending or approved requests whose dates overlap.
//   Declined requests don't count.
// - A request can only be approved or declined once.
// - 'end' cannot be before 'start'.
// - Only a pending request can be approved or declined.
// - Only the hr_manager can approve/decline the leave request.
// - Approved leave should show up as "Leave" in My Week and the Operations View.

// Balance (derived from the person's allowance, never stored):
// - balance = the person's leaveAllowanceDays (0 or more)
// - usedDays = total days of the person's APPROVED vacation requests
// - balance = allowanceDays − usedDays
// - pending and declined requests don't count toward usedDays

// NEED TO CLARIFY
// - sick and emergency leave don't count toward usedDays (need confirmation)
// - does the request also count weekends or weekdays only?

