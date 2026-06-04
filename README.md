# Quiniela Mageova · Frontend

App en **React + Vite** para la quiniela del Mundial 2026.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:5173
```

El frontend habla con el backend a través de `/api`. En desarrollo, Vite hace
**proxy** automático hacia `http://localhost:4000` (configurable con
`VITE_API_TARGET`). Asegúrate de tener el backend corriendo.

Para producción puedes definir la URL del backend con `VITE_API_URL`
(p. ej. `VITE_API_URL=https://mi-backend.com/api`).

## Pantallas

| Ruta | Pantalla | Qué muestra |
|---|---|---|
| `/` | **Inicio** | KPIs, próximos partidos, top 3 y gráfica de equipos vivos. |
| `/grupos` | **Grupos** | Tablas de los 12 grupos (PJ, G, E, P, GF, GC, DG, Pts). |
| `/eliminatorias` | **Eliminatorias** | Bracket completo por rondas. |
| `/clasificacion` | **Clasificación** | Ranking 1–12, dinero y desglose por equipo. |
| `/ajustes` | **Ajustes** | Alta/edición de participantes, colores y asignación de equipos. |
| `/admin` | **Admin** | Captura de resultados (protegida con contraseña opcional). |

## Primer uso recomendado

1. En **Ajustes**, crea a las 12 personas y asígnale a cada una sus 4 equipos
   (uno por bombo).
2. En **Admin**, ve capturando los marcadores conforme se juegan.
3. Las demás pantallas se actualizan solas con cada resultado.
