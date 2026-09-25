// Work Entry Domain

export type WaitingOn = 'client' | 'teammate' | 'other' // WaitingOn should be any of these values

export type WorkEntry = 
    | { kind: 'project'; projectId: string; hours: number } // hours should be positive
    | { kind: 'meeting'; hours: number } // hours should be greater than 0
    | { kind: 'blocked'; waitingOn: WaitingOn; projectId?: string; note?: string; hours: number } // hours should be positive; should optionally reference a project, if applicable; note, if present, should be non-empty
    | { kind: 'bench'; hours: number } // hours should be greater than 0
    | { kind: 'learning'; hours: number } // hours should be greater than 0
    | { kind: 'admin'; note?: string; hours: number } // hours should be positive; note, if present, should be non-empty
    | { kind: 'leave' }; // set by the Leave slice upon approval