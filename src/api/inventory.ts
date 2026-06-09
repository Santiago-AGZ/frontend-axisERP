import { api } from "@/lib/axios";
import type {
  InventoryItem,
  InventoryMovement,
  StockEntryRequest,
  StockExitRequest,
} from "@/types/inventory";

export const inventoryApi = {
  getInventory: (params: {
    search?: string;
    categoryId?: string;
    includeLowStock?: boolean;
  }) => api.get<InventoryItem[]>("/inventario", { params }),

  getProductInventory: (productId: string) =>
    api.get<InventoryItem>(`/inventario/producto/${productId}`),

  getAlerts: () => api.get<InventoryItem[]>("/inventario/alertas"),

  registerEntry: (data: StockEntryRequest) =>
    api.post<InventoryItem>("/inventario/entradas", data),

  registerExit: (data: StockExitRequest) =>
    api.post<InventoryItem>("/inventario/salidas", data),

  getMovements: (params: {
    productId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => api.get<InventoryMovement[]>("/inventario/movimientos", { params }),
};
