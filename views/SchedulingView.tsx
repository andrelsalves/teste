Skip to content
Navigation Menu
andrelsalves
teste

Type / to search
Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights
Settings
teste / views
    /
    SchedulingView.tsx
    in
    main

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing SchedulingView.tsx file contents
Selection deleted
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
import React, { useState, useMemo, useCallback } from 'react';
import type { Appointment, User } from '../types/types';
import { Icons as LucideIcons } from '../components/constants/icons';

interface SchedulingViewProps {
    user?: User; // Adicionado para exibir o nome da empresa
    existingAppointments: Appointment[];
    onSchedule: (date: string, time: string, reason: string) => Promise<void>;
}

// Helper para gerar slots de tempo
function generateTimeSlots(start = 8, end = 18): string[] {
    const slots: string[] = [];
    for (let hour = start; hour < end; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
}

const SchedulingView: React.FC<SchedulingViewProps> = ({
    user,
    existingAppointments,
    onSchedule,
}) => {
    const [date, setDate] = useState<string>(''); // Inicie como string vazia
    const [time, setTime] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
            {/* Header ... */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LADO ESQUERDO: SEU CALENDARGRID */}
                <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-emerald-500 font-bold flex items-center gap-2">
                            <LucideIcons.Calendar className="w-5 h-5" />
                            <span>Selecione a Data</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                <span className="text-slate-500">Ocupado</span>
                            </div>
                        </div>
                    </div>

                    {/* Chamada da função que você enviou */}
                    <CalendarGrid
                        selectedDate={date}
                        onSelect={setDate}
                        appointments={existingAppointments}
                    />
                </div>

                return (
                <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
                    {/* Header */}
                    <header className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                            Solicitar <span className="text-emerald-500 italic">Consultoria Especializada</span>
                        </h2>
                        <p className="text-slate-400 mt-2 font-medium">
                            Unidade: <span className="text-white font-bold underline decoration-emerald-500/50">
                                {user?.companyName || 'Empresa Cliente'}
                            </span>
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Lado Esquerdo: Calendário */}
                        <div className="lg:col-span-7 bg-slate-900/50 p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                            <div className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
                                <LucideIcons.Calendar className="w-5 h-5" />
                                Selecione a Data Disponível
                            </div>
                            {/* Aqui você pode manter o seu componente DatePicker antigo ou um CalendarGrid novo */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.

