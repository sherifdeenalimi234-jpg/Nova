"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const data = [
  { name: '00:00', activity: 400, users: 240 },
  { name: '04:00', activity: 300, users: 139 },
  { name: '08:00', activity: 200, users: 980 },
  { name: '12:00', activity: 278, users: 390 },
  { name: '16:00', activity: 189, users: 480 },
  { name: '20:00', activity: 239, users: 380 },
  { name: '23:59', activity: 349, users: 430 },
];

export default function EcosystemVitality() {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#ffffff40"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#ffffff40"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          />
          <Area
            type="monotone"
            dataKey="activity"
            stroke="#00f2ff"
            fillOpacity={1}
            fill="url(#colorActivity)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
