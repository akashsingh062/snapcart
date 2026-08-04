"use client";
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
import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MapContainer = RLMapContainer as any;
const TileLayer = RLTileLayer as any;
const Marker = RLMarker as any;
const Popup = RLPopup as any;

const customIcon =
  typeof window !== "undefined"
    ? new (L as any).Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : null;

function RecenterMap({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 14);
    }
  }, [location, map]);
  return null;
}

export interface AddressType {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

interface DraggableMarkerProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
  address: AddressType;
  setAddress: React.Dispatch<React.SetStateAction<AddressType>>;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  position,
  setPosition,
  address,
  setAddress,
}) => {
  const markerRef = React.useRef<any>(null);

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        }
      },
    }),
    [setPosition]
  );

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const addrData = result.data?.address || {};
        const city =
          addrData.city ||
          addrData.town ||
          addrData.village ||
          addrData.suburb ||
          "";
        const state = addrData.state || "";
        const pincode = addrData.postcode || "";
        const fullAddress = result.data?.display_name || "";

        setAddress((prev: AddressType) => ({
          ...prev,
          fullAddress: fullAddress || prev.fullAddress,
          city: city || prev.city,
          state: state || prev.state,
          pincode: pincode || prev.pincode,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    if (position) {
      fetchAddress();
    }
  }, [position, setAddress]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    >
      <Popup minWidth={90}>
        <div className="text-sm space-y-1">
          {address.fullName && (
            <p className="font-semibold text-gray-900">{address.fullName}</p>
          )}
          {address.fullAddress && <p>{address.fullAddress}</p>}
          {address.city && <p>{address.city}</p>}
          {address.state && <p>{address.state}</p>}
          {address.pincode && <p>{address.pincode}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

interface CheckoutMapProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
  address: AddressType;
  setAddress: React.Dispatch<React.SetStateAction<AddressType>>;
}

const CheckoutMap: React.FC<CheckoutMapProps> = ({
  position,
  setPosition,
  address,
  setAddress,
}) => {
  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap location={position} />
      <DraggableMarker
        position={position}
        setPosition={setPosition}
        address={address}
        setAddress={setAddress}
      />
    </MapContainer>
  );
};

export default CheckoutMap;
