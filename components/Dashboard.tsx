import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Prospect, ProspectStatus } from '../types';
import { Briefcase, Flame, Snowflake, Clock } from 'lucide-react';

interface DashboardProps {
  prospects: Prospect[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors`}>
    <div className={`p-3 rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ prospects }) => {
  const stats = useMemo(() => {
    return {
      total: prospects.length,
      hot: prospects.filter(p => p.status === ProspectStatus.HOT).length,
      warm: prospects.filter(p => p.status === ProspectStatus.WARM).length,
      cold: prospects.filter(p => p.status === ProspectStatus.COLD).length,
      waiting: prospects.filter(p => p.status === ProspectStatus.WAITING).length,
    };
  }, [prospects]);

  const chartData = [
    { name: 'Quente', value: stats.hot, color: '#22c55e' }, // green-500
    { name: 'Morno', value: stats.warm, color: '#f97316' }, // orange-500
    { name: 'Aguardando', value: stats.waiting, color: '#eab308' }, // yellow-500
    { name: 'Frio', value: stats.cold, color: '#3b82f6' }, // blue-500
  ];

  // Cálculo de Evolução Mensal com Base na Data Manual (date)
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Inicializa estrutura com 0 para todos os meses
    const data = monthNames.map(name => ({ name, deals: 0 }));

    prospects.forEach(prospect => {
      // prospect.date deve ser "YYYY-MM-DD"
      if (prospect.date) {
        const [yearStr, monthStr] = prospect.date.split('-'); // ["2024", "05", "15"]
        const year = parseInt(yearStr);
        const month = parseInt(monthStr); // 1-12

        // Verifica se o prospecto é do ano atual
        if (year === currentYear) {
          const monthIndex = month - 1; // 0 a 11
          if (data[monthIndex]) {
             data[monthIndex].deals += 1;
          }
        }
      }
    });

    return data;
  }, [prospects]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Processos" value={stats.total} icon={<Briefcase size={24} />} color="bg-indigo-600" />
        <StatCard title="Leads Quentes" value={stats.hot} icon={<Flame size={24} />} color="bg-green-500" />
        <StatCard title="Aguardando Retorno" value={stats.waiting} icon={<Clock size={24} />} color="bg-yellow-500" />
        <StatCard title="Leads Frios" value={stats.cold} icon={<Snowflake size={24} />} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Distribuição por Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" formatter={(value) => <span className="text-slate-600 dark:text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Novos Processos ({new Date().getFullYear()})
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`${value} Processos`, 'Quantidade']}
                />
                <Bar dataKey="deals" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};