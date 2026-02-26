import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle } from '../context/AppContext';

// Fix for default marker icons in React-Leaflet
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons based on status
const createStatusIcon = (status: 'low' | 'moderate' | 'high') => {
  const color = status === 'high' ? 'red' : status === 'moderate' ? 'yellow' : 'green';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ${status === 'high' ? 'animation: pulse 2s infinite;' : ''}
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface VehicleMapProps {
  vehicles: Vehicle[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onVehicleClick?: (vehicleId: string) => void;
  singleVehicle?: Vehicle;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

export const VehicleMap: React.FC<VehicleMapProps> = ({
  vehicles,
  center,
  zoom = 13,
  height = '400px',
  onVehicleClick,
  singleVehicle,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center from vehicles if not provided
  const mapCenter: [number, number] = center || (vehicles.length > 0
    ? [
        vehicles.reduce((sum, v) => sum + v.location.lat, 0) / vehicles.length,
        vehicles.reduce((sum, v) => sum + v.location.lng, 0) / vehicles.length,
      ]
    : [28.6139, 77.2090] // Default to Delhi
  );

  // Use single vehicle location if provided
  const displayVehicles = singleVehicle ? [singleVehicle] : vehicles;

  // Don't render if no vehicles to display
  if (!singleVehicle && displayVehicles.length === 0) {
    return (
      <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.3)' }}>
        <p style={{ color: 'white', opacity: 0.7 }}>No vehicles to display on map</p>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <style>{`
        .leaflet-container {
          background: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-tile-container img {
          filter: brightness(0.7) contrast(1.2);
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
        }
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          background: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-control-zoom a {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
      <MapContainer
        center={singleVehicle ? [singleVehicle.location.lat, singleVehicle.location.lng] : mapCenter}
        zoom={singleVehicle ? 15 : zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!singleVehicle && <MapUpdater center={mapCenter} zoom={zoom} />}
        
        {displayVehicles.map((vehicle) => {
          const vehicleId = vehicle.id || vehicle._id || '';
          return (
            <Marker
              key={vehicleId}
              position={[vehicle.location.lat, vehicle.location.lng]}
              icon={createStatusIcon(vehicle.status)}
              eventHandlers={{
                click: () => {
                  if (onVehicleClick) {
                    onVehicleClick(vehicleId);
                  }
                },
              }}
            >
              <Popup>
                <div style={{ color: 'white', minWidth: '150px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{vehicle.number}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                    {vehicle.owner}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Emission: <span style={{ 
                      color: vehicle.status === 'high' ? '#ef4444' : 
                             vehicle.status === 'moderate' ? '#eab308' : '#22c55e',
                      fontWeight: 'bold'
                    }}>
                      {vehicle.currentEmission} ppm
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    Status: {vehicle.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

