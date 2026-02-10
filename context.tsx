import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Task, Meeting, Feedback, ICLResult, ICLStatus, ICLPillarResult } from './types';
import { INITIAL_MEMBERS, INITIAL_TASKS, INITIAL_MEETINGS, INITIAL_FEEDBACKS, LESSONS } from './constants';

interface AppContextType {
  members: Member[];
  tasks: Task[];
  meetings: Meeting[];
  feedbacks: Feedback[];
  addMember: (member: Omit<Member, 'id'>) => void;
  removeMember: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  removeTask: (id: string) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>, newTasks: Omit<Task, 'id' | 'createdAt' | 'status'>[]) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'date'>) => void;
  icl: ICLResult;
  getLesson: () => import('./types').Lesson | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [icl, setIcl] = useState<ICLResult>({
    overall: 'MÉDIO',
    pillars: {
      rhythm: { status: 'OK', label: 'Ritmo', description: '' },
      responsibility: { status: 'OK', label: 'Resp.', description: '' },
      response: { status: 'OK', label: 'Resposta', description: '' },
      consistency: { status: 'OK', label: 'Consistência', description: '' },
    },
    worstPillarKey: null
  });

  // Actions
  const addMember = (data: Omit<Member, 'id'>) => {
    const newMember = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setMembers(prev => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addTask = (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addMeeting = (data: Omit<Meeting, 'id'>, newTasks: Omit<Task, 'id' | 'createdAt' | 'status'>[]) => {
    const meetingId = Math.random().toString(36).substr(2, 9);
    const newMeeting: Meeting = { ...data, id: meetingId };
    
    setMeetings(prev => [...prev, newMeeting]);
    
    newTasks.forEach(t => {
      addTask({ ...t, meetingId });
    });
  };

  const addFeedback = (data: Omit<Feedback, 'id' | 'date'>) => {
    const date = new Date().toISOString();
    const newFeedback: Feedback = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date
    };
    setFeedbacks(prev => [...prev, newFeedback]);
    
    // Update member last feedback date
    setMembers(prev => prev.map(m => m.id === data.memberId ? { ...m, lastFeedbackDate: date } : m));
  };

  // ICL Calculation Logic
  useEffect(() => {
    const now = new Date();
    
    // 1. Rhythm Calculation
    const lastMeeting = meetings.length > 0 
      ? new Date(Math.max(...meetings.map(m => new Date(m.date).getTime()))) 
      : new Date(0); // Very old date if no meetings
    
    const daysSinceMeeting = Math.floor((now.getTime() - lastMeeting.getTime()) / (1000 * 3600 * 24));
    
    const lastFeedback = feedbacks.length > 0
        ? new Date(Math.max(...feedbacks.map(f => new Date(f.date).getTime())))
        : new Date(0); // Check all feedbacks
    
    // Alternative: check if ANY member has recent feedback. For simplicity, let's use global last feedback.
    const daysSinceFeedback = Math.floor((now.getTime() - lastFeedback.getTime()) / (1000 * 3600 * 24));

    let rhythmStatus: ICLStatus = 'OK';
    if (daysSinceMeeting > 30 || daysSinceFeedback > 30) rhythmStatus = 'CRÍTICO';
    else if (daysSinceMeeting > 14 || daysSinceFeedback > 14) rhythmStatus = 'ATENÇÃO';

    // 2. Responsibility Calculation
    const totalTasks = tasks.length;
    // In our system, all tasks must have an assignee, so that part is always 100% OK per rules. 
    // Let's check completion rate for tasks with deadline passed.
    const pastDeadlines = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'done');
    const tasksWithDeadlinePassed = tasks.filter(t => new Date(t.deadline) < now);
    const completionRate = tasksWithDeadlinePassed.length > 0 
        ? ((tasksWithDeadlinePassed.length - pastDeadlines.length) / tasksWithDeadlinePassed.length) * 100 
        : 100;

    let respStatus: ICLStatus = 'OK';
    if (completionRate < 60) respStatus = 'CRÍTICO';
    else if (completionRate < 80) respStatus = 'ATENÇÃO';

    // 3. Response to Blockers (Simplified)
    // We check if overdue tasks are being updated (moved to done) or if feedback is happening.
    // For V1, let's use a simpler heuristic: Are there "pending" tasks older than 30 days?
    const staleTasks = tasks.filter(t => {
        const created = new Date(t.createdAt);
        const diff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        return t.status === 'pending' && diff > 14;
    });

    let responseStatus: ICLStatus = 'OK';
    if (staleTasks.length > 3) responseStatus = 'CRÍTICO';
    else if (staleTasks.length > 0) responseStatus = 'ATENÇÃO';

    // 4. Consistency
    // Do meetings generate tasks?
    const meetingsWithTasks = meetings.filter(m => m.tasksGeneratedCount > 0).length;
    const meetingTaskRate = meetings.length > 0 ? (meetingsWithTasks / meetings.length) * 100 : 0;

    let consistencyStatus: ICLStatus = 'OK';
    if (meetings.length > 0) {
        if (meetingTaskRate < 50) consistencyStatus = 'CRÍTICO';
        else if (meetingTaskRate < 80) consistencyStatus = 'ATENÇÃO';
    } else {
        consistencyStatus = 'ATENÇÃO'; // No meetings yet
    }

    // Overall Calculation
    let criticalCount = 0;
    let attentionCount = 0;
    const statuses = [rhythmStatus, respStatus, responseStatus, consistencyStatus];
    statuses.forEach(s => {
        if (s === 'CRÍTICO') criticalCount++;
        if (s === 'ATENÇÃO') attentionCount++;
    });

    let overall: ICLResult['overall'] = 'ALTO';
    if (criticalCount >= 2) overall = 'BAIXO';
    else if (criticalCount === 1 || attentionCount >= 2) overall = 'MÉDIO';

    // Identify worst pillar for orientation
    let worstPillarKey: ICLResult['worstPillarKey'] = null;
    if (rhythmStatus === 'CRÍTICO') worstPillarKey = 'rhythm';
    else if (respStatus === 'CRÍTICO') worstPillarKey = 'responsibility';
    else if (responseStatus === 'CRÍTICO') worstPillarKey = 'response';
    else if (consistencyStatus === 'CRÍTICO') worstPillarKey = 'consistency';
    else if (rhythmStatus === 'ATENÇÃO') worstPillarKey = 'rhythm';
    // ... priority sequence
    else if (!worstPillarKey) worstPillarKey = 'rhythm'; // Default

    setIcl({
        overall,
        pillars: {
            rhythm: { status: rhythmStatus, label: 'Ritmo', description: 'Acompanhamento de reuniões e feedback.' },
            responsibility: { status: respStatus, label: 'Responsabilidade', description: 'Tarefas entregues e com donos.' },
            response: { status: responseStatus, label: 'Resposta', description: 'Tratamento de itens travados.' },
            consistency: { status: consistencyStatus, label: 'Consistência', description: 'Reuniões que geram ação.' },
        },
        worstPillarKey
    });

  }, [members, tasks, meetings, feedbacks]);

  const getLesson = () => {
    if (!icl.worstPillarKey) return LESSONS[0];
    const pillarLessons = LESSONS.filter(l => l.pillar === icl.worstPillarKey);
    return pillarLessons[0] || LESSONS[0];
  };

  return (
    <AppContext.Provider value={{ members, tasks, meetings, feedbacks, addMember, removeMember, addTask, removeTask, updateTaskStatus, addMeeting, addFeedback, icl, getLesson }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};