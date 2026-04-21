/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Table2, 
  Store as StoreIcon, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  ChevronRight,
  Menu,
  X,
  UserCircle,
  TrendingUp,
  FileText,
  Award,
  Star,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, TaskDefinition, StoreTask, TaskStatus } from './types';
import { STORES, TASKS, INITIAL_STORE_TASKS } from './constants';

// --- Components ---

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = {
    not_started: { color: 'bg-gray-100 text-gray-500', label: '未着手', icon: Clock },
    submitted: { color: 'bg-amber-100 text-amber-600', label: '提出済', icon: AlertCircle },
    approved: { color: 'bg-emerald-100 text-emerald-600', label: '承認済', icon: CheckCircle2 },
    rejected: { color: 'bg-rose-100 text-rose-600', label: '差戻', icon: X },
    overdue: { color: 'bg-rose-100 text-rose-700 font-bold border border-rose-300', label: '期限超過', icon: AlertCircle },
  };

  const { color, label, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const StampCard = ({ count }: { count: number }) => {
  const maxStamps = 20;
  return (
    <div className="bg-amber-50 border-2 border-amber-200 border-dashed p-6 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
        <Award size={120} className="text-amber-600" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-amber-800 flex items-center gap-2 italic uppercase tracking-tighter">
          <Star className="fill-amber-400 text-amber-400" size={18} />
          On-Time Stamp Card
        </h3>
        <p className="text-xs font-mono font-bold text-amber-700">STAMPS: {count} / {maxStamps}</p>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {Array.from({ length: maxStamps }).map((_, i) => (
          <div 
            key={i} 
            className={`aspect-square rounded-full flex items-center justify-center transition-all duration-500 ${
              i < count 
                ? 'bg-amber-400 shadow-md scale-110 rotate-12 border-2 border-white' 
                : 'bg-white border-2 border-amber-100'
            }`}
          >
            {i < count ? (
              <CheckCircle2 size={16} className="text-white" />
            ) : (
              <span className="text-[10px] font-mono text-amber-100 font-bold">{i + 1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'matrix' | 'stores'>('dashboard');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'store_manager'>('admin');
  
  // Simulation of state
  const [storeTasks, setStoreTasks] = useState<StoreTask[]>([]);
  const [storesData, setStoresData] = useState<Store[]>(STORES);

  useEffect(() => {
    const savedTasks = localStorage.getItem('storeTasks');
    const savedStores = localStorage.getItem('storesData');
    if (savedTasks) setStoreTasks(JSON.parse(savedTasks));
    else setStoreTasks(INITIAL_STORE_TASKS);
    
    if (savedStores) setStoresData(JSON.parse(savedStores));
  }, []);

  useEffect(() => {
    if (storeTasks.length > 0) localStorage.setItem('storeTasks', JSON.stringify(storeTasks));
    if (storesData.length > 0) localStorage.setItem('storesData', JSON.stringify(storesData));
  }, [storeTasks, storesData]);

  const stats = useMemo(() => {
    const total = STORES.length * TASKS.length;
    const completed = storeTasks.filter(t => t.status === 'approved').length;
    const pending = storeTasks.filter(t => t.status === 'submitted').length;
    const progress = Math.round((completed / total) * 100);
    
    return { total, completed, pending, progress };
  }, [storeTasks]);

  const handleUpdateStatus = (storeId: string, taskId: string, newStatus: TaskStatus) => {
    setStoreTasks(prev => {
      const taskDef = TASKS.find(t => t.id === taskId);
      const isApproved = newStatus === 'approved';
      
      // Stamp awarding logic
      if (isApproved) {
        setStoresData(sPrev => sPrev.map(s => {
          if (s.id === storeId) {
            return { ...s, stamps: (s.stamps || 0) + 1 };
          }
          return s;
        }));
      }

      return prev.map(t => 
        (t.storeId === storeId && t.taskId === taskId) 
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString(), submittedAt: t.submittedAt || new Date().toISOString() } 
          : t
      );
    });
  };

  const rankedStores = useMemo(() => {
    return [...storesData].sort((a, b) => (b.stamps || 0) - (a.stamps || 0));
  }, [storesData]);

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">状況サマリー</h1>
        <p className="text-sm text-gray-500 italic">本部からの全体進捗管理ビュー</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '全体進捗率', value: `${stats.progress}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '提出済み (承認待ち)', value: stats.pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '完了タスク', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '店舗数', value: STORES.length, icon: StoreIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-b-4 border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stamp Leaderboard */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-amber-50/30">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              スタンプランキング
            </h2>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {rankedStores.slice(0, 5).map((store, i) => (
              <div key={store.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-amber-400 text-white shadow-sm' :
                  i === 1 ? 'bg-gray-300 text-white' :
                  i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-50 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{store.name}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-mono font-black text-sm">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {store.stamps || 0}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 text-center">
            <button onClick={() => setView('stores')} className="text-xs font-bold text-blue-600 hover:underline px-4 py-2">
              全店舗のランキングを見る
            </button>
          </div>
        </section>

        {/* Urgency List */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-rose-500" />
              期限が近い重要タスク
            </h2>
            <span className="text-xs font-mono bg-rose-50 text-rose-600 px-2 py-1 rounded">要確認</span>
          </div>
          <div className="divide-y divide-gray-50">
            {TASKS.filter(t => t.importance === 'high').map(task => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setView('matrix')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">締切日: {task.deadline}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-400">進捗</p>
                      <p className="text-sm font-bold">
                        {storeTasks.filter(st => st.taskId === task.id && st.status === 'approved').length} / {STORES.length}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              直近の提出状況
            </h2>
          </div>
          <div className="p-6">
             <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <UserCircle size={20} className="text-gray-400" />
                    </div>
                    <div className="flex-1 border-b border-gray-50 pb-4">
                      <p className="text-sm text-gray-800">
                        <span className="font-bold text-gray-900">{STORES[i % STORES.length].name}</span> が 
                        <span className="font-bold text-gray-900">「{TASKS[i % TASKS.length].title}」</span>を提出しました。
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1{i}分前</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">進捗マトリックス</h1>
          <p className="text-sm text-gray-500 italic">各店舗の提出状況を一元監視</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="店舗名で検索..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-gray-400 border-b border-gray-100 sticky left-0 bg-gray-50 z-10 w-48">店舗名</th>
              {TASKS.map(task => (
                <th key={task.id} className="px-6 py-4 border-b border-gray-100 min-w-[160px]">
                  <p className="text-xs font-mono uppercase tracking-widest text-gray-400">書類</p>
                  <p className="text-sm font-bold text-gray-800 truncate" title={task.title}>{task.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">締切: {task.deadline}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {STORES.map(store => (
              <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-50 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                  <div className="flex items-center gap-2">
                    <StoreIcon size={14} className="text-gray-400" />
                    {store.name}
                  </div>
                </td>
                {TASKS.map(task => {
                  const storeTask = storeTasks.find(st => st.storeId === store.id && st.taskId === task.id);
                  const status = storeTask?.status || 'not_started';
                  
                  return (
                    <td key={task.id} className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            const nextStatusMap: Record<TaskStatus, TaskStatus> = {
                              not_started: 'submitted',
                              submitted: 'approved',
                              approved: 'not_started',
                              rejected: 'submitted',
                              overdue: 'submitted'
                            };
                            handleUpdateStatus(store.id, task.id, nextStatusMap[status]);
                          }}
                          className="text-left focus:outline-none"
                        >
                          <StatusBadge status={status} />
                        </button>
                        {status === 'submitted' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleUpdateStatus(store.id, task.id, 'approved')}
                              className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              承
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(store.id, task.id, 'rejected')}
                              className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 hover:bg-rose-100 transition-colors"
                            >
                              戻
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">凡例：</p>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="not_started" />
          <StatusBadge status="submitted" />
          <StatusBadge status="approved" />
          <StatusBadge status="rejected" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-800 font-sans selection:bg-blue-100">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <FileText className="text-white" size={20} />
          </div>
          <span className="font-bold tracking-tight">Store Task</span>
        </div>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex relative">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 p-6 flex flex-col gap-8 shadow-xl lg:shadow-none`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                     <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl tracking-tighter text-gray-900 italic">HANAMARU</h2>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-[-2px]">Control Panel</p>
                  </div>
                </div>
                <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {[
                  { id: 'dashboard', label: 'サマリー', icon: LayoutDashboard },
                  { id: 'matrix', label: '進捗マトリックス', icon: Table2 },
                  { id: 'stores', label: '店舗一覧', icon: StoreIcon },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as any);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      view === item.id 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {view === item.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-50">
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <UserCircle className="text-gray-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">横山 管理者</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">本部管理権限</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8 lg:p-12 max-w-7xl mx-auto overflow-hidden">
          {view === 'dashboard' && renderDashboard()}
          {view === 'matrix' && renderMatrix()}
          {view === 'stores' && (
            <div className="space-y-8">
              <header>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">全店舗ランキング & スタンプ</h1>
                <p className="text-sm text-gray-500 italic">期限内提出でスタンプを獲得し、成果を称え合いましょう</p>
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {rankedStores.map((store, i) => (
                  <div key={store.id} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black italic shadow-inner ${
                          i === 0 ? 'bg-amber-400 text-white' :
                          i === 1 ? 'bg-gray-200 text-gray-500' :
                          i === 2 ? 'bg-orange-200 text-orange-600' : 'bg-gray-50 text-gray-300'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-none">{store.name}</h3>
                          <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{store.area} AREA</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">進捗状況</div>
                        <div className="flex items-center gap-2">
                           <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.round((storeTasks.filter(st => st.storeId === store.id && st.status === 'approved').length / TASKS.length) * 100)}%` }}
                              />
                           </div>
                           <span className="text-xs font-black font-mono">
                              {Math.round((storeTasks.filter(st => st.storeId === store.id && st.status === 'approved').length / TASKS.length) * 100)}%
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <StampCard count={store.stamps || 0} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
