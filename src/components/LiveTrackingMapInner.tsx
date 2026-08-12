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

const userIcon =
  typeof window !== "undefined"
    ? new (L as any).Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
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

  useEffect(() => {
    if (userLoc && driverLoc) {
      const bounds = L.latLngBounds([userLoc, driverLoc]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (userLoc) {
      map.setView(userLoc, 15);
    }
  }, [userLoc, driverLoc, map]);

  return null;
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
        <Marker position={userLocation} icon={userIcon}>
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
      </MapContainer>

      {/* Floating Status Badge on Map */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-extrabold text-slate-800 border border-slate-200/80 shadow-md flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live OpenStreetMap Signal</span>
      </div>
    </div>
  );
}
