"use client";

import React, { useEffect } from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  Polyline as RLPolyline,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MapContainer = RLMapContainer as any;
const TileLayer = RLTileLayer as any;
const Marker = RLMarker as any;
const Popup = RLPopup as any;
const Polyline = RLPolyline as any;

const customerHomeIcon =
  typeof window !== "undefined"
    ? (L as any).divIcon({
        className: "custom-user-marker-icon",
        html: `
          <div style="
            background: linear-gradient(135deg, #e11d48, #be123c);
            color: white;
            padding: 8px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(225, 29, 72, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -22],
      })
    : null;

const driverBikeIcon =
  typeof window !== "undefined"
    ? (L as any).divIcon({
        className: "custom-bike-marker-icon",
        html: `
          <div style="
            background: linear-gradient(135deg, #059669, #0d9488);
            color: white;
            padding: 8px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(5, 150, 105, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18.5" cy="17.5" r="3.5"/>
              <circle cx="5.5" cy="17.5" r="3.5"/>
              <circle cx="15" cy="5" r="1"/>
              <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
            </svg>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -22],
      })
    : null;

function FitBounds({
  userLoc,
  driverLoc,
}: {
  userLoc: [number, number];
  driverLoc?: [number, number] | null;
}) {
  const map = useMap();

  const userLat = userLoc?.[0];
  const userLng = userLoc?.[1];
  const driverLat = driverLoc?.[0];
  const driverLng = driverLoc?.[1];

  useEffect(() => {
    if (userLat && userLng && driverLat && driverLng) {
      const bounds = L.latLngBounds([
        [userLat, userLng],
        [driverLat, driverLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (userLat && userLng) {
      map.setView([userLat, userLng], 15);
    }
  }, [userLat, userLng, driverLat, driverLng, map]);

  return null;
}

function MapControls({
  userLoc,
  driverLoc,
}: {
  userLoc: [number, number];
  driverLoc?: [number, number] | null;
}) {
  const map = useMap();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== "undefined") {
      (L as any).DomEvent.disableClickPropagation(containerRef.current);
      (L as any).DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  const handleCenterUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (userLoc?.[0] && userLoc?.[1]) {
      map.flyTo(userLoc, 16, { animate: true, duration: 1 });
    }
  };

  const handleCenterDriver = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (driverLoc?.[0] && driverLoc?.[1]) {
      map.flyTo(driverLoc, 16, { animate: true, duration: 1 });
    }
  };

  const handleFitBoth = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (userLoc && driverLoc && driverLoc[0] && driverLoc[1]) {
      const bounds = L.latLngBounds([userLoc, driverLoc]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    } else if (userLoc) {
      map.flyTo(userLoc, 16, { animate: true, duration: 1 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="leaflet-bottom leaflet-right mb-4! mr-4! z-9999 flex flex-col gap-2 pointer-events-auto"
      style={{ zIndex: 9999, pointerEvents: "auto" }}
    >
      {driverLoc && (
        <button
          type="button"
          onClick={handleFitBoth}
          title="Recenter Map View (Fit Both)"
          className="bg-white hover:bg-emerald-50 active:scale-95 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Fit Both</span>
        </button>
      )}

      {driverLoc && (
        <button
          type="button"
          onClick={handleCenterDriver}
          title="Center on Delivery Partner"
          className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>🚚 Driver</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleCenterUser}
        title="Center on Customer Location"
        className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <span>🏡 Customer</span>
      </button>
    </div>
  );
}

interface LiveTrackingMapInnerProps {
  userLocation: [number, number];
  driverLocation?: [number, number] | null;
  customerName?: string;
  driverName?: string;
  fullAddress?: string;
}

export default function LiveTrackingMapInner({
  userLocation,
  driverLocation,
  customerName = "Customer Address",
  driverName = "Delivery Partner",
  fullAddress,
}: LiveTrackingMapInnerProps) {
  const centerPos = driverLocation || userLocation;

  return (
    <div className="relative w-full h-full min-h-87.5 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={centerPos}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds userLoc={userLocation} driverLoc={driverLocation} />

        {/* Customer Location Marker */}
        <Marker position={userLocation} icon={customerHomeIcon}>
          <Popup>
            <div className="text-xs space-y-1 p-0.5">
              <p className="font-bold text-slate-900">📍 {customerName}</p>
              {fullAddress && <p className="text-slate-600">{fullAddress}</p>}
            </div>
          </Popup>
        </Marker>

        {/* Driver Live Marker (if available) */}
        {driverLocation && (
          <Marker position={driverLocation} icon={driverBikeIcon}>
            <Popup>
              <div className="text-xs space-y-1 p-0.5">
                <p className="font-bold text-emerald-800">🚚 {driverName}</p>
                <p className="text-emerald-600 font-semibold">
                  On the way to deliver
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Polyline connect path if driver location is available */}
        {driverLocation && (
          <Polyline
            positions={[driverLocation, userLocation]}
            color="#059669"
            weight={4}
            opacity={0.8}
            dashArray="8, 8"
          />
        )}

        {/* Dynamic Interactive Recenter Controls */}
        <MapControls userLoc={userLocation} driverLoc={driverLocation} />
      </MapContainer>

      {/* Floating Status Badge on Map */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-extrabold text-slate-800 border border-slate-200/80 shadow-md flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live OpenStreetMap Signal</span>
      </div>
    </div>
  );
}
