import React, { useState, useMemo } from 'react';
import { useApp } from './context';
import { Card, Button, StatusBadge, Input, Select, TextArea } from './components';
import { LESSONS } from './constants';
import { AlertTriangle, CheckCircle, Clock, Plus, ArrowRight, User, Calendar, MessageSquare, AlertOctagon, Lightbulb, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ICLPillarResult, Task, Member } from './types';

// --- HOME ---
export const Home = () => {
    const { icl, tasks, meetings, members } = useApp();
    const navigate = useNavigate();
    
    // --- SMART CHECKLIST LOGIC ---
    const [ignoredIds, setIgnoredIds] = useState<string[]>([]);

    // 1. Identify Stale Tasks (Older than 7 days, pending)
    const staleTasks = useMemo(() => tasks.filter(t => 
        t.status === 'pending' && 
        new Date(t.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ), [tasks]);

    // 2. Identify Members needing feedback (Older than 21 days)
    const membersNeedingFeedback = useMemo(() => members.filter(m => {
        if (!m.lastFeedbackDate) return true;
        const days = Math.floor((Date.now() - new Date(m.lastFeedbackDate).getTime()) / (1000 * 3600 * 24));
        return days > 21;
    }), [members]);

    // 3. Identify Meeting Status
    const daysSinceMeeting = meetings.length > 0 ? Math.floor((Date.now() - new Date(Math.max(...meetings.map(m => new Date(m.date).getTime()))).getTime()) / (1000 * 3600 * 24)) : 99;

    // 4. Identify recently completed tasks for reflection
    const recentDoneTasks = useMemo(() => tasks.filter(t => 
        t.status === 'done'
    ).sort((a,b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()).slice(0, 1), [tasks]);

    // GENERATE THE ACTIVE ITEM
    const activeChecklistItem = useMemo(() => {
        // Priority 1: Stale Tasks
        const priorityTask = staleTasks.find(t => !ignoredIds.includes(`task-${t.id}`));
        if (priorityTask) {
            return {
                id: `task-${priorityTask.id}`,
                type: 'stale',
                icon: AlertTriangle,
                colorClass: 'text-amber-600',
                bgClass: 'bg-amber-50 border-amber-100',
                title: 'Desobstrução Necessária',
                text: `A tarefa "${priorityTask.title}" está parada. Ela ainda é uma prioridade ou pode ser eliminada?`,
                actionLabel: 'Resolver Tarefa',
                actionPath: '/tasks',
                secondaryLabel: 'Manter por enquanto'
            };
        }

        // Priority 2: Feedback
        const priorityMember = membersNeedingFeedback.find(m => !ignoredIds.includes(`member-${m.id}`));
        if (priorityMember) {
            return {
                id: `member-${priorityMember.id}`,
                type: 'feedback',
                icon: MessageSquare,
                colorClass: 'text-blue-600',
                bgClass: 'bg-blue-50 border-blue-100',
                title: 'Conexão Humana',
                text: `Faz tempo que ${priorityMember.name} não recebe um feedback formal. O silêncio cria insegurança.`,
                actionLabel: 'Dar Feedback',
                actionPath: '/feedback',
                secondaryLabel: 'Mais tarde'
            };
        }

        // Priority 3: Meeting
        if (daysSinceMeeting > 14 && !ignoredIds.includes('meeting-missing')) {
            return {
                id: 'meeting-missing',
                type: 'meeting',
                icon: Calendar,
                colorClass: 'text-slate-600',
                bgClass: 'bg-slate-100 border-slate-200',
                title: 'Ritmo de Time',
                text: 'O time pode estar perdendo o alinhamento. Que tal registrar uma reunião de ponto de controle?',
                actionLabel: 'Registrar Reunião',
                actionPath: '/meeting/new',
                secondaryLabel: 'Estamos bem'
            };
        }

        // Priority 4: Reflection on Done (Gamification reinforcement)
        const doneTask = recentDoneTasks.find(t => !ignoredIds.includes(`done-${t.id}`));
        if (doneTask) {
             return {
                id: `done-${doneTask.id}`,
                type: 'reflection',
                icon: CheckCircle,
                colorClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 border-emerald-100',
                title: 'Validação de Impacto',
                text: `Você concluiu "${doneTask.title}". Sendo sincero: isso realmente moveu o ponteiro do negócio?`,
                actionLabel: 'Sim, foi útil',
                actionPath: null, // No navigation, just dismiss/confirm
                secondaryLabel: 'Foi apenas ocupação'
            };
        }

        // Priority 5: Growth (Default state when empty)
        return {
            id: 'growth-mode',
            type: 'growth',
            icon: Lightbulb,
            colorClass: 'text-indigo-600',
            bgClass: 'bg-indigo-50 border-indigo-100',
            title: 'Modo Ousadia',
            text: 'A casa está em ordem! É o momento perfeito para criar uma meta ousada que assuste um pouco.',
            actionLabel: 'Criar Meta Ousada',
            actionPath: '/tasks',
            secondaryLabel: 'Apenas manter'
        };

    }, [staleTasks, membersNeedingFeedback, daysSinceMeeting, recentDoneTasks, ignoredIds]);

    const handleAction = () => {
        if (activeChecklistItem.actionPath) {
            navigate(activeChecklistItem.actionPath);
        } else {
            // Logic for "Reflection" items where action is just acknowledgement
            setIgnoredIds([...ignoredIds, activeChecklistItem.id]);
        }
    };

    const handleDismiss = () => {
        setIgnoredIds([...ignoredIds, activeChecklistItem.id]);
    };

    const ItemIcon = activeChecklistItem.icon;

    return (
        <div className="space-y-6 animate-fade-in">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Sua semana como líder</h1>
            </header>

            {/* ICL Mirror */}
            <Card className="p-6 bg-slate-50 border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Espelho de Gestão</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-700 font-medium">Coerência atual:</span>
                            <StatusBadge status={icl.overall} text={icl.overall} />
                        </div>
                    </div>
                    <Button onClick={() => navigate('/orientation')} variant="outline" className="text-xs">
                        👉 Ver orientação
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {(Object.entries(icl.pillars) as [string, ICLPillarResult][]).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-100">
                             <div className={`w-2 h-2 rounded-full ${value.status === 'OK' ? 'bg-emerald-500' : value.status === 'ATENÇÃO' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                             <span className="text-slate-600 font-medium truncate">{value.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Alerts Grid - Keeps the user aware of raw numbers */}
            <div className="grid md:grid-cols-3 gap-4">
                {staleTasks.length > 0 && (
                     <div onClick={() => navigate('/tasks')} className="bg-amber-50 p-4 rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-900">{staleTasks.length} tarefas paradas</p>
                            <p className="text-xs text-amber-700">Há mais de 7 dias sem movimento.</p>
                        </div>
                     </div>
                )}
                 {membersNeedingFeedback.length > 0 && (
                     <div onClick={() => navigate('/feedback')} className="bg-blue-50 p-4 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">{membersNeedingFeedback.length} pessoas sem feedback</p>
                            <p className="text-xs text-blue-700">Há mais de 21 dias.</p>
                        </div>
                     </div>
                )}
                 {daysSinceMeeting > 14 && (
                     <div onClick={() => navigate('/meeting/new')} className="bg-slate-100 p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Reunião pendente</p>
                            <p className="text-xs text-slate-700">Último registro há {daysSinceMeeting} dias.</p>
                        </div>
                     </div>
                )}
            </div>

            {/* Smart Checklist - The "Engine" */}
            <Card className={`p-6 transition-all duration-300 ${activeChecklistItem.bgClass}`}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${activeChecklistItem.colorClass}`}>
                        <ItemIcon className="w-4 h-4" />
                        {activeChecklistItem.title}
                    </h3>
                </div>
                
                <p className="text-lg font-medium text-slate-900 mb-6 min-h-[3.5rem]">
                    {activeChecklistItem.text}
                </p>
                
                <div className="flex gap-3">
                    <Button onClick={handleAction} variant="primary" className="bg-slate-900 hover:bg-slate-800">
                        {activeChecklistItem.actionLabel}
                    </Button>
                    <Button onClick={handleDismiss} variant="ghost" className="text-slate-500 hover:text-slate-700 hover:bg-black/5">
                        {activeChecklistItem.secondaryLabel}
                    </Button>
                </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => navigate('/meeting/new')} className="h-16 text-lg justify-start px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
                    <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                    Registrar Reunião
                </Button>
                <Button variant="outline" onClick={() => navigate('/tasks')} className="h-16 text-lg justify-start px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
                    <CheckCircle className="w-6 h-6 mr-3 text-emerald-600" />
                    Criar Tarefa
                </Button>
                <Button variant="outline" onClick={() => navigate('/feedback')} className="h-16 text-lg justify-start px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
                    <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
                    Dar Feedback
                </Button>
            </div>
        </div>
    );
};

// --- TEAM ---
export const Team = () => {
    const { members, addMember, removeMember } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newName || !newRole) return;
        addMember({ name: newName, role: newRole, active: true });
        setNewName('');
        setNewRole('');
        setIsAdding(false);
    };

    const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if(window.confirm(`Tem certeza que deseja remover ${name} do time?`)) {
            removeMember(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Meu Time</h1>
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary"><Plus className="w-4 h-4" /> Adicionar</Button>
            </div>

            {isAdding && (
                <Card className="p-4 mb-6 bg-slate-50">
                    <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <Input label="Nome" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Ana Silva" autoFocus />
                        </div>
                        <div className="flex-1 w-full">
                            <Input label="Função" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Ex: Vendas" />
                        </div>
                        <div className="pb-4">
                            <Button type="submit">Salvar</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <Card key={member.id} className="p-5 flex flex-col gap-2 relative group">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {member.name.charAt(0)}
                            </div>
                            <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${member.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {member.active ? 'Ativo' : 'Inativo'}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(e, member.id, member.name)} 
                                    className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                                    title="Remover membro"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-500">{member.role}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                            Último feedback: {member.lastFeedbackDate ? new Date(member.lastFeedbackDate).toLocaleDateString() : 'Nunca'}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- TASKS ---
export const Tasks = () => {
    const { tasks, members, addTask, updateTaskStatus, removeTask } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'delayed'>('all');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !assigneeId || !deadline) return;
        addTask({ title, assigneeId, deadline });
        setTitle('');
        setAssigneeId('');
        setDeadline('');
        setIsAdding(false);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent toggling status when clicking delete
        if(window.confirm('Tem certeza que deseja excluir esta responsabilidade?')) {
            removeTask(id);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'pending') return t.status !== 'done';
        if (filter === 'delayed') return t.status !== 'done' && new Date(t.deadline) < new Date();
        return true;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Responsabilidades</h1>
                <div className="flex gap-2">
                    <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">Todas</option>
                        <option value="pending">Pendentes</option>
                        <option value="delayed">Em atraso</option>
                    </select>
                    <Button onClick={() => setIsAdding(!isAdding)}><Plus className="w-4 h-4" /> Nova Tarefa</Button>
                </div>
            </div>

            {isAdding && (
                <Card className="p-6 bg-slate-50">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <Input label="O que precisa ser feito?" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da tarefa" autoFocus />
                        <div className="grid md:grid-cols-2 gap-4">
                             <Select 
                                label="Quem é o dono?" 
                                value={assigneeId} 
                                onChange={e => setAssigneeId(e.target.value)}
                                options={members.map(m => ({ value: m.id, label: m.name }))}
                             />
                             <Input type="date" label="Prazo final" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Responsabilidade</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {filteredTasks.map(task => {
                    const assignee = members.find(m => m.id === task.assigneeId);
                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'done';
                    
                    return (
                        <Card key={task.id} className="p-4 flex items-center justify-between group">
                            <div className="flex items-start gap-4">
                                <div onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done')} 
                                     className={`mt-1 w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`}>
                                    {task.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <p className={`font-medium text-slate-900 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {assignee?.name || 'Sem dono'}</span>
                                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                                            <Clock className="w-3 h-3" /> {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={task.status} text={task.status === 'done' ? 'Feito' : task.status === 'pending' ? 'Pendente' : 'Andamento'} />
                                <button 
                                    onClick={(e) => handleDelete(e, task.id)}
                                    className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                                    title="Excluir tarefa"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
};

// --- MEETING ---
export const NewMeeting = () => {
    const { members, addMeeting } = useApp();
    const navigate = useNavigate();
    const [successes, setSuccesses] = useState('');
    const [blockers, setBlockers] = useState('');
    const [decisions, setDecisions] = useState('');
    
    // Task generation inside meeting
    const [newTasks, setNewTasks] = useState<{title: string, assigneeId: string, deadline: string}[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskAssignee, setTaskAssignee] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');

    const addTaskToMeeting = () => {
        if(!taskTitle || !taskAssignee || !taskDeadline) return;
        setNewTasks([...newTasks, { title: taskTitle, assigneeId: taskAssignee, deadline: taskDeadline }]);
        setTaskTitle('');
        setTaskAssignee('');
        setTaskDeadline('');
    };

    const handleSave = () => {
        if(!successes && !blockers && !decisions) return;
        addMeeting(
            { date: new Date().toISOString(), successes, blockers, decisions, tasksGeneratedCount: newTasks.length },
            newTasks
        );
        navigate('/');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
             <header>
                <h1 className="text-2xl font-bold text-slate-900">Registro de Reunião</h1>
                <p className="text-slate-500">Estruture o alinhamento para reduzir erros.</p>
            </header>

            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="font-bold text-emerald-700 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> 1. O que funcionou?</h3>
                    <TextArea label="Vitórias e avanços desde a última vez" value={successes} onChange={e => setSuccesses(e.target.value)} placeholder="Liste fatos, não opiniões." />
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-amber-700 mb-4 flex items-center gap-2"><AlertOctagon className="w-5 h-5" /> 2. O que travou?</h3>
                    <TextArea label="Problemas e impedimentos" value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="O que impediu o progresso?" />
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> 3. Decisões tomadas</h3>
                    <TextArea label="O que foi definido?" value={decisions} onChange={e => setDecisions(e.target.value)} placeholder="Registrar para não esquecer." />
                </Card>

                <Card className="p-6 bg-slate-50 border-slate-200">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ArrowRight className="w-5 h-5" /> 4. Próximos Passos (Tarefas)</h3>
                     <div className="space-y-3 mb-4">
                        {newTasks.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 text-sm">
                                <span className="font-medium">{t.title}</span>
                                <div className="text-slate-500 text-xs">
                                    {members.find(m => m.id === t.assigneeId)?.name} • {new Date(t.deadline).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                     </div>
                     
                     <div className="grid md:grid-cols-2 gap-3 mb-3">
                         <Input label="O que?" className="mb-0" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Nova tarefa" />
                         <Select label="Quem?" className="mb-0" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} options={members.map(m => ({ value: m.id, label: m.name }))} />
                     </div>
                     <Input type="date" label="Até quando?" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} />
                     <Button variant="secondary" onClick={addTaskToMeeting} className="w-full mt-2" disabled={!taskTitle || !taskAssignee || !taskDeadline}>+ Adicionar Tarefa à Ata</Button>
                </Card>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex justify-center md:pl-64 z-10">
                <Button onClick={handleSave} className="w-full max-w-md shadow-lg" disabled={!successes && !decisions}>Salvar Reunião & Gerar Tarefas</Button>
            </div>
        </div>
    );
};

// --- FEEDBACK ---
export const Feedback = () => {
    const { members, addFeedback } = useApp();
    const navigate = useNavigate();
    const [memberId, setMemberId] = useState('');
    const [type, setType] = useState<any>('positive');
    const [behavior, setBehavior] = useState('');
    const [impact, setImpact] = useState('');
    const [nextStep, setNextStep] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!memberId || !behavior || !impact) return;
        addFeedback({ memberId, type, behavior, impact, nextStep });
        navigate('/');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dar Feedback</h1>
                <p className="text-slate-500">O sistema protege você de falar errado.</p>
            </header>

            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">
                    <Select label="Para quem?" value={memberId} onChange={e => setMemberId(e.target.value)} options={members.map(m => ({ value: m.id, label: m.name }))} />
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Feedback</label>
                        <div className="flex gap-2">
                            {['positive', 'adjustment', 'alignment'].map((t) => (
                                <button 
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === t 
                                        ? 'bg-slate-800 text-white border-slate-800' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {t === 'positive' ? 'Positivo' : t === 'adjustment' ? 'Ajuste' : 'Alinhamento'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <TextArea label="1. Comportamento Observado (Fato)" value={behavior} onChange={e => setBehavior(e.target.value)} placeholder="Ex: Na reunião de ontem, você interrompeu o cliente 3 vezes..." />
                    <TextArea label="2. Impacto Gerado (Consequência)" value={impact} onChange={e => setImpact(e.target.value)} placeholder="Ex: Isso fez o cliente parecer desconfortável e perdemos a linha de raciocínio..." />
                    <TextArea label="3. Próximo Passo Esperado" value={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="Ex: Nas próximas, anote as dúvidas e pergunte no final." />

                    <Button type="submit" className="w-full">Registrar Feedback</Button>
                </Card>
            </form>
        </div>
    );
};

// --- ORIENTATION (ICL LESSON) ---
export const Orientation = () => {
    const { getLesson } = useApp();
    const navigate = useNavigate();
    const lesson = getLesson();

    if (!lesson) return null;

    return (
        <div className="max-w-xl mx-auto pt-10">
            <header className="text-center mb-8">
                <h1 className="text-xl font-medium text-slate-500">Orientação da semana</h1>
                <p className="text-sm text-slate-400 mt-2">Com base nos padrões recentes da sua gestão.</p>
            </header>

            <Card className="p-8 text-center border-t-4 border-t-indigo-500 mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{lesson.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                    {lesson.text}
                </p>
            </Card>

            <Card className="p-6 bg-slate-50 border-dashed border-2 border-slate-300 mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Ação Sugerida</h3>
                <p className="text-slate-700">
                    Registre ao menos um acompanhamento de tarefa ou feedback nos próximos 7 dias para melhorar este pilar.
                </p>
            </Card>

            <div className="text-center">
                <Button onClick={() => navigate('/')} variant="primary" className="mx-auto px-8">
                    Entendi. Voltar para Home.
                </Button>
            </div>
        </div>
    );
};

// --- LOGIN ---
export const Login = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lidere.OS</h1>
                    <p className="text-slate-500 mt-2">Você não lidera melhor. Você erra menos.</p>
                </div>
                <Card className="p-8 shadow-lg">
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
                        <Input label="Email" type="email" placeholder="seu@email.com" />
                        <Input label="Senha" type="password" placeholder="••••••••" />
                        <Button type="submit" className="w-full mt-4">Entrar</Button>
                    </form>
                    <div className="mt-6 text-center">
                        <span className="text-sm text-slate-400 cursor-pointer hover:text-slate-600">Criar conta</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};