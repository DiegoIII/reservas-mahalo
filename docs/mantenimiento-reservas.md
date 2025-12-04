# Mantenimiento de Reservas y Hora en Restaurante

## Limpieza automática de reservas expiradas

- Endpoint: `POST /api/admin/cleanup`
- Lógica: elimina reservas cuya fecha ya pasó.
  - Restaurante: `date < hoy`
  - Evento: `date < hoy`
  - Cuartos: `check_out < hoy`
- Implementación: función `cleanupExpiredReservations` en `api/_store.js`.
- Persistencia: reescritura de la lista `reservations` en memoria o KV si está habilitado.
- Logging: por cada eliminación se registra en consola y en notificaciones (`type: deletion`).

### Programación diaria

- Configure un cron externo (ej. Vercel Cron) para invocar `POST /api/admin/cleanup` cada día.
- Ejemplo `vercel.json` (si aplica):
  ```json
  {
    "crons": [
      { "path": "/api/admin/cleanup", "schedule": "0 6 * * *" }
    ]
  }
  ```

## Corrección de hora en reservas de restaurante

- Modelo: el campo de hora se almacena en `time`.
- Panel de administración: ahora muestra `r.time` y ordena por `time` cuando hay empate de fecha.
- Validación en API: `fecha y hora requeridas` al crear reservas de restaurante.

## Pruebas

- `src/api/cleanup.test.js`: verifica eliminación de expiradas y preservación de futuras.
- `src/api/admin/restaurant.validation.test.js`: asegura que la hora sea obligatoria y que se almacene correctamente.
- `src/features/admin/AdminDashboard.time.test.js`: valida que el panel muestra la hora desde el campo `time`.

## Consideraciones

- KV opcional: si existen `UPSTASH_REDIS_*`, la limpieza reescribe la lista en KV.
- Zona horaria: las comparaciones se realizan por fecha ISO (`YYYY-MM-DD`).
