import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Custom icons
const getIcon = (type) => {
  const colors = {
    fire: '#F59E0B',
    flood: '#3B82F6',
    earthquake: '#EAB308',
    accident: '#22C55E',
    medical: '#E53935',
    other: '#A855F7'
  };
  const color = colors[type] || colors.other;
  
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const userIcon = L.divIcon({
  className: 'user-icon',
  html: `<div style="background-color: #2563EB; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px #2563EB;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Heatmap Layer Component
const HeatmapLayer = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (!data || data.length === 0) return;
    const points = data.map(inc => [inc.location.coordinates[1], inc.location.coordinates[0], 1]); // lat, lng, intensity
    const heat = L.heatLayer(points, { radius: 25, blur: 15 }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);
  return null;
};

// FitBounds Component
const MapEffects = ({ incidents, center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    } else if (incidents && incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map(inc => [inc.location.coordinates[1], inc.location.coordinates[0]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, incidents, center]);
  return null;
};

// Pick Location Event Tracker
const LocationPicker = ({ onLocationSelect }) => {
  const map = useMap();
  useEffect(() => {
    if(!onLocationSelect) return;
    map.on('click', (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    return () => map.off('click');
  }, [map, onLocationSelect]);
  return null;
};

const MapView = ({ incidents = [], showHeatmap = false, userLocation, onLocationSelect, pickedLocation }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative z-0">
      <MapContainer 
        center={userLocation || defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEffects incidents={incidents} center={userLocation || pickedLocation} />
        {onLocationSelect && <LocationPicker onLocationSelect={onLocationSelect} />}

        {showHeatmap ? (
          <HeatmapLayer data={incidents} />
        ) : (
          incidents.map(inc => (
            <Marker 
              key={inc._id} 
              position={[inc.location.coordinates[1], inc.location.coordinates[0]]}
              icon={getIcon(inc.type)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold">{inc.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{inc.type.toUpperCase()}</p>
                  <p className="text-xs mb-2">{inc.address}</p>
                  <span className={`text-[10px] px-1 py-0.5 rounded text-white ${
                    inc.severity === 'high' ? 'bg-red-500' : inc.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>{inc.severity.toUpperCase()}</span>
                </div>
              </Popup>
            </Marker>
          ))
        )}

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle center={[userLocation.lat, userLocation.lng]} radius={1000} pathOptions={{ color: '#2563EB', fillOpacity: 0.1, weight: 1 }} />
          </>
        )}

        {pickedLocation && (
           <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={getIcon('other')} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
