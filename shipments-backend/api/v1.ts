import { Elysia } from 'elysia'
import { apiKeysRouter } from '../src/api-keys/router.js'
import { shipmentsRouter } from '../src/shipments/router.js'

/**
 * API v1 - Shipments (embarques + tracking)
 */
export const v1Routes = new Elysia({ prefix: '/v1' })
  .use(apiKeysRouter)
  .use(shipmentsRouter)


