import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-[0.2em] text-nova-cyan uppercase">
            Mission Control
          </h1>
          <p className="text-white/40 mt-2 tracking-widest uppercase text-xs">
            Ecosystem Operating System v1.0
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: '0' },
            { label: 'Premium Users', value: '0' },
            { label: 'Active Surveys', value: '0' },
            { label: 'Pending Posts', value: '0' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                {stat.label}
              </div>
              <div className="text-3xl font-black text-nova-cyan">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-10 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
          <div className="text-center">
             <div className="text-nova-cyan/20 text-6xl mb-4">
                <span className="animate-pulse">◌</span>
             </div>
             <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Systems Ready</h2>
             <p className="text-white/30 text-sm">Waiting for incoming ecosystem signals...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
