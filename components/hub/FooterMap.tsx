"use client";

import React, { useEffect, useState } from "react";
import { MapPin, ShieldAlert } from "lucide-react";

const FooterMap = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return (
    <footer className="px-6 py-10 pb-32 border-t border-white/5 bg-gradient-to-b from-transparent to-black/80">
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">Platform Geographic Node</h3>
        <p className="text-sm text-white/50">Your connection point to the global innovation network.</p>
      </div>

      <div className="relative h-64 w-full rounded-2xl overflow-hidden glass border-white/20">
        {!location && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-2 border-nova-cyan/20 border-t-nova-cyan rounded-full animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest text-white/60">Requesting Satellite Link...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-950/20">
            <ShieldAlert className="text-red-500 mb-4" size={32} />
            <h4 className="font-bold mb-2 uppercase text-xs tracking-widest">Location Required</h4>
            <p className="text-xs text-white/50 mb-6">Enable location services to establish your geographic node in the NOVA ecosystem.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest"
            >
              Retry Connection
            </button>
          </div>
        )}

        {location && (
          <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
             {/* Mock Map UI */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/0,0,1,0/1000x1000?access_token=none')] bg-cover" />
             <div className="relative">
                <div className="absolute -inset-4 bg-nova-cyan/20 rounded-full animate-ping" />
                <div className="relative bg-nova-cyan p-2 rounded-full shadow-[0_0_15px_#00f2ff]">
                   <MapPin size={16} className="text-black" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap glass px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  You are here
                </div>
             </div>

             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                   <div className="text-[8px] uppercase tracking-widest text-white/40">Coordinates</div>
                   <div className="text-[10px] font-mono text-nova-cyan">
                     {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                   </div>
                </div>
                <div className="text-[8px] uppercase tracking-widest text-nova-green">Secure Connection</div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4">
           <div className="w-4 h-4 bg-nova-cyan/50 rounded-sm" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">NOVA COMMUNITY &copy; 2025</p>
      </div>
    </footer>
  );
};

export default FooterMap;
