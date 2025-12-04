export enum UserRole {
  WORKER = 'WORKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum TaskStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar: string;
//   balance: number;
// }

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  spotsTotal: number;
  spotsTaken: number;
  status: TaskStatus;
  employerName: string;
  timeEstimate: string;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  workerName: string; // Hydrated for UI
  proofContent: string; // Text or URL
  submittedAt: string;
  status: SubmissionStatus;
  reward: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EARNING' | 'REFERRAL';
  amount: number;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string; // PayPal, Bank, etc.
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

// API Payloads
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  reward: number;
  spotsTotal: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: string;
}