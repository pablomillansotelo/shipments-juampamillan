/**
 * Cliente API server-side para comunicarse con shipments-backend
 * La API key se mantiene solo en el servidor
 */

import 'server-only';
import { auth } from '@/lib/auth';
import { 
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  AddShipmentEventInput,
  ShipmentFilters,
  User,
} from './api';

// Para usuarios, siempre usar el backend de Permit
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'http://localhost:8000';
const PERMIT_API_KEY = process.env.PERMIT_API_KEY || '';

// Para Shipments, usar el backend de Shipments
const SHIPMENTS_API_URL = process.env.SHIPMENTS_API_URL || 'http://localhost:8000';
const SHIPMENTS_API_KEY = process.env.SHIPMENTS_API_KEY || PERMIT_API_KEY;

if (!PERMIT_API_KEY) {
  console.warn('⚠️ PERMIT_API_KEY no está configurada. Las llamadas al backend pueden fallar.');
}

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

/**
 * Función helper para hacer requests al backend con API key
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  usePermitBackend: boolean = false
): Promise<T> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError('No autenticado', 401);
  }

  const baseUrl = usePermitBackend ? PERMIT_API_URL : SHIPMENTS_API_URL;
  const apiKey = usePermitBackend ? PERMIT_API_KEY : SHIPMENTS_API_KEY;
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
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

// Re-exportar tipos del cliente público
export type {
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  AddShipmentEventInput,
  ShipmentFilters,
  User,
} from './api';

// ==================== USUARIOS (Permit) ====================

export const usersApi = {
  getAll: async () => {
    const res = await fetchApi<{ data: User[] }>('/v1/users/', undefined, true);
    return res.data;
  },
};

// ==================== SHIPMENTS ====================

export const shipmentsApi = {
  getAll: async (filters?: ShipmentFilters): Promise<Shipment[]> => {
    const params = new URLSearchParams();
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<Shipment[]>(
      `/v1/shipments${query ? `?${query}` : ''}`
    );
    return Array.isArray(res) ? res : res.data || [];
  },

  getById: async (id: number): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(`/v1/shipments/${id}`);
    return res;
  },

  create: async (data: CreateShipmentInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>('/v1/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  updateStatus: async (id: number, data: UpdateShipmentStatusInput): Promise<Shipment> => {
    const res = await fetchApi<Shipment>(`/v1/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  addEvent: async (id: number, data: AddShipmentEventInput): Promise<any> => {
    const res = await fetchApi<any>(`/v1/shipments/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};
