# Shipments Backend

Backend del módulo **Shipments** (embarques + tracking events).

## Endpoints (MVP)

- `GET /swagger` documentación
- `GET /v1/shipments?orderId=` listar shipments por orden
- `GET /v1/shipments/:shipmentId` detalle + eventos

## Auditoría

Mutaciones emiten audit logs a Permit (`/v1/audit-logs`) best-effort.


