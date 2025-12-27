/**
 * Cliente API para comunicarse con las rutas API de Next.js
 * Las rutas API actúan como proxy y manejan la autenticación y API key server-side
 */

const PERMIT_API_BASE_URL = '/api/permit';
const SHIPMENTS_API_BASE_URL = '/api/shipments';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  baseUrl: string,
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// ==================== USUARIOS (Permit) ====================

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | Date;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetchApi<{ data: User[] }>(PERMIT_API_BASE_URL, '/v1/users/');
    return res.data;
  },
};

// ==================== SHIPMENTS ====================

export type ShipmentStatus =
  | 'pending'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'
  | 'cancelled';

export type ShipmentEventType =
  | 'created'
  | 'packed'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export interface ShipmentEvent {
  id: number;
  shipmentId: number;
  type: ShipmentEventType;
  location?: string | null;
  message?: string | null;
  occurredAt: string | Date;
  createdAt: string | Date;
}

export interface Shipment {
  id: number;
  orderId: number;
  status: ShipmentStatus;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  events?: ShipmentEvent[];
}

export interface CreateShipmentInput {
  orderId: number;
  status?: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface UpdateShipmentStatusInput {
  toStatus: ShipmentStatus;
  reason?: string;
}

export interface AddShipmentEventInput {
  type: ShipmentEventType;
  location?: string;
  message?: string;
  occurredAt?: string;
}

export interface ShipmentFilters {
  orderId?: number;
}

export const shipmentsApi = {
  getAll: async (filters?: ShipmentFilters): Promise<Shipment[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<Shipment[]>(
      SHIPMENTS_API_BASE_URL,
      `/v1/shipments${query ? `?${query}` : ''}`
    );
    return Array.isArray(res) ? res : res.data || [];
  },

  getById: async (id: number): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(SHIPMENTS_API_BASE_URL, `/v1/shipments/${id}`);
    return res;
  },

  create: async (data: CreateShipmentInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(SHIPMENTS_API_BASE_URL, '/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  updateStatus: async (id: number, data: UpdateShipmentStatusInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(SHIPMENTS_API_BASE_URL, `/v1/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  addEvent: async (id: number, data: AddShipmentEventInput): Promise<ShipmentEvent> => {
    const res = await fetchApi<ShipmentEvent>(SHIPMENTS_API_BASE_URL, `/v1/shipments/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};
