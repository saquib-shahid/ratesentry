import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Users, ShieldAlert } from 'lucide-react';

const API_BASE = 'http://localhost:3000/admin';

interface Stats {
  clients: number;
  rules: number;
}

interface Client {
  id: string;
  name: string;
  apiKey: string;
  tier: { name: string; requestsPerMin: number };
}

interface Rule {
  id: string;
  type: string;
  ipAddress: string | null;
  clientId: string | null;
}

function App() {
  const [stats, setStats] = useState<Stats>({ clients: 0, rules: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [{ data: statsData }, { data: clientsData }, { data: rulesData }] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/clients`),
        axios.get(`${API_BASE}/rules`)
      ]);
      setStats(statsData);
      setClients(clientsData);
      setRules(rulesData);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Activity className="text-blue-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">RateSentry Dashboard</h1>
              <p className="text-slate-400 text-sm">Distributed Rate Limiter Service</p>
            </div>
          </div>
          <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 transition rounded-lg text-sm font-medium border border-slate-600">
            Open Prometheus
          </a>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 rounded-full">
              <Users className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.clients}</div>
              <div className="text-slate-400 text-sm uppercase tracking-wider mt-1">Active Clients</div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="p-4 bg-rose-500/20 rounded-full">
              <ShieldAlert className="text-rose-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.rules}</div>
              <div className="text-slate-400 text-sm uppercase tracking-wider mt-1">Access Rules (Block/Allow)</div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <Activity className="text-emerald-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">1ms</div>
              <div className="text-slate-400 text-sm uppercase tracking-wider mt-1">Avg Redis Latency</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Clients Table */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Managed API Clients
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Tier</th>
                    <th className="pb-3 font-medium">Limit</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {clients.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-slate-500">No clients configured.</td></tr>
                  ) : clients.map(client => (
                    <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-slate-200">{client.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{client.apiKey.substring(0, 10)}...</div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {client.tier.name}
                        </span>
                      </td>
                      <td className="py-4">
                        {client.tier.requestsPerMin === -1 ? 'Unlimited' : `${client.tier.requestsPerMin}/min`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rules Table */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Active Security Rules
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rules.length === 0 ? (
                    <tr><td colSpan={2} className="py-8 text-center text-slate-500">No active rules.</td></tr>
                  ) : rules.map(rule => (
                    <tr key={rule.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                      <td className="py-4 pr-4">
                        {rule.type === 'BLACKLIST' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            BLACKLIST
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            WHITELIST
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-slate-300 font-mono text-sm">
                        {rule.ipAddress ? `IP: ${rule.ipAddress}` : `API Key ID: ${rule.clientId}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
