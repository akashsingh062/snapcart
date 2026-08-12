"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2, MapPin } from "lucide-react";

interface LiveTrackingMapProps {
  userLocation: [number, number];
  driverLocation?: [number, number] | null;
  customerName?: string;
  driverName?: string;
  fullAddress?: string;
}

const LiveTrackingMapInner = dynamic(
  () => import("./LiveTrackingMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-87.5 bg-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 border border-slate-200">
        <Loader2 size={32} className="animate-spin text-emerald-700" />
        <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
          <MapPin size={14} className="text-emerald-700" />
          Loading Live Map...
        </p>
      </div>
    ),
  }
);

export default function LiveTrackingMap(props: LiveTrackingMapProps) {
  return <LiveTrackingMapInner {...props} />;
}
