/** @typedef {import('leaflet')} */

// --- Variables globales ---
let map;
let marcadorActual;
let watchId = null;
let contador = 0;

const historialPosiciones = []; // guarda los {lat, lng}
let polilinea; // la línea roja del recorrido

// Elementos del DOM
const listaHistorial = document.getElementById("listaHistorial");
const btnIniciar = document.getElementById("btnIniciar");
const btnDetener = document.getElementById("btnDetener");
const btnLimpiar = document.getElementById("btnLimpiar");

// --- Inicializar el mapa ---
function iniciarMapa(lat, lng) {
  map = L.map("map").setView([lat, lng], 16);

  // Carga de mapas gratis de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Línea roja para el recorrido
  polilinea = L.polyline([], { color: "red" }).addTo(map);

  // Marcador de posición actual
  marcadorActual = L.marker([lat, lng]).addTo(map);
}

// --- Agregar una nueva posición al mapa e historial ---
function agregarPosicion(lat, lng) {
  contador++;

  // Guardar en el arreglo de historial
  historialPosiciones.push({ lat, lng });

  // Actualizar marcador de posición actual
  if (!marcadorActual) {
    marcadorActual = L.marker([lat, lng]).addTo(map);
  } else {
    marcadorActual.setLatLng([lat, lng]);
  }

  // Extender la línea roja con el nuevo punto
  polilinea.addLatLng([lat, lng]);

  // Centrar el mapa en la nueva posición
  map.panTo([lat, lng]);

  // Agregar el punto a la lista visible del historial
  const item = document.createElement("li");
  item.textContent = `#${contador} → Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  listaHistorial.appendChild(item);
}

// --- Manejo de errores de geolocalización ---
function manejarError(error) {
  alert("Error al obtener la ubicación: " + error.message);
}

// --- Botón Iniciar Seguimiento ---
btnIniciar.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("La geolocalización no es soportada por este navegador.");
    return;
  }

  // Si ya hay un seguimiento activo, no iniciar otro
  if (watchId !== null) return;

  // Primero obtenemos una posición inicial para centrar el mapa
  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const { latitude, longitude } = posicion.coords;

      if (!map) {
        iniciarMapa(latitude, longitude);
      }

      agregarPosicion(latitude, longitude);

      // Luego iniciamos el seguimiento continuo
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          agregarPosicion(latitude, longitude);
        },
        manejarError,
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    },
    manejarError,
    { enableHighAccuracy: true }
  );
});

// --- Botón Detener Seguimiento ---
btnDetener.addEventListener("click", () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
});

// --- Botón Limpiar Historial ---
btnLimpiar.addEventListener("click", () => {
  historialPosiciones.length = 0;
  contador = 0;
  listaHistorial.innerHTML = "";

  if (polilinea) {
    polilinea.setLatLngs([]);
  }
});
