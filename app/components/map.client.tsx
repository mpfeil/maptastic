import type { LatLngTuple } from "leaflet";
import { useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMapEvent } from "react-leaflet";

function SetViewOnLayerAdd({ animateRef, position }: { animateRef: any, position: LatLngTuple}) {
  const map = useMapEvent('layeradd', (e) => {
    map.setView(position, map.getZoom(), {
      animate: animateRef.current || false,
    })
  })

  return null
}

export function Map({ height, data, center }: { height: string, data: any, center: any }) {
  const animateRef = useRef(true)
  const position: LatLngTuple = (center) ? [center.geometry.coordinates[1], center.geometry.coordinates[0]] : [51.95, 7.6];

  return (
    <div style={{ height }}>
      <MapContainer
        style={{
          height: "100%",
        }}
        center={position}
        zoom={12}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          data ? <GeoJSON key={data.name}  data={data} eventHandlers={{
            click: (e) => {
              console.log('marker clicked', e)
            },
          }}/> : null
        }
        <SetViewOnLayerAdd animateRef={animateRef} position={position} />
      </MapContainer>
    </div>
  );
}