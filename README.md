# Shipments Juampamillan (Embarques + Tracking)

Este repo será el módulo **Shipments** del ERP modular.

## Propósito

Shipments es el **source of truth** de:
- embarques (shipments)
- carriers
- guías / tracking numbers
- eventos de tracking
- incidencias (exceptions)

Vendor solo **consume** esta información para mostrar tracking por orden.

## No incluye
- Órdenes de venta (Vendor)
- Stock/availability (Inventory)
- Catálogo interno manufactura (Factory)
- Usuarios/RBAC/auditoría/notificaciones (Permit)

## Integraciones

- Vendor → Shipments:
  - `GET /v1/shipments?orderId=`
  - `GET /v1/shipments/:shipmentId`

## Roadmap / Backlog (alto nivel)

### Must (MVP)
- `shipments-backend` (Elysia + Drizzle):
  - shipments (orderId, status, carrier, trackingNumber, trackingUrl)
  - shipment_events (shipmentId, status, timestamp, payload)
- Endpoints de consulta por orderId
- API keys + rate limiting

### Should
- Webhooks o polling de carriers (si aplica)
- Modelo de incidencias y resolución

### Could
- SLA, tiempos estimados, alertas y notificaciones (integración con Permit)


