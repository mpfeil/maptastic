import type { LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";

export function Map({ height, data, center }: { height: string, data: any, center: any }) {
  const position: LatLngTuple = (center) ? [center.geometry.coordinates[1], center.geometry.coordinates[0]] : [52, 7];

  return (
    <div style={{ height }}>
      <MapContainer
        style={{
          height: "100%",
        }}
        center={position}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          data ? <GeoJSON key={data.name} data={data} eventHandlers={{
            click: (e) => {
              console.log('marker clicked', e)
            },
          }}/> : null
        }
        
        {/* <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
      </MapContainer>
    </div>
  );
}