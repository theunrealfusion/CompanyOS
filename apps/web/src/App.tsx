import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  Clock,
  Settings,
  Plus,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

import TaskModal, { AgentOption } from './components/TaskModal';
import AgentDrawer, { AgentRecord } from './components/AgentDrawer';
import AgentsView from './components/AgentsView';
import WorkflowsView, { TaskRecord, FrictionRecord, DecisionRecord } from './components/WorkflowsView';
import SettingsView from './components/SettingsView';

const queryClient = new QueryClient();

type NavTab = 'command-center' | 'agents' | 'workflows' | 'settings';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8005`;
  }
  return 'http://localhost:8005';
}

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>('command-center');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  // Modals & Drawers
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [defaultTaskAgentId, setDefaultTaskAgentId] = useState('agent_ceo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const apiBase = getApiBase();

  // Fetch Graph Data (Agents, Frictions, Decisions, Tasks)
  const { data: graphData, isLoading: isGraphLoading, refetch: refetchGraph } = useQuery({
    queryKey: ['orgGraph'],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/api/v1/graph/acme_ai_labs`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    refetchInterval: 4000,
  });

  // Fetch Tasks List
  const { data: tasksData = [], refetch: refetchTasks } = useQuery<TaskRecord[]>({
    queryKey: ['tasksList'],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/api/v1/tasks/acme_ai_labs`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 4000,
  });

  const agents: AgentRecord[] = graphData?.nodes?.agents || [];
  const frictions: FrictionRecord[] = graphData?.nodes?.frictions || [];
  const decisions: DecisionRecord[] = graphData?.nodes?.decisions || [];

  // Build React Flow graph
  useEffect(() => {
    if (graphData?.nodes) {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      // Render Agents in a top grid row
      const agentList = graphData.nodes.agents || [];
      const spacingX = 170;
      const startX = 50;

      agentList.forEach((agent: AgentRecord, i: number) => {
        const isWorking = agent.status.toLowerCase() === 'working';
        const isPaused = agent.status.toLowerCase() === 'paused';
        const bg = isWorking ? '#d97706' : isPaused ? '#4b5563' : '#2563eb';

        newNodes.push({
          id: agent.id,
          position: { x: startX + (i * spacingX), y: 60 },
          data: { 
            label: (
              <div className="cursor-pointer" onClick={() => setSelectedAgent(agent)}>
                <div className="font-bold text-[13px]">{agent.role}</div>
                <div className="text-[10px] opacity-80">{agent.name}</div>
                <div className="text-[9px] mt-1 font-mono uppercase bg-black/20 px-1.5 py-0.5 rounded">
                  {agent.status}
                </div>
              </div>
            )
          },
          style: {
            background: bg,
            color: 'white',
            borderRadius: '12px',
            padding: '10px 14px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '130px',
            textAlign: 'center'
          },
        });
      });

      // Render Active Tasks connected to their executor
      const tasksList = tasksData || [];
      tasksList.filter(t => t.status.toLowerCase() === 'in_progress').forEach((task, i) => {
        const taskId = `node_${task.id}`;
        newNodes.push({
          id: taskId,
          position: { x: startX + (i * 240), y: 190 },
          data: {
            label: (
              <div>
                <div className="text-[9px] font-bold uppercase text-amber-300">⚡ ACTIVE TASK</div>
                <div className="text-[11px] font-medium leading-snug line-clamp-2">{task.description}</div>
              </div>
            )
          },
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '10px',
            padding: '8px 12px',
            border: '1px solid #f59e0b',
            maxWidth: '180px',
            fontSize: '11px',
            textAlign: 'left'
          }
        });

        // Edge from executor agent to task
        if (task.executor) {
          newEdges.push({
            id: `edge_${task.executor}_${taskId}`,
            source: task.executor,
            target: taskId,
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 2 }
          });
        }
      });

      // Render Frictions in middle layer
      (graphData.nodes.frictions || []).forEach((friction: any, i: number) => {
        newNodes.push({
          id: friction.id,
          position: { x: 450 + (i * 250), y: 320 },
          data: {
            label: (
              <div>
                <div className="text-[9px] font-bold uppercase text-rose-300">⚡ FRICTION ({friction.conflict_type})</div>
                <div className="text-[12px] font-semibold">{friction.subject}</div>
              </div>
            )
          },
          style: {
            background: '#991b1b',
            color: 'white',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #f87171',
            minWidth: '160px',
            textAlign: 'center'
          },
        });

        // Edges from participants to friction
        friction.participants?.forEach((p: string) => {
          newEdges.push({
            id: `e-${p}-${friction.id}`,
            source: p,
            target: friction.id,
            animated: true,
            style: { stroke: '#ef4444' }
          });
        });
      });

      // Render Decisions in bottom layer
      (graphData.nodes.decisions || []).forEach((decision: any, i: number) => {
        newNodes.push({
          id: decision.id,
          position: { x: 450 + (i * 250), y: 470 },
          data: {
            label: (
              <div>
                <div className="text-[9px] font-bold uppercase text-purple-300">CONSENSUS DECISION</div>
                <div className="text-[11px] font-medium leading-snug">{decision.description}</div>
              </div>
            )
          },
          style: {
            background: '#581c87',
            color: 'white',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #c084fc',
            maxWidth: '220px',
            textAlign: 'center'
          },
        });

        if (decision.friction_id) {
          newEdges.push({
            id: `e-${decision.friction_id}-${decision.id}`,
            source: decision.friction_id,
            target: decision.id,
            style: { stroke: '#a855f7', strokeWidth: 2 }
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [graphData, tasksData]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Dispatch Task Handler
  const handleDispatchTask = async (agentId: string, description: string, priority: string) => {
    await fetch(`${apiBase}/api/v1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: 'acme_ai_labs',
        executor: agentId,
        description,
        priority,
      }),
    });
    refetchGraph();
    refetchTasks();
  };

  // Toggle Agent Status Handler
  const handleToggleAgentStatus = async (agentId: string, nextStatus: string) => {
    await fetch(`${apiBase}/api/v1/agents/${agentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (selectedAgent && selectedAgent.id === agentId) {
      setSelectedAgent({ ...selectedAgent, status: nextStatus });
    }
    refetchGraph();
  };

  // Update Task Status Handler
  const handleUpdateTaskStatus = async (taskId: string, nextStatus: string) => {
    await fetch(`${apiBase}/api/v1/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    refetchGraph();
    refetchTasks();
  };

  const openTaskModalFor = (agentId?: string) => {
    setDefaultTaskAgentId(agentId || 'agent_ceo');
    setIsTaskModalOpen(true);
  };

  const workingCount = agents.filter(a => a.status.toLowerCase() === 'working').length;
  const activeTasksCount = tasksData.filter(t => t.status.toLowerCase() === 'in_progress').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Zap size={18} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">CompanyOS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                Autonomous Org
              </span>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-950/60 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('command-center')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'command-center'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'agents'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Agents Directory</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-gray-800 rounded-full">{agents.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'workflows'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Directives & Tasks</span>
              {activeTasksCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full font-bold">
                  {activeTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings size={14} />
              <span>Configuration</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openTaskModalFor()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Dispatch Directive</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">
              {isGraphLoading ? 'Syncing...' : 'System Live'}
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 space-y-2 z-20">
          {(['command-center', 'agents', 'workflows', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold capitalize ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {activeTab === 'command-center' && (
          <div className="flex-1 relative flex flex-col h-full">
            {/* Quick stats strip */}
            <div className="bg-gray-900/90 border-b border-gray-800/80 px-6 py-2 flex items-center justify-between gap-4 text-xs z-10">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Autonomous Agents:</span>
                  <span className="font-bold text-white font-mono">{agents.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Active Directives:</span>
                  <span className="font-bold text-amber-400 font-mono">{activeTasksCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Frictions:</span>
                  <span className="font-bold text-rose-400 font-mono">{frictions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Decisions:</span>
                  <span className="font-bold text-purple-400 font-mono">{decisions.length}</span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 hidden sm:block">
                Click any agent in graph to inspect details or toggle state
              </div>
            </div>

            {/* React Flow Canvas */}
            <div className="flex-1 w-full h-full relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background color="#334155" gap={18} size={1} />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <AgentsView
            agents={agents}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
            onToggleStatus={handleToggleAgentStatus}
            onDispatchTask={(agentId) => openTaskModalFor(agentId)}
          />
        )}

        {activeTab === 'workflows' && (
          <WorkflowsView
            tasks={tasksData}
            frictions={frictions}
            decisions={decisions}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDispatchTask={() => openTaskModalFor()}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView apiBase={apiBase} />
        )}
      </main>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleDispatchTask}
        agents={agents.map(a => ({ id: a.id, name: a.name, role: a.role }))}
        defaultAgentId={defaultTaskAgentId}
      />

      {/* Agent Detail / Inspection Drawer */}
      <AgentDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onToggleStatus={handleToggleAgentStatus}
        onAssignTask={(agentId) => {
          setSelectedAgent(null);
          openTaskModalFor(agentId);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainDashboard />
    </QueryClientProvider>
  );
}

export default App;
