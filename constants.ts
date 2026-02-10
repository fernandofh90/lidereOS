import { Lesson, Member, Task, Meeting, Feedback } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Ana Silva', role: 'Vendas', active: true, lastFeedbackDate: '2023-10-01' },
  { id: '2', name: 'Carlos Souza', role: 'Operacional', active: true, lastFeedbackDate: '2023-10-15' },
  { id: '3', name: 'Beatriz Lima', role: 'Atendimento', active: true },
];

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Atualizar planilha de clientes', assigneeId: '1', deadline: '2023-10-25', status: 'pending', createdAt: '2023-10-20' },
  { id: '2', title: 'Enviar proposta comercial', assigneeId: '1', deadline: '2023-10-20', status: 'done', createdAt: '2023-10-18' },
  { id: '3', title: 'Organizar estoque', assigneeId: '2', deadline: '2023-10-22', status: 'in_progress', createdAt: '2023-10-19' },
];

export const INITIAL_MEETINGS: Meeting[] = [
  { id: '1', date: '2023-10-10', successes: 'Vendas subiram', blockers: 'Sistema lento', decisions: 'Trocar internet', tasksGeneratedCount: 2 },
];

export const INITIAL_FEEDBACKS: Feedback[] = [];

export const CHECKLIST_QUESTIONS = [
  "Isso precisa ser decidido por você agora?",
  "Isso pode virar uma regra?",
  "Isso é urgente ou importante?",
  "Estou resolvendo ou evitando algo?"
];

export const LESSONS: Lesson[] = [
  // Rhythm
  { id: 1, pillar: 'rhythm', title: 'Presença sustenta clareza', text: 'Times não travam por falta de decisão, mas por ausência após o combinado.' },
  { id: 2, pillar: 'rhythm', title: 'Acompanhamento não é controle', text: 'Revisitar tarefas não diminui autonomia. Aumenta a confiança de quem executa.' },
  // Responsibility
  { id: 6, pillar: 'responsibility', title: 'Tarefa sem dono vira intenção', text: 'Se ninguém é responsável, ninguém se sente cobrado.' },
  { id: 7, pillar: 'responsibility', title: 'Clareza evita retrabalho', text: 'Definir quem faz o quê é um ato de respeito ao tempo do time.' },
  // Response
  { id: 11, pillar: 'response', title: 'Atraso é dado, não falha moral', text: 'Toda tarefa atrasada traz informação. Ignorá-la desperdiça aprendizado.' },
  { id: 12, pillar: 'response', title: 'Problemas não somem sozinhos', text: 'O que não é revisitado tende a se repetir.' },
  // Consistency
  { id: 16, pillar: 'consistency', title: 'Reunião sem ação cria ruído', text: 'Conversas que não viram tarefa enfraquecem a liderança.' },
  { id: 17, pillar: 'consistency', title: 'Decisão precisa virar movimento', text: 'Decidir sem executar é só alinhar intenção.' },
];
