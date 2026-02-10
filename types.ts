export interface Member {
  id: string;
  name: string;
  role: string;
  active: boolean;
  lastFeedbackDate?: string; // ISO Date
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  deadline: string; // ISO Date
  status: 'pending' | 'in_progress' | 'done';
  createdAt: string;
  meetingId?: string;
}

export interface Meeting {
  id: string;
  date: string; // ISO Date
  successes: string;
  blockers: string;
  decisions: string;
  tasksGeneratedCount: number;
}

export interface Feedback {
  id: string;
  memberId: string;
  type: 'positive' | 'adjustment' | 'alignment';
  behavior: string;
  impact: string;
  nextStep: string;
  date: string;
}

export type ICLStatus = 'OK' | 'ATENÇÃO' | 'CRÍTICO';

export interface ICLPillarResult {
  status: ICLStatus;
  label: string;
  description: string;
}

export interface ICLResult {
  overall: 'BAIXO' | 'MÉDIO' | 'ALTO';
  pillars: {
    rhythm: ICLPillarResult;
    responsibility: ICLPillarResult;
    response: ICLPillarResult;
    consistency: ICLPillarResult;
  };
  worstPillarKey: 'rhythm' | 'responsibility' | 'response' | 'consistency' | null;
}

export interface Lesson {
  id: number;
  pillar: 'rhythm' | 'responsibility' | 'response' | 'consistency' | 'general';
  title: string;
  text: string;
}
