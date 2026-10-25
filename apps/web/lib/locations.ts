export type Coordinates = { lat: number; lng: number }

export type LocationPlace = Coordinates & {
  name: string
}

export type LocationCountry = {
  name: string
  continent: 'América' | 'Europa' | 'Asia' | 'África' | 'Oceanía'
  places: LocationPlace[]
  bounds?: { north: number; south: number; east: number; west: number }
  disabled?: boolean
}

const guatemala: LocationPlace[] = [
  { name: 'Guatemala', lat: 14.6349, lng: -90.5069 }, { name: 'El Progreso', lat: 14.8542, lng: -90.0147 },
  { name: 'Sacatepéquez', lat: 14.5586, lng: -90.7344 }, { name: 'Chimaltenango', lat: 14.6611, lng: -90.8194 },
  { name: 'Escuintla', lat: 14.3050, lng: -90.7850 }, { name: 'Santa Rosa', lat: 14.2828, lng: -90.3000 },
  { name: 'Sololá', lat: 14.7722, lng: -91.1833 }, { name: 'Totonicapán', lat: 14.9117, lng: -91.3611 },
  { name: 'Quetzaltenango', lat: 14.8347, lng: -91.5180 }, { name: 'Suchitepéquez', lat: 14.5333, lng: -91.5000 },
  { name: 'Retalhuleu', lat: 14.5361, lng: -91.6778 }, { name: 'San Marcos', lat: 14.9653, lng: -91.7956 },
  { name: 'Huehuetenango', lat: 15.3192, lng: -91.4722 }, { name: 'Quiché', lat: 15.0306, lng: -91.1489 },
  { name: 'Baja Verapaz', lat: 15.1028, lng: -90.3206 }, { name: 'Alta Verapaz', lat: 15.4700, lng: -90.3700 },
  { name: 'Petén', lat: 16.9226, lng: -89.8920 }, { name: 'Izabal', lat: 15.7350, lng: -88.5944 },
  { name: 'Zacapa', lat: 14.9722, lng: -89.5306 }, { name: 'Chiquimula', lat: 14.7969, lng: -89.5439 },
  { name: 'Jalapa', lat: 14.6347, lng: -89.9892 }, { name: 'Jutiapa', lat: 14.2917, lng: -89.8958 },
]

export const LOCATION_CATALOG: LocationCountry[] = [
  { name: 'Guatemala', continent: 'América', places: guatemala, bounds: { north: 17.82, south: 13.73, east: -88.22, west: -92.23 } },
  { name: 'Estados Unidos', continent: 'América', places: [{ name: 'Nueva York', lat: 40.7128, lng: -74.006 }, { name: 'Los Ángeles', lat: 34.0522, lng: -118.2437 }, { name: 'Chicago', lat: 41.8781, lng: -87.6298 }, { name: 'Miami', lat: 25.7617, lng: -80.1918 }], bounds: { north: 49.4, south: 24.3, east: -66.8, west: -124.9 } },
  { name: 'Canadá', continent: 'América', places: [{ name: 'Toronto', lat: 43.6532, lng: -79.3832 }, { name: 'Vancouver', lat: 49.2827, lng: -123.1207 }, { name: 'Montreal', lat: 45.5017, lng: -73.5673 }], bounds: { north: 83.2, south: 41.6, east: -52.6, west: -141 } },
  { name: 'México', continent: 'América', places: [{ name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 }, { name: 'Guadalajara', lat: 20.6597, lng: -103.3496 }, { name: 'Monterrey', lat: 25.6866, lng: -100.3161 }, { name: 'Mérida', lat: 20.9674, lng: -89.5926 }], bounds: { north: 32.72, south: 14.53, east: -86.71, west: -118.46 } },
  { name: 'Belice', continent: 'América', places: [{ name: 'Belmopán', lat: 17.2514, lng: -88.759 }, { name: 'Ciudad de Belice', lat: 17.5046, lng: -88.1962 }], bounds: { north: 18.5, south: 15.87, east: -87.48, west: -89.23 } },
  { name: 'El Salvador', continent: 'América', places: [{ name: 'San Salvador', lat: 13.6929, lng: -89.2182 }, { name: 'Santa Ana', lat: 13.9942, lng: -89.5597 }], bounds: { north: 14.45, south: 13.15, east: -87.69, west: -90.13 } },
  { name: 'Honduras', continent: 'América', places: [{ name: 'Tegucigalpa', lat: 14.0723, lng: -87.1921 }, { name: 'San Pedro Sula', lat: 15.5042, lng: -88.025 }], bounds: { north: 16.51, south: 12.98, east: -83.15, west: -89.35 } },
  { name: 'Nicaragua', continent: 'América', places: [{ name: 'Managua', lat: 12.115, lng: -86.2362 }, { name: 'León', lat: 12.4379, lng: -86.878 }], bounds: { north: 15.03, south: 10.71, east: -82.57, west: -87.69 } },
  { name: 'Costa Rica', continent: 'América', places: [{ name: 'San José', lat: 9.9281, lng: -84.0907 }, { name: 'Liberia', lat: 10.635, lng: -85.4377 }], bounds: { north: 11.22, south: 8.03, east: -82.55, west: -85.95 } },
  { name: 'Panamá', continent: 'América', places: [{ name: 'Ciudad de Panamá', lat: 8.9824, lng: -79.5199 }, { name: 'David', lat: 8.4273, lng: -82.4308 }], bounds: { north: 9.65, south: 7.2, east: -77.17, west: -83.05 } },
  { name: 'Cuba', continent: 'América', places: [{ name: 'La Habana', lat: 23.1136, lng: -82.3666 }, { name: 'Santiago de Cuba', lat: 20.0169, lng: -75.8302 }] },
  { name: 'República Dominicana', continent: 'América', places: [{ name: 'Santo Domingo', lat: 18.4861, lng: -69.9312 }, { name: 'Santiago de los Caballeros', lat: 19.4517, lng: -70.697 }], bounds: { north: 19.94, south: 17.47, east: -68.32, west: -72.01 } },
  { name: 'Colombia', continent: 'América', places: [{ name: 'Bogotá', lat: 4.711, lng: -74.0721 }, { name: 'Medellín', lat: 6.2442, lng: -75.5812 }, { name: 'Cali', lat: 3.4516, lng: -76.532 }], bounds: { north: 13.39, south: -4.23, east: -66.85, west: -79.02 } },
  { name: 'Venezuela', continent: 'América', places: [{ name: 'Caracas', lat: 10.4806, lng: -66.9036 }, { name: 'Maracaibo', lat: 10.6545, lng: -71.65 }], bounds: { north: 12.2, south: 0.64, east: -59.8, west: -73.35 } },
  { name: 'Ecuador', continent: 'América', places: [{ name: 'Quito', lat: -0.1807, lng: -78.4678 }, { name: 'Guayaquil', lat: -2.1709, lng: -79.9224 }], bounds: { north: 1.45, south: -5.02, east: -75.19, west: -81.08 } },
  { name: 'Perú', continent: 'América', places: [{ name: 'Lima', lat: -12.0464, lng: -77.0428 }, { name: 'Cusco', lat: -13.5319, lng: -71.9675 }, { name: 'Arequipa', lat: -16.409, lng: -71.5375 }], bounds: { north: -0.04, south: -18.35, east: -68.65, west: -81.33 } },
  { name: 'Bolivia', continent: 'América', places: [{ name: 'La Paz', lat: -16.4897, lng: -68.1193 }, { name: 'Santa Cruz de la Sierra', lat: -17.7833, lng: -63.1821 }], bounds: { north: -9.67, south: -22.9, east: -57.45, west: -69.65 } },
  { name: 'Brasil', continent: 'América', places: [{ name: 'São Paulo', lat: -23.5505, lng: -46.6333 }, { name: 'Río de Janeiro', lat: -22.9068, lng: -43.1729 }, { name: 'Brasilia', lat: -15.7939, lng: -47.8828 }], bounds: { north: 5.27, south: -33.75, east: -34.79, west: -73.99 } },
  { name: 'Paraguay', continent: 'América', places: [{ name: 'Asunción', lat: -25.2637, lng: -57.5759 }, { name: 'Ciudad del Este', lat: -25.5097, lng: -54.6111 }], bounds: { north: -19.29, south: -27.61, east: -54.26, west: -62.65 } },
  { name: 'Uruguay', continent: 'América', places: [{ name: 'Montevideo', lat: -34.9011, lng: -56.1645 }, { name: 'Punta del Este', lat: -34.9667, lng: -54.95 }], bounds: { north: -30.09, south: -34.98, east: -53.1, west: -58.44 } },
  { name: 'Argentina', continent: 'América', places: [{ name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 }, { name: 'Córdoba', lat: -31.4201, lng: -64.1888 }, { name: 'Mendoza', lat: -32.8895, lng: -68.8458 }], bounds: { north: -21.78, south: -55.06, east: -53.64, west: -73.58 } },
  { name: 'Chile', continent: 'América', places: [{ name: 'Santiago', lat: -33.4489, lng: -70.6693 }, { name: 'Valparaíso', lat: -33.0472, lng: -71.6127 }, { name: 'Concepción', lat: -36.8201, lng: -73.0444 }], bounds: { north: -17.5, south: -56, east: -66.4, west: -75.7 } },
  { name: 'España', continent: 'Europa', places: [{ name: 'Madrid', lat: 40.4168, lng: -3.7038 }, { name: 'Barcelona', lat: 41.3874, lng: 2.1686 }, { name: 'Valencia', lat: 39.4699, lng: -0.3763 }], bounds: { north: 43.8, south: 27.6, east: 4.35, west: -18.2 } },
  { name: 'Alemania', continent: 'Europa', places: [{ name: 'Berlín', lat: 52.52, lng: 13.405 }, { name: 'Múnich', lat: 48.1351, lng: 11.582 }, { name: 'Hamburgo', lat: 53.5511, lng: 9.9937 }], bounds: { north: 55.06, south: 47.27, east: 15.04, west: 5.87 } },
  { name: 'Francia', continent: 'Europa', places: [{ name: 'París', lat: 48.8566, lng: 2.3522 }, { name: 'Lyon', lat: 45.764, lng: 4.8357 }, { name: 'Marsella', lat: 43.2965, lng: 5.3698 }], bounds: { north: 51.1, south: 41.33, east: 9.56, west: -5.14 } },
  { name: 'Italia', continent: 'Europa', places: [{ name: 'Roma', lat: 41.9028, lng: 12.4964 }, { name: 'Milán', lat: 45.4642, lng: 9.19 }, { name: 'Nápoles', lat: 40.8518, lng: 14.2681 }], bounds: { north: 47.1, south: 36.62, east: 18.52, west: 6.63 } },
  { name: 'Reino Unido', continent: 'Europa', places: [{ name: 'Londres', lat: 51.5072, lng: -0.1276 }, { name: 'Mánchester', lat: 53.4808, lng: -2.2426 }, { name: 'Edimburgo', lat: 55.9533, lng: -3.1883 }], bounds: { north: 59.5, south: 49.86, east: 1.77, west: -8.65 } },
  { name: 'Países Bajos', continent: 'Europa', places: [{ name: 'Ámsterdam', lat: 52.3676, lng: 4.9041 }, { name: 'Róterdam', lat: 51.9244, lng: 4.4777 }], bounds: { north: 53.55, south: 50.75, east: 7.23, west: 3.36 } },
  { name: 'Suiza', continent: 'Europa', places: [{ name: 'Zúrich', lat: 47.3769, lng: 8.5417 }, { name: 'Ginebra', lat: 46.2044, lng: 6.1432 }, { name: 'Berna', lat: 46.948, lng: 7.4474 }], bounds: { north: 47.81, south: 45.82, east: 10.49, west: 5.96 } },
  { name: 'Asia (Próximamente)', continent: 'Asia', places: [], disabled: true },
  { name: 'África (Próximamente)', continent: 'África', places: [], disabled: true },
  { name: 'Oceanía (Próximamente)', continent: 'Oceanía', places: [], disabled: true },
]

export function enabledCountries() {
  return LOCATION_CATALOG.filter(country => !country.disabled)
}

export function countryByName(name: string) {
  return enabledCountries().find(country => country.name === name) ?? enabledCountries()[0]
}

export function placeByName(countryName: string, placeName: string) {
  const country = countryByName(countryName)
  return country.places.find(place => place.name === placeName) ?? country.places[0]
}

function distance(a: Coordinates, b: Coordinates) {
  const latitude = (a.lat - b.lat) * 111
  const longitude = (a.lng - b.lng) * 111 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180)
  return Math.hypot(latitude, longitude)
}

function inBounds(point: Coordinates, country: LocationCountry) {
  const bounds = country.bounds
  return Boolean(bounds && point.lat <= bounds.north && point.lat >= bounds.south && point.lng <= bounds.east && point.lng >= bounds.west)
}

export function locationForCoordinates(point: Coordinates) {
  const countries = enabledCountries()
  const country = countries.find(candidate => inBounds(point, candidate))
  if (country) {
    return { country, place: country.places.reduce((nearest, place) => distance(point, place) < distance(point, nearest) ? place : nearest) }
  }
  const nearest = countries.flatMap(candidate => candidate.places.map(place => ({ country: candidate, place, distance: distance(point, place) }))).sort((left, right) => left.distance - right.distance)[0]
  return nearest && nearest.distance <= 700 ? { country: nearest.country, place: nearest.place } : null
}
