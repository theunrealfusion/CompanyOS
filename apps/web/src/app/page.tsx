"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection 
} from "@xyflow/react";
import CompanyGraph, { 
  AgentData, 
  INITIAL_AGENTS_DATA, 
  INITIAL_NODES, 
  INITIAL_EDGES 
} from "./components/CompanyGraph";
import AgentDrawer from "./components/AgentDrawer";
import TaskModal from "./components/TaskModal";
import OrgRestructureModal from "./components/OrgRestructureModal";
import EventsFeed, { EventLog } from "./components/EventsFeed";
import AgentsView from "./components/views/AgentsView";
import WorkflowsView from "./components/views/WorkflowsView";
import MetricsView from "./components/views/MetricsView";
import SettingsView from "./components/views/SettingsView";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  BarChart2, 
  Menu, 
  X, 
  Play, 
  Pause, 
  Zap, 
  Radio, 
  CheckCircle2,
  Sparkles,
  RefreshCw,
  GitBranch,
  UserPlus,
  Save
} from "lucide-react";

type NavTab = "command-center" | "agents" | "workflows" | "metrics" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("command-center");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Agents State
  const [agents, setAgents] = useState<Record<string, AgentData>>(INITIAL_AGENTS_DATA);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);

  // Graph Nodes & Edges State
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Restructure Organization State
  const [isRestructuring, setIsRestructuring] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgModalMode, setOrgModalMode] = useState<'add' | 'edit'>('add');
  const [agentToEdit, setAgentToEdit] = useState<AgentData | null>(null);

  // Modals & Panels
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalTarget, setTaskModalTarget] = useState("ceo");
  const [eventsFeedOpen, setEventsFeedOpen] = useState(false);
  const [events, setEvents] = useState<EventLog[]>([
    {
      id: "evt-init-1",
      time: "Just now",
      type: "SystemInitialized",
      message: "CompanyOS event stream connected to agent message gateway.",
    }
  ]);

  // Operational Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("ae5ecdc5-0a51-4589-98d6-fe7a4362d559");

  // Load Saved Hierarchy and Company from DB on mount
  useEffect(() => {
    const fetchCompanyAndHierarchy = async () => {
      try {
        const host = window.location.hostname || "localhost";
        const backendUrl = `http://${host}:8003`;
        
        // 1. Get companies
        const res = await fetch(`${backendUrl}/api/v1/companies/`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const activeId = data[0].id;
            setCompanyId(activeId);

            // 2. Fetch saved hierarchy
            const hierRes = await fetch(`${backendUrl}/api/v1/companies/${activeId}/hierarchy`);
            if (hierRes.ok) {
              const hier = await hierRes.json();
              if (hier && hier.nodes && hier.nodes.length > 0) {
                setNodes(hier.nodes);
                if (hier.edges) setEdges(hier.edges);
                
                // Also reconstruct agents record
                const newAgents: Record<string, AgentData> = {};
                hier.nodes.forEach((n: Node) => {
                  newAgents[n.id] = n.data as any;
                });
                setAgents(newAgents);
              }
            }
          }
        }
      } catch (err) {
        console.log("Using default initial company structure", err);
      }
    };
    fetchCompanyAndHierarchy();
  }, [setNodes, setEdges]);

  // Update nodes with handlers & restructuring flag
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isRestructuring,
          onSelect: (agentData: AgentData) => setSelectedAgent(agentData),
          onEdit: (agentData: AgentData) => {
            setAgentToEdit(agentData);
            setOrgModalMode('edit');
            setOrgModalOpen(true);
          },
          onDelete: (agentId: string) => handleDeleteAgent(agentId),
        }
      }))
    );
  }, [isRestructuring, setNodes]);

  // Handle incoming event from WebSocket in Graph
  const handleEventReceived = useCallback((evtData: any) => {
    const payload = evtData.payload || evtData;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let message = `Event ${evtData.type || 'Activity'} received`;
    if (evtData.type === "AgentStatusChanged") {
      message = `${payload.agent?.toUpperCase()} transitioned to ${payload.status} (${payload.task || 'No active task'})`;
      
      // Update agent state
      setAgents((prev) => {
        const target = prev[payload.agent];
        if (!target) return prev;
        return {
          ...prev,
          [payload.agent]: {
            ...target,
            status: payload.status || target.status,
            task: payload.task !== undefined ? payload.task : target.task,
          }
        };
      });

      // Update Node
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === payload.agent) {
            return {
              ...n,
              data: {
                ...n.data,
                status: payload.status || (n.data as any).status,
                task: payload.task !== undefined ? payload.task : (n.data as any).task,
              }
            };
          }
          return n;
        })
      );

      // Animate Edge
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.target === payload.agent || edge.source === payload.agent) {
            return {
              ...edge,
              animated: payload.status === 'WORKING',
              style: {
                ...edge.style,
                stroke: payload.status === 'WORKING' ? '#3b82f6' : '#4b5563',
              }
            };
          }
          return edge;
        })
      );
    } else if (evtData.type === "TaskCreated") {
      message = `Task delegated from ${payload.from?.toUpperCase()} to ${payload.to?.toUpperCase()}: "${payload.task}"`;
    }

    setEvents((prev) => [
      {
        id: `evt-${Date.now()}-${Math.random()}`,
        time: now,
        type: evtData.type || "LiveEvent",
        message,
        agent: payload.agent,
      },
      ...prev.slice(0, 49)
    ]);
  }, [setNodes, setEdges]);

  // Connect edge in React Flow
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}`,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          },
          eds
        )
      );
      setBanner(`New reporting line established: ${connection.source} → ${connection.target}`);
      setTimeout(() => setBanner(null), 3000);
    },
    [setEdges]
  );

  // Save Hierarchy to PostgreSQL
  const handleSaveHierarchy = async () => {
    try {
      const host = window.location.hostname || "localhost";
      const payload = {
        nodes,
        edges,
        timestamp: new Date().toISOString()
      };

      const res = await fetch(`http://${host}:8003/api/v1/companies/${companyId}/hierarchy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBanner("Organization structure permanently saved to CompanyOS database!");
        setTimeout(() => setBanner(null), 4000);
      } else {
        alert("Failed to save organization hierarchy: " + (await res.text()));
      }
    } catch (err: any) {
      alert("Error saving hierarchy: " + err.message);
    }
  };

  // Add or Edit Agent in Hierarchy
  const handleSaveAgent = (agentData: Partial<AgentData>, managerId?: string) => {
    const agentId = agentData.id!;
    const isNew = !agents[agentId];

    const completeAgent: AgentData = {
      id: agentId,
      name: agentData.name || 'New Agent',
      role: agentData.role || 'Specialist',
      department: agentData.department || 'Operations',
      status: (agentData.status as any) || 'IDLE',
      task: agentData.task || 'Awaiting instructions',
      icon: agentData.icon || 'strategy',
      model: agentData.model || 'Gemini 1.5 Pro',
      runtime: agentData.runtime || 'CompanyOS Native',
      costPerHour: agentData.costPerHour || '₹60.00',
      permissionLevel: agentData.permissionLevel || 'L3 Execute',
      metrics: agentData.metrics || { efficiency: 90, tasks: 0 },
    };

    setAgents((prev) => ({
      ...prev,
      [agentId]: completeAgent,
    }));

    if (isNew) {
      // Find position for new node
      const parentNode = nodes.find((n) => n.id === managerId);
      const parentPos = parentNode ? parentNode.position : { x: 400, y: 250 };
      const newX = parentPos.x + (Math.random() * 200 - 100);
      const newY = parentPos.y + 180;

      const newNode: Node = {
        id: agentId,
        type: 'employee',
        position: { x: newX, y: newY },
        data: completeAgent,
      };

      setNodes((nds) => [...nds, newNode]);

      // Add edge from manager
      if (managerId) {
        const newEdge: Edge = {
          id: `e-${managerId}-${agentId}`,
          source: managerId,
          target: agentId,
          animated: false,
          style: { stroke: '#4b5563', strokeWidth: 2 }
        };
        setEdges((eds) => [...eds, newEdge]);
      }

      setBanner(`New agent ${completeAgent.role} created and integrated into org!`);
    } else {
      // Update existing node
      setNodes((nds) =>
        nds.map((n) => (n.id === agentId ? { ...n, data: completeAgent } : n))
      );

      // If manager changed, update edge
      if (managerId) {
        setEdges((eds) => {
          const filtered = eds.filter((e) => e.target !== agentId);
          return [
            ...filtered,
            {
              id: `e-${managerId}-${agentId}`,
              source: managerId,
              target: agentId,
              animated: false,
              style: { stroke: '#4b5563', strokeWidth: 2 }
            }
          ];
        });
      }

      setBanner(`Agent ${completeAgent.role} restructured successfully.`);
    }

    setTimeout(() => setBanner(null), 3500);
  };

  // Delete Agent from Hierarchy
  const handleDeleteAgent = (agentId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== agentId));
    setEdges((eds) => eds.filter((e) => e.source !== agentId && e.target !== agentId));
    setAgents((prev) => {
      const copy = { ...prev };
      delete copy[agentId];
      return copy;
    });

    setBanner(`Agent removed from organization.`);
    setTimeout(() => setBanner(null), 3000);
  };

  // Reset / Auto-layout Graph
  const handleResetLayout = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setAgents(INITIAL_AGENTS_DATA);
    setBanner("Organization hierarchy reset to standard multi-tier executive layout.");
    setTimeout(() => setBanner(null), 3000);
  };

  // Trigger Simulation via FastAPI backend
  const triggerSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setBanner("Autonomous Business Cycle initiated! Watch agents collaborate live.");

    try {
      const host = window.location.hostname || "localhost";
      const res = await fetch(`http://${host}:8003/api/v1/companies/${companyId}/simulate`, {
        method: "POST"
      });

      if (!res.ok) {
        throw new Error("Backend response error");
      }

      handleEventReceived({
        type: "SimulationTriggered",
        payload: {
          agent: "ceo",
          status: "WORKING",
          task: "Reviewing company strategy and market opportunities"
        }
      });
    } catch (err) {
      console.error("Simulation fallback trigger", err);
      // Fallback local simulation sequence
      setTimeout(() => {
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "ceo", status: "WORKING", task: "Reviewing strategy & dispatching research" }
        });
      }, 1000);

      setTimeout(() => {
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "strategy", status: "WORKING", task: "Researching AI GPU SaaS market demand" }
        });
      }, 3000);

      setTimeout(() => {
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "product", status: "WORKING", task: "Synthesizing PRD for GPU optimization engine" }
        });
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "strategy", status: "IDLE", task: "Research complete" }
        });
      }, 6000);

      setTimeout(() => {
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "engineering", status: "WORKING", task: "Implementing core model router & testing vLLM" }
        });
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "product", status: "IDLE", task: "PRD validated" }
        });
      }, 9000);

      setTimeout(() => {
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "revenue", status: "WORKING", task: "Processing first inbound customer ₹18,500" }
        });
        handleEventReceived({
          type: "AgentStatusChanged",
          payload: { agent: "engineering", status: "IDLE", task: "Build deployed to production" }
        });
      }, 13000);
    }

    setTimeout(() => {
      setIsSimulating(false);
      setBanner(null);
    }, 15000);
  };

  // Toggle Single Agent Status
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents((prev) => {
      const a = prev[agentId];
      if (!a) return prev;
      const nextStatus = a.status === "WORKING" ? "IDLE" : "WORKING";
      const updated = { ...a, status: nextStatus as any };

      if (selectedAgent && selectedAgent.id === agentId) {
        setSelectedAgent(updated);
      }

      handleEventReceived({
        type: "AgentStatusChanged",
        payload: {
          agent: agentId,
          status: nextStatus,
          task: nextStatus === "WORKING" ? a.task || "Active execution" : "Paused",
        }
      });

      return { ...prev, [agentId]: updated };
    });
  };

  // Dispatch New Task from Modal
  const handleDispatchTask = (agentId: string, taskDirective: string) => {
    setAgents((prev) => {
      const a = prev[agentId];
      if (!a) return prev;
      const updated = {
        ...a,
        status: "WORKING" as any,
        task: taskDirective,
        metrics: {
          ...a.metrics,
          tasks: a.metrics.tasks + 1,
        }
      };

      if (selectedAgent && selectedAgent.id === agentId) {
        setSelectedAgent(updated);
      }

      handleEventReceived({
        type: "TaskCreated",
        payload: { from: "founder", to: agentId, task: taskDirective }
      });

      handleEventReceived({
        type: "AgentStatusChanged",
        payload: { agent: agentId, status: "WORKING", task: taskDirective }
      });

      return { ...prev, [agentId]: updated };
    });

    setBanner(`Directive dispatched to ${agentId.toUpperCase()}: "${taskDirective.slice(0, 45)}..."`);
    setTimeout(() => setBanner(null), 4000);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "command-center", label: "Command Center", icon: <LayoutDashboard size={19} /> },
    { id: "agents", label: "Agents", icon: <Users size={19} /> },
    { id: "workflows", label: "Workflows & Approvals", icon: <GitBranch size={19} />, badge: "1" },
    { id: "metrics", label: "Economics & Revenue", icon: <BarChart2 size={19} /> },
    { id: "settings", label: "Settings", icon: <Settings size={19} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-white overflow-hidden font-sans">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar (Desktop Docked + Mobile Slide-out Drawer) */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0d111c] border-r border-gray-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div 
            onClick={() => {
              setActiveTab("command-center");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center font-extrabold text-base shadow-lg shadow-blue-600/30 text-white">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">CompanyOS</h1>
              <p className="text-[10px] font-mono text-gray-400">Autonomous AI Operating System</p>
            </div>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-98 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Org & Simulation Actions in Sidebar */}
        <div className="p-3.5 border-t border-gray-800 space-y-2">
          <button
            onClick={() => {
              setActiveTab("command-center");
              setIsRestructuring(!isRestructuring);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isRestructuring 
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20' 
                : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <GitBranch size={14} />
            <span>{isRestructuring ? "Exit Restructuring" : "Restructure Org"}</span>
          </button>

          <button
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Simulating Loop...</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-current" />
                <span>Run Autonomous Demo</span>
              </>
            )}
          </button>
          
          <div className="text-[10px] text-center text-gray-500 font-mono">
            CompanyOS v0.1.0 • Multi-Agent Loop
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Universal Top Header */}
        <header className="h-16 border-b border-gray-800 flex items-center px-4 md:px-8 justify-between bg-[#0d111c]/90 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white bg-gray-800/60 rounded-xl transition-colors active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-base md:text-lg font-bold tracking-tight text-white capitalize">
                {activeTab === "command-center" ? "Company Command Center" : activeTab.replace("-", " ")}
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                <span>Autonomous Hierarchy</span>
                <span>•</span>
                <span className="font-mono text-blue-400">{nodes.length} Active Agents</span>
                {isRestructuring && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Restructure Mode Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Restructure Org Button in Header */}
            {activeTab === "command-center" && (
              <button
                onClick={() => setIsRestructuring(!isRestructuring)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                  isRestructuring
                    ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-gray-800/80 text-blue-300 border-blue-500/30 hover:bg-blue-600/20"
                }`}
              >
                <GitBranch size={13} />
                <span className="hidden sm:inline">{isRestructuring ? "Exit Edit" : "Restructure Org"}</span>
              </button>
            )}

            {/* Quick Dispatch Task */}
            <button
              onClick={() => {
                setTaskModalTarget("ceo");
                setTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700/80 text-xs font-semibold rounded-xl transition-all active:scale-95"
            >
              <Zap size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Dispatch</span> Task
            </button>

            {/* Run Demo Button in Header */}
            <button
              onClick={triggerSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSimulating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Play size={13} className="fill-current" />
              )}
              <span className="hidden sm:inline">Run</span> Demo
            </button>

            {/* Events Feed Toggle Button */}
            <button
              onClick={() => setEventsFeedOpen(!eventsFeedOpen)}
              className="relative p-2 text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
              title="Toggle Live Event Stream"
            >
              <Activity size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
            </button>
          </div>
        </header>

        {/* Notification / Simulation Banner */}
        {banner && (
          <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-700/50 px-4 py-2 text-xs text-blue-100 flex items-center justify-between z-20 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-300 animate-pulse" />
              <span className="font-medium">{banner}</span>
            </div>
            <button onClick={() => setBanner(null)} className="text-blue-300 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* View Switcher Container */}
        <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col">
          {activeTab === "command-center" && (
            <div className="w-full h-full relative">
              <CompanyGraph 
                agents={agents}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectAgent={(agent: AgentData) => setSelectedAgent(agent)}
                onEditAgent={(agent: AgentData) => {
                  setAgentToEdit(agent);
                  setOrgModalMode('edit');
                  setOrgModalOpen(true);
                }}
                onDeleteAgent={handleDeleteAgent}
                onAddAgent={() => {
                  setOrgModalMode('add');
                  setAgentToEdit(null);
                  setOrgModalOpen(true);
                }}
                onSaveHierarchy={handleSaveHierarchy}
                onResetLayout={handleResetLayout}
                isRestructuring={isRestructuring}
                onToggleRestructuring={() => setIsRestructuring(!isRestructuring)}
                onEventReceived={handleEventReceived}
              />
            </div>
          )}

          {activeTab === "agents" && (
            <AgentsView 
              agents={agents}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              onToggleStatus={handleToggleAgentStatus}
              onDispatchTask={(agentId) => {
                setTaskModalTarget(agentId);
                setTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === "workflows" && (
            <WorkflowsView 
              onRunWorkflow={triggerSimulation}
            />
          )}

          {activeTab === "metrics" && (
            <MetricsView />
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </div>

        {/* Agent Profile Slide-Over Drawer */}
        <AgentDrawer
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onToggleStatus={(agentId) => handleToggleAgentStatus(agentId)}
          onAssignTask={(agentId) => {
            setSelectedAgent(null);
            setTaskModalTarget(agentId);
            setTaskModalOpen(true);
          }}
        />

        {/* Organization Restructure Modal (Add / Edit Agent) */}
        <OrgRestructureModal
          isOpen={orgModalOpen}
          mode={orgModalMode}
          agent={agentToEdit}
          existingAgents={Object.values(agents)}
          onClose={() => setOrgModalOpen(false)}
          onSaveAgent={handleSaveAgent}
          onDeleteAgent={handleDeleteAgent}
        />

        {/* Dispatch Task Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          defaultAgent={taskModalTarget}
          onClose={() => setTaskModalOpen(false)}
          onSubmit={handleDispatchTask}
        />

        {/* Live Events Stream Drawer */}
        <EventsFeed
          isOpen={eventsFeedOpen}
          onClose={() => setEventsFeedOpen(false)}
          events={events}
        />
      </main>
    </div>
  );
}
