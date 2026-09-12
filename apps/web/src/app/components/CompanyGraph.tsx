"use client";

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Activity, 
  Briefcase, 
  Cpu, 
  TrendingUp, 
  Users, 
  Target, 
  Radio, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  MousePointerClick,
  GitBranch,
  UserPlus,
  Save,
  Check,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';

export interface AgentData extends Record<string, unknown> {
  id: string;
  role: string;
  name: string;
  department: string;
  status: 'WORKING' | 'IDLE' | 'THINKING' | 'WAITING' | 'FAILED';
  task?: string;
  icon?: string;
  model: string;
  runtime: string;
  costPerHour: string;
  permissionLevel: string;
  metrics: {
    efficiency: number;
    tasks: number;
  };
  onSelect?: (agent: AgentData) => void;
  onEdit?: (agent: AgentData) => void;
  onDelete?: (agentId: string) => void;
  isRestructuring?: boolean;
}

const icons: Record<string, React.ReactNode> = {
  founder: <Target size={18} className="text-purple-400" />,
  ceo: <Briefcase size={18} className="text-blue-400" />,
  strategy: <TrendingUp size={18} className="text-emerald-400" />,
  product: <Activity size={18} className="text-amber-400" />,
  engineering: <Cpu size={18} className="text-cyan-400" />,
  revenue: <Users size={18} className="text-rose-400" />,
};

// Custom Employee Node with interactive states & restructure controls
const EmployeeNode = ({ data }: { data: any }) => {
  const isWorking = data.status === 'WORKING';
  const isThinking = data.status === 'THINKING';
  const isRestructuring = !!data.isRestructuring;

  return (
    <div 
      className={`group relative flex flex-col bg-[#131722] border rounded-xl p-4 shadow-2xl min-w-[240px] max-w-[280px] transition-all duration-150 ${
        isRestructuring 
          ? 'border-dashed border-blue-500/80 ring-2 ring-blue-500/20' 
          : isWorking 
          ? 'border-blue-500/80 shadow-blue-500/20 cursor-pointer hover:scale-[1.02]' 
          : isThinking 
          ? 'border-amber-500/80 shadow-amber-500/20 cursor-pointer hover:scale-[1.02]'
          : 'border-gray-800 hover:border-gray-600 cursor-pointer hover:scale-[1.02]'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-blue-500 !w-3.5 !h-3.5 !border-2 !border-gray-900" 
      />
      
      {/* Restructure controls overlay */}
      {isRestructuring ? (
        <div className="absolute -top-3.5 right-2 flex items-center gap-1 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.(data);
            }}
            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-md text-[10px] flex items-center gap-0.5"
            title="Edit Agent & Reporting Line"
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
          {data.id !== 'founder' && data.id !== 'ceo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove ${data.role}?`)) {
                  data.onDelete?.(data.id);
                }
              }}
              className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow-md"
              title="Remove from Org"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      ) : (
        <div 
          onClick={() => data.onSelect?.(data)}
          className="absolute -top-3 right-3 hidden group-hover:flex items-center gap-1 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg cursor-pointer"
        >
          <MousePointerClick size={10} /> Inspect
        </div>
      )}

      <div 
        onClick={() => !isRestructuring && data.onSelect?.(data)}
        className="flex items-start justify-between mb-2.5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-800/90 rounded-lg group-hover:bg-blue-600/20 transition-colors">
            {icons[data.icon || 'founder'] || <Cpu size={18} className="text-cyan-400" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide group-hover:text-blue-300 transition-colors">
              {data.role}
            </h3>
            <p className="text-xs text-gray-400">{data.name}</p>
          </div>
        </div>
        
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
          isWorking 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' 
            : isThinking
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          {data.status}
        </div>
      </div>

      {data.task && (
        <div className="text-xs text-blue-200/90 bg-blue-950/40 border border-blue-800/40 rounded-lg p-2 mb-2 break-words">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-0.5">Current Task</div>
          {data.task}
        </div>
      )}
      
      <div className="space-y-1.5 mt-1 pt-2.5 border-t border-gray-800/80">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">Department</span>
          <span className="text-gray-200 font-medium truncate max-w-[140px]">{data.department}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">Model</span>
          <span className="text-blue-400 font-mono text-[10px] truncate max-w-[140px]">{data.model || 'Gemini 1.5'}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-700 ${
              isWorking ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gray-600'
            }`} 
            style={{ width: `${data.metrics?.efficiency || 85}%` }}
          />
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-blue-500 !w-3.5 !h-3.5 !border-2 !border-gray-900" 
      />
    </div>
  );
};

export const INITIAL_AGENTS_DATA: Record<string, AgentData> = {
  founder: {
    id: 'founder',
    role: 'Founder & Owner',
    name: 'Alice',
    department: 'Executive',
    status: 'WORKING',
    task: 'Directing autonomous company strategy',
    icon: 'founder',
    model: 'Human-in-the-Loop',
    runtime: 'Human Authority',
    costPerHour: '₹0.00',
    permissionLevel: 'L6 Irreversible',
    metrics: { efficiency: 100, tasks: 24 }
  },
  ceo: {
    id: 'ceo',
    role: 'Chief Executive Officer',
    name: 'Agent CEO',
    department: 'Executive',
    status: 'WORKING',
    task: 'Orchestrating directors & evaluating ROI',
    icon: 'ceo',
    model: 'Gemini 1.5 Pro',
    runtime: 'CompanyOS Native',
    costPerHour: '₹140.00',
    permissionLevel: 'L5 Spend & Policy',
    metrics: { efficiency: 96, tasks: 62 }
  },
  strategy: {
    id: 'strategy',
    role: 'Strategy Director',
    name: 'Agent Strat',
    department: 'Strategy & Research',
    status: 'IDLE',
    task: 'Market research & opportunity scoring',
    icon: 'strategy',
    model: 'Hermes 3 / Llama 3.3',
    runtime: 'Hermes Adapter',
    costPerHour: '₹85.00',
    permissionLevel: 'L3 Execute',
    metrics: { efficiency: 88, tasks: 19 }
  },
  product: {
    id: 'product',
    role: 'Product Director',
    name: 'Agent Prod',
    department: 'Product & Design',
    status: 'WORKING',
    task: 'Drafting PRD for AI GPU Cloud SaaS',
    icon: 'product',
    model: 'Gemini 1.5 Flash',
    runtime: 'Antigravity SDK',
    costPerHour: '₹60.00',
    permissionLevel: 'L3 Execute',
    metrics: { efficiency: 92, tasks: 34 }
  },
  engineering: {
    id: 'engineering',
    role: 'Engineering Director',
    name: 'Agent Eng',
    department: 'Engineering & Architecture',
    status: 'WORKING',
    task: 'Implementing inference gateway & QA test suite',
    icon: 'engineering',
    model: 'Claude 3.5 Sonnet / NIM',
    runtime: 'NVIDIA NIM vLLM',
    costPerHour: '₹180.00',
    permissionLevel: 'L4 Publish & Deploy',
    metrics: { efficiency: 98, tasks: 142 }
  },
  revenue: {
    id: 'revenue',
    role: 'Revenue Director',
    name: 'Agent Rev',
    department: 'Revenue & Monetization',
    status: 'IDLE',
    task: 'Analyzing conversion funnels & customer pipeline',
    icon: 'revenue',
    model: 'OpenAI GPT-4o-mini',
    runtime: 'CompanyOS Native',
    costPerHour: '₹45.00',
    permissionLevel: 'L3 Execute',
    metrics: { efficiency: 82, tasks: 11 }
  },
};

export const INITIAL_NODES: Node[] = [
  {
    id: 'founder',
    type: 'employee',
    position: { x: 380, y: 30 },
    data: INITIAL_AGENTS_DATA.founder,
  },
  {
    id: 'ceo',
    type: 'employee',
    position: { x: 380, y: 220 },
    data: INITIAL_AGENTS_DATA.ceo,
  },
  {
    id: 'strategy',
    type: 'employee',
    position: { x: 40, y: 420 },
    data: INITIAL_AGENTS_DATA.strategy,
  },
  {
    id: 'product',
    type: 'employee',
    position: { x: 300, y: 420 },
    data: INITIAL_AGENTS_DATA.product,
  },
  {
    id: 'engineering',
    type: 'employee',
    position: { x: 560, y: 420 },
    data: INITIAL_AGENTS_DATA.engineering,
  },
  {
    id: 'revenue',
    type: 'employee',
    position: { x: 820, y: 420 },
    data: INITIAL_AGENTS_DATA.revenue,
  },
];

export const INITIAL_EDGES: Edge[] = [
  { id: 'e-founder-ceo', source: 'founder', target: 'ceo', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-ceo-strategy', source: 'ceo', target: 'strategy', animated: false, style: { stroke: '#4b5563', strokeWidth: 2 } },
  { id: 'e-ceo-product', source: 'ceo', target: 'product', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-ceo-engineering', source: 'ceo', target: 'engineering', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-ceo-revenue', source: 'ceo', target: 'revenue', animated: false, style: { stroke: '#4b5563', strokeWidth: 2 } },
];

function InnerCompanyGraph({ 
  agents,
  nodes: externalNodes,
  edges: externalEdges,
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
  onSelectAgent,
  onEditAgent,
  onDeleteAgent,
  onAddAgent,
  onSaveHierarchy,
  onResetLayout,
  isRestructuring,
  onToggleRestructuring,
  onEventReceived
}: { 
  agents: Record<string, AgentData>;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onSelectAgent?: (agent: AgentData) => void;
  onEditAgent?: (agent: AgentData) => void;
  onDeleteAgent?: (agentId: string) => void;
  onAddAgent?: () => void;
  onSaveHierarchy?: () => void;
  onResetLayout?: () => void;
  isRestructuring: boolean;
  onToggleRestructuring: () => void;
  onEventReceived?: (eventData: any) => void;
}) {
  const nodeTypes = useMemo(() => ({ employee: EmployeeNode }), []);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // WebSocket Connection with dynamic host
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        setWsStatus('connecting');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname || 'localhost';
        const wsUrl = `${protocol}//${host}:8003/ws/events`;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => setWsStatus('connected');
        ws.onclose = () => {
          setWsStatus('disconnected');
          reconnectTimeout = setTimeout(connect, 4000);
        };
        ws.onerror = () => setWsStatus('disconnected');

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onEventReceived) {
              onEventReceived(data);
            }
          } catch (err) {
            console.error('Failed to parse websocket event', err);
          }
        };
      } catch (e) {
        setWsStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [onEventReceived]);

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 });
    }, 250);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <div className="relative w-full h-full bg-[#0b0f19] select-none">
      {/* Top Floating Canvas Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-[#131722]/90 backdrop-blur-md border border-gray-800/80 rounded-xl px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2 pr-2 border-r border-gray-800">
          <span className={`w-2 h-2 rounded-full ${
            wsStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : wsStatus === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
          }`} />
          <span className="text-[11px] font-mono text-gray-300 capitalize">
            {wsStatus === 'connected' ? 'Live Bus' : wsStatus}
          </span>
        </div>

        {/* Restructure Org Toggle Button */}
        <button 
          onClick={onToggleRestructuring}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all active:scale-95 ${
            isRestructuring 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' 
              : 'bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50 hover:text-white'
          }`}
        >
          <GitBranch size={13} />
          <span>{isRestructuring ? 'Exit Restructure' : 'Restructure Org'}</span>
        </button>

        {isRestructuring && (
          <>
            <button 
              onClick={onAddAgent}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-all active:scale-95"
            >
              <UserPlus size={13} />
              <span>Add Agent</span>
            </button>

            <button 
              onClick={onResetLayout}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-all active:scale-95"
              title="Auto arrange nodes"
            >
              <RotateCcw size={12} />
              <span>Reset Layout</span>
            </button>

            <button 
              onClick={onSaveHierarchy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Save size={13} />
              <span>Save Org</span>
            </button>
          </>
        )}

        <div className="h-4 w-[1px] bg-gray-800 mx-0.5 hidden sm:block" />

        <button 
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-700/80 rounded-lg transition-all active:scale-95"
          title="Center all nodes"
        >
          <Maximize2 size={13} />
          <span className="hidden sm:inline">Fit View</span>
        </button>

        <button 
          onClick={() => zoomIn({ duration: 300 })}
          className="p-1 text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-700/80 rounded-lg transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>

        <button 
          onClick={() => zoomOut({ duration: 300 })}
          className="p-1 text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-700/80 rounded-lg transition-all active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
      </div>

      {isRestructuring && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2">
          <span>🛠 Drag nodes to reposition. Connect node handles to reassign managers. Click Edit on any card to restructure role/model.</span>
        </div>
      )}

      <ReactFlow
        nodes={externalNodes}
        edges={externalEdges}
        onNodesChange={externalOnNodesChange}
        onEdgesChange={externalOnEdgesChange}
        onConnect={externalOnConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (!isRestructuring) {
            onSelectAgent?.(node.data as any);
          }
        }}
        fitView
        className="dark"
        minZoom={0.15}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-[#131722] !border-gray-800 !fill-gray-300 !text-gray-300 !rounded-xl !overflow-hidden !shadow-2xl" />
      </ReactFlow>
    </div>
  );
}

export default function CompanyGraph(props: any) {
  return (
    <ReactFlowProvider>
      <InnerCompanyGraph {...props} />
    </ReactFlowProvider>
  );
}
