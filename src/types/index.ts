export interface User {
  id: string;
  username: string;
  teamName: string;
  role: 'user' | 'admin';
}

export interface Submission {
  psNumber: number;
  hasStarted: boolean;
  startTime: string | null;
  isCompleted: boolean;
  completedTime: string | null;
  timeTaken: number | null;
  submissionContent: any;
}

export interface ProblemStatement {
  psNumber: number;
  title: string;
  description: string;
  details: any;
}

export interface Team {
  teamId: string;
  teamName: string;
  username: string;
  teamMembers: string[];
  assignedPS: number;
  submissions: Submission[];
}
