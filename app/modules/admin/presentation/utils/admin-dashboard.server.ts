import { redirect } from "react-router";

export type AdminSession = {
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  mfaSatisfied: boolean;
  sessionExpiry: string;
  roles: string[];
  permissions: string[];
};

export type AdminManagedUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastSeenAt: string | null;
  activeSessions: number;
  emailVerified?: boolean;
  mfaEmailEnabled?: boolean;
  mfaTotpEnabled?: boolean;
};

export type AdminUserSession = {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  ipAddress: string;
  location: string;
  startedAt: string;
  lastActivityAt: string;
  expiredAt?: string;
  mfaSatisfied?: boolean;
  status: "ACTIVE" | "REVOKED";
};

export type AdminSessionActionResult = {
  message: string;
  revokedCount: number;
};

export type AdminRbacRole = {
  id: number;
  name: string;
  permissions: string[];
  memberCount: number;
};

export type AdminRbacRoleMember = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export type AdminRbacRoleDetail = {
  id: number;
  name: string;
  permissions: string[];
  members: AdminRbacRoleMember[];
};

export type AdminRbacUserAssignment = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
};

export type AdminRbacPermissionsPanel = {
  roles: AdminRbacRole[];
  users: AdminRbacUserAssignment[];
  permissions: string[];
};

export type AdminRbacMutationResult = {
  message: string;
  changed: boolean;
};

export type AdminSystemActivityKpi = {
  activeAuctions: number;
  bidsLast24h: number;
  openDisputes: number;
  publishedEventsLast24h: number;
};

export type AdminSystemActivityEvent = {
  kind: string;
  title: string;
  detail: string;
  occurredAt: string;
};

export type AdminSystemActivitySnapshot = {
  generatedAt: string;
  kpi: AdminSystemActivityKpi;
  recentEvents: AdminSystemActivityEvent[];
};

export type AdminSystemSecurityPolicy = {
  maxConcurrentSessions: number;
  enforcementMode: "REJECT_NEW" | "REVOKE_OLDEST";
  forceMfaForAdmin: boolean;
  updatedAt: string;
};

export type AdminSystemSecurityOverview = {
  activeSessions: number;
  usersWithMultipleSessions: number;
  mfaSatisfiedSessions: number;
  mfaUnsatisfiedSessions: number;
};

export type AdminSystemSecurityRuntime = {
  sessionCookieName: string;
  sessionCookieSecure: boolean;
  sessionCookieSameSite: string;
  authzCacheTtlSeconds: number;
};

export type AdminSystemSecurityLoginAudit = {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  mfaSatisfied: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiredAt: string;
};

export type AdminSystemSecuritySnapshot = {
  generatedAt: string;
  policy: AdminSystemSecurityPolicy;
  overview: AdminSystemSecurityOverview;
  runtime: AdminSystemSecurityRuntime;
  loginAudit: AdminSystemSecurityLoginAudit[];
};

export type AdminListingModeration = {
  id: string;
  title: string;
  categoryPath: string;
  sellerName: string;
  sellerId: string;
  startingPrice: number;
  reservePrice: number | null;
  currentBid: number | null;
  bidCount: number;
  status: string;
  createdAt: string;
  endAt: string | null;
  thumbnailUrl: string;
  description: string;
};

export type AdminDispute = {
  id: string;
  orderId: string;
  openedBy: string;
  openedByParty: "BUYER" | "SELLER" | "UNKNOWN";
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  orderTitle: string;
  orderImageUrl: string;
  finalPrice: number;
  orderStatus: string;
};

const mockUsers: AdminManagedUser[] = [
  {
    id: "u-1001",
    name: "Rafi Pratama",
    email: "rafi.pratama@bidmart.test",
    status: "ACTIVE",
    roles: ["BIDDER"],
    createdAt: "2026-03-12T10:22:00.000Z",
    lastSeenAt: "2026-05-27T08:42:00.000Z",
    activeSessions: 2,
  },
  {
    id: "u-1002",
    name: "Nadia Putri",
    email: "nadia.putri@bidmart.test",
    status: "PENDING_VERIFICATION",
    roles: ["SELLER"],
    createdAt: "2026-04-03T02:17:00.000Z",
    lastSeenAt: "2026-05-26T14:05:00.000Z",
    activeSessions: 1,
  },
  {
    id: "u-1003",
    name: "Bagus Saputra",
    email: "bagus.saputra@bidmart.test",
    status: "DISABLED",
    roles: ["BIDDER", "SELLER"],
    createdAt: "2026-01-25T06:03:00.000Z",
    lastSeenAt: "2026-05-24T11:55:00.000Z",
    activeSessions: 0,
  },
];

const mockUserSessions: Record<string, AdminUserSession[]> = {
  "u-1001": [
    {
      id: "sess-rafi-1",
      device: "Chrome on macOS",
      ipAddress: "103.77.12.22",
      location: "Jakarta, ID",
      startedAt: "2026-05-27T06:12:00.000Z",
      lastActivityAt: "2026-05-27T08:41:00.000Z",
      status: "ACTIVE",
    },
    {
      id: "sess-rafi-2",
      device: "Safari on iOS",
      ipAddress: "103.77.12.39",
      location: "Jakarta, ID",
      startedAt: "2026-05-25T04:03:00.000Z",
      lastActivityAt: "2026-05-26T10:32:00.000Z",
      status: "ACTIVE",
    },
  ],
  "u-1002": [
    {
      id: "sess-nadia-1",
      device: "Firefox on Windows",
      ipAddress: "36.82.100.51",
      location: "Bandung, ID",
      startedAt: "2026-05-26T08:47:00.000Z",
      lastActivityAt: "2026-05-26T14:03:00.000Z",
      status: "ACTIVE",
    },
  ],
  "u-1003": [
    {
      id: "sess-bagus-1",
      device: "Edge on Windows",
      ipAddress: "114.122.10.8",
      location: "Surabaya, ID",
      startedAt: "2026-05-20T02:05:00.000Z",
      lastActivityAt: "2026-05-22T07:41:00.000Z",
      status: "REVOKED",
    },
  ],
};

const mockListings: AdminListingModeration[] = [
  {
    id: "lst-2201",
    title: "Apple iPhone 14 Pro 256GB - Like New",
    categoryPath: "Elektronik > Handphone",
    sellerName: "Nadia Putri",
    sellerId: "u-1002",
    startingPrice: 11000000,
    reservePrice: 12500000,
    currentBid: 12750000,
    bidCount: 19,
    status: "ACTIVE",
    createdAt: "2026-05-20T02:11:00.000Z",
    endAt: "2026-05-29T14:00:00.000Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&q=80",
    description:
      "Kondisi sangat mulus, baterai 96%, lengkap box dan charger original. Tidak pernah service.",
  },
  {
    id: "lst-2202",
    title: "Mechanical Keyboard 75% Hot-Swap + Keycaps PBT",
    categoryPath: "Elektronik > Komputer",
    sellerName: "Bagus Saputra",
    sellerId: "u-1003",
    startingPrice: 800000,
    reservePrice: null,
    currentBid: null,
    bidCount: 0,
    status: "DRAFT",
    createdAt: "2026-05-26T07:55:00.000Z",
    endAt: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=640&q=80",
    description:
      "Switch tactile, plate foam, sudah mod stabilizer. Kondisi baru dipakai 2 minggu.",
  },
  {
    id: "lst-2203",
    title: "Vintage Camera Canon AE-1 Program with 50mm Lens",
    categoryPath: "Hobi > Kamera",
    sellerName: "Rafi Pratama",
    sellerId: "u-1001",
    startingPrice: 2200000,
    reservePrice: 2500000,
    currentBid: 2410000,
    bidCount: 11,
    status: "CLOSED",
    createdAt: "2026-05-11T10:05:00.000Z",
    endAt: "2026-05-18T09:00:00.000Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=640&q=80",
    description:
      "Semua fungsi normal, light meter hidup. Cocok untuk koleksi atau street photography.",
  },
  {
    id: "lst-2204",
    title: "Gaming Laptop RTX 4060 - Include Original Invoice",
    categoryPath: "Elektronik > Laptop",
    sellerName: "Aulia Rahman",
    sellerId: "u-1014",
    startingPrice: 14500000,
    reservePrice: 16000000,
    currentBid: 15000000,
    bidCount: 4,
    status: "FLAGGED",
    createdAt: "2026-05-24T13:48:00.000Z",
    endAt: "2026-06-01T12:30:00.000Z",
    thumbnailUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=640&q=80",
    description:
      "Spek i7 gen 13, RAM 16GB, SSD 1TB. Listing ditandai sistem untuk verifikasi tambahan.",
  },
  {
    id: "lst-2205",
    title: "Luxury Watch Replica Grade A+",
    categoryPath: "Fashion > Jam Tangan",
    sellerName: "Unknown Seller",
    sellerId: "u-1999",
    startingPrice: 3500000,
    reservePrice: null,
    currentBid: null,
    bidCount: 0,
    status: "REJECTED",
    createdAt: "2026-05-22T02:35:00.000Z",
    endAt: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=640&q=80",
    description:
      "Ditolak karena indikasi pelanggaran kebijakan barang counterfeit berdasarkan review awal admin.",
  },
];

const mockDisputes: AdminDispute[] = [
  {
    id: "dsp-4101",
    orderId: "ord-9001",
    openedBy: "u-1001",
    openedByParty: "BUYER",
    reason: "ITEM_NOT_AS_DESCRIBED",
    description:
      "Barang yang diterima memiliki lecet dan baterai drop, tidak sesuai deskripsi listing.",
    status: "UNDER_REVIEW",
    resolution: null,
    createdAt: "2026-05-26T11:20:00.000Z",
    resolvedAt: null,
    buyerId: "u-1001",
    buyerName: "Rafi Pratama",
    sellerId: "u-1002",
    sellerName: "Nadia Putri",
    orderTitle: "Apple iPhone 14 Pro 256GB - Like New",
    orderImageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&q=80",
    finalPrice: 12750000,
    orderStatus: "DISPUTED",
  },
  {
    id: "dsp-4102",
    orderId: "ord-9008",
    openedBy: "u-1014",
    openedByParty: "BUYER",
    reason: "ITEM_NOT_RECEIVED",
    description:
      "Paket belum diterima lebih dari estimasi 7 hari dan tidak ada update tracking terbaru.",
    status: "OPEN",
    resolution: null,
    createdAt: "2026-05-25T08:05:00.000Z",
    resolvedAt: null,
    buyerId: "u-1014",
    buyerName: "Aulia Rahman",
    sellerId: "u-1041",
    sellerName: "Rizky Ananta",
    orderTitle: "Mechanical Keyboard 75% Hot-Swap + Keycaps PBT",
    orderImageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=640&q=80",
    finalPrice: 925000,
    orderStatus: "DISPUTED",
  },
  {
    id: "dsp-4090",
    orderId: "ord-8933",
    openedBy: "u-1120",
    openedByParty: "SELLER",
    reason: "OTHER",
    description: "Buyer meminta refund penuh setelah barang diterima tanpa bukti kerusakan valid.",
    status: "RESOLVED_SELLER",
    resolution:
      "Sengketa diputuskan untuk seller. Bukti pengiriman dan kondisi barang saat unboxing dinyatakan valid.",
    createdAt: "2026-05-15T03:40:00.000Z",
    resolvedAt: "2026-05-18T09:12:00.000Z",
    buyerId: "u-1102",
    buyerName: "Dina Anggraini",
    sellerId: "u-1120",
    sellerName: "Bagas Mahendra",
    orderTitle: "Vintage Camera Canon AE-1 Program with 50mm Lens",
    orderImageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=640&q=80",
    finalPrice: 2410000,
    orderStatus: "REFUNDED",
  },
];

const mockRbacRoles: AdminRbacRole[] = [
  {
    id: 1,
    name: "ADMIN",
    permissions: ["admin:access", "admin:auth:read", "user:suspend", "listing:moderate", "order:intervene"],
    memberCount: 1,
  },
  {
    id: 2,
    name: "SELLER",
    permissions: [],
    memberCount: 1,
  },
  {
    id: 3,
    name: "BIDDER",
    permissions: [],
    memberCount: 2,
  },
];

const mockRbacRoleDetails: AdminRbacRoleDetail[] = [
  {
    id: 1,
    name: "ADMIN",
    permissions: ["admin:access", "admin:auth:read", "user:suspend", "listing:moderate", "order:intervene"],
    members: [
      {
        id: "u-1001",
        name: "Rafi Pratama",
        email: "rafi.pratama@bidmart.test",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: 2,
    name: "SELLER",
    permissions: [],
    members: [
      {
        id: "u-1002",
        name: "Nadia Putri",
        email: "nadia.putri@bidmart.test",
        status: "PENDING_VERIFICATION",
      },
    ],
  },
  {
    id: 3,
    name: "BIDDER",
    permissions: [],
    members: [
      {
        id: "u-1001",
        name: "Rafi Pratama",
        email: "rafi.pratama@bidmart.test",
        status: "ACTIVE",
      },
      {
        id: "u-1003",
        name: "Bagus Saputra",
        email: "bagus.saputra@bidmart.test",
        status: "DISABLED",
      },
    ],
  },
];

const mockRbacPermissionsPanel: AdminRbacPermissionsPanel = {
  roles: mockRbacRoles,
  users: mockUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: user.roles,
  })),
  permissions: ["admin:access", "admin:auth:read", "user:suspend", "listing:moderate", "order:intervene"],
};

const mockSystemActivitySnapshot: AdminSystemActivitySnapshot = {
  generatedAt: "2026-05-27T10:30:00.000Z",
  kpi: {
    activeAuctions: 7,
    bidsLast24h: 124,
    openDisputes: 2,
    publishedEventsLast24h: 61,
  },
  recentEvents: [
    {
      kind: "BID",
      title: "Apple iPhone 14 Pro 256GB - Like New",
      detail: "Bid 12750000 by Rafi Pratama",
      occurredAt: "2026-05-27T10:27:10.000Z",
    },
    {
      kind: "EVENT",
      title: "Order Update",
      detail: "Order ord-9001 moved to SHIPPED",
      occurredAt: "2026-05-27T10:24:02.000Z",
    },
    {
      kind: "DISPUTE",
      title: "Mechanical Keyboard 75% Hot-Swap + Keycaps PBT",
      detail: "Dispute status: OPEN",
      occurredAt: "2026-05-27T10:20:15.000Z",
    },
  ],
};

const mockSystemSecuritySnapshot: AdminSystemSecuritySnapshot = {
  generatedAt: "2026-05-27T10:30:00.000Z",
  policy: {
    maxConcurrentSessions: 3,
    enforcementMode: "REVOKE_OLDEST",
    forceMfaForAdmin: true,
    updatedAt: "2026-05-27T09:00:00.000Z",
  },
  overview: {
    activeSessions: 14,
    usersWithMultipleSessions: 4,
    mfaSatisfiedSessions: 11,
    mfaUnsatisfiedSessions: 3,
  },
  runtime: {
    sessionCookieName: "admin_session",
    sessionCookieSecure: false,
    sessionCookieSameSite: "Lax",
    authzCacheTtlSeconds: 60,
  },
  loginAudit: [
    {
      sessionId: "sess-rafi-1",
      userId: "u-1001",
      name: "Rafi Pratama",
      email: "rafi.pratama@bidmart.test",
      status: "ACTIVE",
      ip: "103.77.12.22",
      location: "Jakarta, ID",
      device: "Chrome on macOS",
      browser: "Chrome",
      os: "macOS",
      mfaSatisfied: true,
      createdAt: "2026-05-27T10:22:00.000Z",
      lastActiveAt: "2026-05-27T10:28:00.000Z",
      expiredAt: "2026-05-28T10:22:00.000Z",
    },
    {
      sessionId: "sess-nadia-1",
      userId: "u-1002",
      name: "Nadia Putri",
      email: "nadia.putri@bidmart.test",
      status: "PENDING_VERIFICATION",
      ip: "36.82.100.51",
      location: "Bandung, ID",
      device: "Firefox on Windows",
      browser: "Firefox",
      os: "Windows",
      mfaSatisfied: false,
      createdAt: "2026-05-27T09:58:00.000Z",
      lastActiveAt: "2026-05-27T10:12:00.000Z",
      expiredAt: "2026-05-28T09:58:00.000Z",
    },
  ],
};

function resolveApiBaseUrl(requestUrl: string): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) {
    return new URL("/", requestUrl).toString();
  }
  try {
    return new URL(raw).toString();
  } catch {
    return new URL(raw, requestUrl).toString();
  }
}

type ApiManagedUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastSeenAt: string | null;
  activeSessions: number;
  emailVerified: boolean;
  mfaEmailEnabled: boolean;
  mfaTotpEnabled: boolean;
};

type ApiManagedUserSession = {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  mfaSatisfied: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiredAt: string;
  status: "ACTIVE" | "REVOKED";
};

type ApiRbacRole = {
  id: number;
  name: string;
  permissions: string[];
  memberCount: number;
};

type ApiRbacRoleMember = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type ApiRbacRoleDetail = {
  id: number;
  name: string;
  permissions: string[];
  members: ApiRbacRoleMember[];
};

type ApiRbacUserAssignment = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
};

type ApiRbacPermissionsPanel = {
  roles: ApiRbacRole[];
  users: ApiRbacUserAssignment[];
  permissions: string[];
};

type ApiSystemActivitySnapshot = {
  generatedAt: string;
  kpi: {
    activeAuctions: number;
    bidsLast24h: number;
    openDisputes: number;
    publishedEventsLast24h: number;
  };
  recentEvents: Array<{
    kind: string;
    title: string;
    detail: string;
    occurredAt: string;
  }>;
};

type ApiSystemSecuritySnapshot = {
  generatedAt: string;
  policy: AdminSystemSecurityPolicy;
  overview: AdminSystemSecurityOverview;
  runtime: AdminSystemSecurityRuntime;
  loginAudit: AdminSystemSecurityLoginAudit[];
};

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  try {
    const meUrl = new URL("/admin/auth/me", resolveApiBaseUrl(request.url));
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(meUrl.toString(), {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) return null;
    return (await response.json()) as AdminSession;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return null;
  }
}

async function fetchFromAdminApi<T>(request: Request, path: string): Promise<T | null> {
  try {
    const url = new URL(path, resolveApiBaseUrl(request.url));
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        let message = "Unauthorized.";
        try {
          const body = (await response.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // Ignore parsing errors and keep default message.
        }
        throw new Response(message, { status: response.status });
      }
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return null;
  }
}

async function postToAdminApi<T>(
  request: Request,
  path: string,
  payload: unknown,
  fallbackMessage: string,
): Promise<{ data: T | null; message: string | null; status: number }> {
  try {
    const url = new URL(path, resolveApiBaseUrl(request.url));
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = fallbackMessage;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // Keep fallback message when parsing fails.
      }
      if (response.status === 401 || response.status === 403) {
        throw new Response(message, { status: response.status });
      }
      return { data: null, message, status: response.status };
    }

    const data = (await response.json()) as T;
    return { data, message: null, status: response.status };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { data: null, message: `Network error: ${fallbackMessage}`, status: 0 };
  }
}

export async function requireAdminSession(request: Request): Promise<AdminSession> {
  const session = await getAdminSession(request);
  if (!session) throw redirect("/login");
  return session;
}

export function getMockUsers(): AdminManagedUser[] {
  return mockUsers;
}

export function getMockUserById(userId: string): AdminManagedUser | null {
  return mockUsers.find((user) => user.id === userId) ?? null;
}

export function getMockSessionsByUserId(userId: string): AdminUserSession[] {
  return mockUserSessions[userId] ?? [];
}

export function getMockListings(): AdminListingModeration[] {
  return mockListings;
}

export function getMockListingById(listingId: string): AdminListingModeration | null {
  return mockListings.find((listing) => listing.id === listingId) ?? null;
}

export function getMockDisputes(): AdminDispute[] {
  return mockDisputes;
}

export function getMockDisputeById(disputeId: string): AdminDispute | null {
  return mockDisputes.find((dispute) => dispute.id === disputeId) ?? null;
}

export function getMockRbacRoles(): AdminRbacRole[] {
  return mockRbacRoles;
}

export function getMockRbacRoleById(roleId: number): AdminRbacRoleDetail | null {
  return mockRbacRoleDetails.find((role) => role.id === roleId) ?? null;
}

export function getMockRbacPermissionsPanel(): AdminRbacPermissionsPanel {
  return mockRbacPermissionsPanel;
}

export function getMockSystemActivitySnapshot(): AdminSystemActivitySnapshot {
  return mockSystemActivitySnapshot;
}

export function getMockSystemSecuritySnapshot(): AdminSystemSecuritySnapshot {
  return mockSystemSecuritySnapshot;
}

export async function fetchModerationListings(
  request: Request,
): Promise<AdminListingModeration[] | null> {
  return fetchFromAdminApi<AdminListingModeration[]>(request, "/admin/moderation/listings");
}

export async function fetchModerationListingById(
  request: Request,
  listingId: string,
): Promise<AdminListingModeration | null> {
  return fetchFromAdminApi<AdminListingModeration>(
    request,
    `/admin/moderation/listings/${encodeURIComponent(listingId)}`,
  );
}

export async function fetchDisputes(request: Request): Promise<AdminDispute[] | null> {
  return fetchFromAdminApi<AdminDispute[]>(request, "/admin/disputes");
}

export async function fetchDisputeById(
  request: Request,
  disputeId: string,
): Promise<AdminDispute | null> {
  return fetchFromAdminApi<AdminDispute>(request, `/admin/disputes/${encodeURIComponent(disputeId)}`);
}

export async function resolveDisputeById(
  request: Request,
  disputeId: string,
  payload: { outcome: "BUYER" | "SELLER"; resolution: string },
): Promise<{ data: AdminDispute | null; message: string | null; status: number }> {
  try {
    const url = new URL(
      `/admin/disputes/${encodeURIComponent(disputeId)}/resolve`,
      resolveApiBaseUrl(request.url),
    );
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = "Failed to resolve dispute.";
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // Keep default message when parsing fails.
      }
      if (response.status === 401 || response.status === 403) {
        throw new Response(message, { status: response.status });
      }
      return { data: null, message, status: response.status };
    }

    const data = (await response.json()) as AdminDispute;
    return { data, message: null, status: response.status };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { data: null, message: "Network error while resolving dispute.", status: 0 };
  }
}

export async function revokeManagedUserSessionById(
  request: Request,
  userId: string,
  sessionId: string,
): Promise<{ data: AdminSessionActionResult | null; message: string | null; status: number }> {
  try {
    const url = new URL(
      `/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`,
      resolveApiBaseUrl(request.url),
    );
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Failed to revoke session.";
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // Keep default message when parsing fails.
      }
      if (response.status === 401 || response.status === 403) {
        throw new Response(message, { status: response.status });
      }
      return { data: null, message, status: response.status };
    }

    const data = (await response.json()) as AdminSessionActionResult;
    return { data, message: null, status: response.status };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { data: null, message: "Network error while revoking session.", status: 0 };
  }
}

export async function revokeAllManagedUserSessionsById(
  request: Request,
  userId: string,
): Promise<{ data: AdminSessionActionResult | null; message: string | null; status: number }> {
  try {
    const url = new URL(
      `/admin/users/${encodeURIComponent(userId)}/sessions/revoke-all`,
      resolveApiBaseUrl(request.url),
    );
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Failed to revoke sessions.";
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // Keep default message when parsing fails.
      }
      if (response.status === 401 || response.status === 403) {
        throw new Response(message, { status: response.status });
      }
      return { data: null, message, status: response.status };
    }

    const data = (await response.json()) as AdminSessionActionResult;
    return { data, message: null, status: response.status };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { data: null, message: "Network error while revoking sessions.", status: 0 };
  }
}

export async function fetchSystemActivitySnapshot(
  request: Request,
): Promise<AdminSystemActivitySnapshot | null> {
  return fetchFromAdminApi<ApiSystemActivitySnapshot>(request, "/admin/system/activity");
}

export async function fetchSystemSecuritySnapshot(
  request: Request,
): Promise<AdminSystemSecuritySnapshot | null> {
  return fetchFromAdminApi<ApiSystemSecuritySnapshot>(request, "/admin/system/security");
}

export async function updateSystemSecurityPolicy(
  request: Request,
  payload: {
    maxConcurrentSessions: number;
    enforcementMode: "REJECT_NEW" | "REVOKE_OLDEST";
    forceMfaForAdmin: boolean;
  },
): Promise<{ data: AdminSystemSecuritySnapshot | null; message: string | null; status: number }> {
  return postToAdminApi<ApiSystemSecuritySnapshot>(
    request,
    "/admin/system/security",
    payload,
    "Failed to update security policy.",
  );
}

export async function fetchRbacRoles(request: Request): Promise<AdminRbacRole[] | null> {
  return fetchFromAdminApi<ApiRbacRole[]>(request, "/admin/rbac/roles");
}

export async function fetchRbacRoleById(
  request: Request,
  roleId: number,
): Promise<AdminRbacRoleDetail | null> {
  return fetchFromAdminApi<ApiRbacRoleDetail>(request, `/admin/rbac/roles/${roleId}`);
}

export async function fetchRbacPermissionsPanel(
  request: Request,
): Promise<AdminRbacPermissionsPanel | null> {
  return fetchFromAdminApi<ApiRbacPermissionsPanel>(request, "/admin/rbac/permissions");
}

export async function createRbacRole(
  request: Request,
  payload: { name: string },
): Promise<{ data: AdminRbacRole | null; message: string | null; status: number }> {
  return postToAdminApi<AdminRbacRole>(request, "/admin/rbac/roles", payload, "Failed to create role.");
}

export async function assignUserRoleForRbac(
  request: Request,
  userId: string,
  payload: { role: string },
): Promise<{ data: AdminRbacMutationResult | null; message: string | null; status: number }> {
  return postToAdminApi<AdminRbacMutationResult>(
    request,
    `/admin/rbac/users/${encodeURIComponent(userId)}/roles/assign`,
    payload,
    "Failed to assign role.",
  );
}

export async function revokeUserRoleForRbac(
  request: Request,
  userId: string,
  payload: { role: string },
): Promise<{ data: AdminRbacMutationResult | null; message: string | null; status: number }> {
  return postToAdminApi<AdminRbacMutationResult>(
    request,
    `/admin/rbac/users/${encodeURIComponent(userId)}/roles/revoke`,
    payload,
    "Failed to revoke role.",
  );
}

export async function assignRolePermissionForRbac(
  request: Request,
  role: string,
  payload: { permission: string },
): Promise<{ data: AdminRbacMutationResult | null; message: string | null; status: number }> {
  return postToAdminApi<AdminRbacMutationResult>(
    request,
    `/admin/rbac/roles/${encodeURIComponent(role)}/permissions/assign`,
    payload,
    "Failed to assign permission.",
  );
}

export async function revokeRolePermissionForRbac(
  request: Request,
  role: string,
  payload: { permission: string },
): Promise<{ data: AdminRbacMutationResult | null; message: string | null; status: number }> {
  return postToAdminApi<AdminRbacMutationResult>(
    request,
    `/admin/rbac/roles/${encodeURIComponent(role)}/permissions/revoke`,
    payload,
    "Failed to revoke permission.",
  );
}

export async function fetchManagedUsers(request: Request): Promise<AdminManagedUser[] | null> {
  return fetchFromAdminApi<ApiManagedUser[]>(request, "/admin/users");
}

export async function fetchManagedUserById(
  request: Request,
  userId: string,
): Promise<AdminManagedUser | null> {
  return fetchFromAdminApi<ApiManagedUser>(request, `/admin/users/${encodeURIComponent(userId)}`);
}

export async function fetchManagedUserSessionsById(
  request: Request,
  userId: string,
): Promise<AdminUserSession[] | null> {
  const sessions = await fetchFromAdminApi<ApiManagedUserSession[]>(
    request,
    `/admin/users/${encodeURIComponent(userId)}/sessions`,
  );
  if (!sessions) return null;

  return sessions.map((session) => ({
    id: session.id,
    device: session.device,
    browser: session.browser,
    os: session.os,
    ipAddress: session.ip,
    location: session.location,
    startedAt: session.createdAt,
    lastActivityAt: session.lastActiveAt,
    expiredAt: session.expiredAt,
    mfaSatisfied: session.mfaSatisfied,
    status: session.status,
  }));
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
}
