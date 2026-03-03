export const API_ROUTES = {
    // Auth
    AUTH_SESSION: "/api/auth/session",
    AUTH_SIGN_IN: "/api/auth/sign-in",
    AUTH_SIGN_UP: "/api/auth/sign-up",
    AUTH_SIGN_OUT: "/api/auth/sign-out",

    // Customer
    CUSTOMER_MENU: (orgSlug: string) => `/api/customer/menu/${orgSlug}`,
    CUSTOMER_SESSION_CREATE: (tableToken: string) =>
        `/api/customer/tables/${tableToken}/session`,
    CUSTOMER_SESSION_VERIFY: (tableToken: string, sessionId: string) =>
        `/api/customer/tables/${tableToken}/session?sessionId=${sessionId}`,
    CUSTOMER_ORDER_CREATE: "/api/customer/orders",
    CUSTOMER_ORDER_STATUS: (orderId: string) =>
        `/api/customer/orders/${orderId}/status`,
    CUSTOMER_BILL_GET: (tableToken: string, sessionId: string) =>
        `/api/customer/bill/${tableToken}?sessionId=${sessionId}`,

    // Restaurant
    RESTAURANT_REGISTER: "/api/restaurant/register",
    RESTAURANT_PROFILE: "/api/restaurant/profile",

    RESTAURANT_TABLES_LIST: "/api/restaurant/tables",
    RESTAURANT_TABLES_CREATE: "/api/restaurant/tables",
    RESTAURANT_TABLE_GET: (id: string) => `/api/restaurant/tables/${id}`,
    RESTAURANT_TABLE_UPDATE: (id: string) => `/api/restaurant/tables/${id}`,
    RESTAURANT_TABLE_DELETE: (id: string) => `/api/restaurant/tables/${id}`,
    RESTAURANT_TABLE_REGENERATE_QR: (id: string) =>
        `/api/restaurant/tables/${id}/regenerate-qr`,
    RESTAURANT_TABLE_CLEAR: (id: string) =>
        `/api/restaurant/tables/${id}/clear`,

    RESTAURANT_CATEGORIES_LIST: "/api/restaurant/menu/categories",
    RESTAURANT_CATEGORIES_CREATE: "/api/restaurant/menu/categories",
    RESTAURANT_CATEGORY_GET: (id: string) =>
        `/api/restaurant/menu/categories/${id}`,
    RESTAURANT_CATEGORY_UPDATE: (id: string) =>
        `/api/restaurant/menu/categories/${id}`,
    RESTAURANT_CATEGORY_DELETE: (id: string) =>
        `/api/restaurant/menu/categories/${id}`,
    RESTAURANT_CATEGORY_TOGGLE: (id: string) =>
        `/api/restaurant/menu/categories/${id}/toggle`,

    RESTAURANT_ITEMS_LIST: "/api/restaurant/menu/items",
    RESTAURANT_ITEMS_CREATE: "/api/restaurant/menu/items",
    RESTAURANT_ITEM_GET: (id: string) => `/api/restaurant/menu/items/${id}`,
    RESTAURANT_ITEM_UPDATE: (id: string) => `/api/restaurant/menu/items/${id}`,
    RESTAURANT_ITEM_DELETE: (id: string) => `/api/restaurant/menu/items/${id}`,
    RESTAURANT_ITEM_TOGGLE: (id: string) =>
        `/api/restaurant/menu/items/${id}/toggle`,
    RESTAURANT_ITEMS_BULK_AVAILABILITY:
        "/api/restaurant/menu/items/bulk-availability",
    RESTAURANT_ITEMS_REORDER: "/api/restaurant/menu/items/reorder",

    RESTAURANT_KITCHEN_ORDERS: "/api/restaurant/kitchen",

    RESTAURANT_ORDERS_LIST: "/api/restaurant/orders",
    RESTAURANT_ORDER_GET: (id: string) => `/api/restaurant/orders/${id}`,
    RESTAURANT_ORDER_UPDATE_STATUS: (id: string) =>
        `/api/restaurant/orders/${id}/status`,
    RESTAURANT_ORDER_MARK_PAID: (id: string) =>
        `/api/restaurant/orders/${id}/mark-paid`,

    // Admin
    ADMIN_PROFILE: "/api/admin/profile",
    ADMIN_STATS: "/api/admin/stats",
    ADMIN_ORGANIZATIONS_LIST: "/api/admin/organizations",
    ADMIN_ORGANIZATIONS_PENDING: "/api/admin/organizations/pending",
    ADMIN_ORGANIZATION_GET: (id: string) => `/api/admin/organizations/${id}`,
    ADMIN_ORGANIZATION_APPROVE: (id: string) =>
        `/api/admin/organizations/${id}/approve`,
    ADMIN_ORGANIZATION_REJECT: (id: string) =>
        `/api/admin/organizations/${id}/reject`,
    ADMIN_ORGANIZATION_SUSPEND: (id: string) =>
        `/api/admin/organizations/${id}/suspend`,
    ADMIN_ORGANIZATION_REACTIVATE: (id: string) =>
        `/api/admin/organizations/${id}/reactivate`,
} as const;

/**
 * Type-safe fetch wrapper
 */
export async function apiFetch<T = any>(
    url: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * API client with methods
 */
export const api = {
    // GET
    get: <T = any>(url: string) => apiFetch<T>(url, { method: "GET" }),

    // POST
    post: <T = any>(url: string, data?: any) =>
        apiFetch<T>(url, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        }),

    // PATCH
    patch: <T = any>(url: string, data?: any) =>
        apiFetch<T>(url, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        }),

    // DELETE
    delete: <T = any>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example 1: Customer gets menu
 *
 * const menu = await api.get(
 *   apiRoutes.customer.menu('somtum-cafe')
 * )
 */

/**
 * Example 2: Restaurant owner creates table
 *
 * const table = await api.post(
 *   apiRoutes.restaurant.tables.create,
 *   { tableNumber: '5' }
 * )
 */

/**
 * Example 3: Admin approves organization
 *
 * const org = await api.post(
 *   apiRoutes.admin.organizations.approve('org_123')
 * )
 */

/**
 * Example 4: Get orders with filters
 *
 * const orders = await api.get(
 *   apiRoutes.restaurant.orders.list({
 *     status: 'PENDING,PREPARING',
 *     date: '2026-03-01',
 *     page: 1,
 *     limit: 20
 *   })
 * )
 */
