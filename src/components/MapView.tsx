import React, { useEffect } from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MapContainer = RLMapContainer as any;
const TileLayer = RLTileLayer as any;
const Marker = RLMarker as any;
const Popup = RLPopup as any;

// Fix Leaflet marker icon 404 error in Next.js
const customIcon = new (L as any).Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
/* eslint-enable @typescript-eslint/no-explicit-any */

interface MapViewProps {
  position: [number, number] | null;
}

// Component to dynamically re-center map when position changes
function RecenterMap({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(location, 14);
  }, [location, map]);
  return null;
}

const MapView = ({ position }: MapViewProps) => {
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  const center = position || defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <>
          <RecenterMap location={position} />
          <Marker position={position} icon={customIcon}>
            <Popup>Your delivery location</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
};

export default MapView;
