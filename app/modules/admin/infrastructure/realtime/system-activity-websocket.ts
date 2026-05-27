export type SystemActivityRealtimeEvent = {
  type: string;
  payload: unknown;
};

type SystemActivitySocketOptions = {
  onEvent: (event: SystemActivityRealtimeEvent) => void;
};

const DEFAULT_SOCKET_BASE_URLS = ["ws://localhost:8083", "ws://localhost:8080"] as const;

function toWebSocketBaseUrl(value: string): string {
  const configured = value.trim();
  if (!configured) {
    return "";
  }

  if (configured.startsWith("ws://") || configured.startsWith("wss://")) {
    return configured;
  }

  if (configured.startsWith("http://")) {
    return `ws://${configured.slice("http://".length)}`;
  }

  if (configured.startsWith("https://")) {
    return `wss://${configured.slice("https://".length)}`;
  }

  return configured;
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function resolveSocketBaseUrls(): string[] {
  const configured = (import.meta.env.VITE_BIDDING_WS_URL as string | undefined)?.trim();
  const normalizedConfigured = configured ? toWebSocketBaseUrl(configured) : "";

  if (!normalizedConfigured) {
    return [...DEFAULT_SOCKET_BASE_URLS];
  }

  return uniqueValues([normalizedConfigured, ...DEFAULT_SOCKET_BASE_URLS]);
}

function buildActivitySocketUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (!url.searchParams.get("topic")) {
    url.searchParams.set("topic", "activity");
  }
  return url.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRealtimeEvent(rawMessage: string): SystemActivityRealtimeEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const typeCandidate = parsed.event ?? parsed.type ?? parsed.kind;
  if (typeof typeCandidate !== "string" || typeCandidate.length === 0) {
    return null;
  }

  const payload = parsed.data ?? parsed.payload ?? parsed.body ?? parsed.detail ?? null;
  return {
    type: typeCandidate,
    payload,
  };
}

function sendActivitySubscription(socket: WebSocket) {
  const payload = {
    type: "subscribe",
    topic: "activity",
  };

  try {
    socket.send(JSON.stringify(payload));
  } catch {
    // Best-effort only.
  }
}

export function startSystemActivitySocket(options: SystemActivitySocketOptions): () => void {
  const { onEvent } = options;
  const socketUrls = resolveSocketBaseUrls().map((baseUrl) => buildActivitySocketUrl(baseUrl));

  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let retryAttempt = 0;
  let urlIndex = 0;
  let shouldReconnect = true;

  const clearReconnectTimer = () => {
    if (!reconnectTimer) {
      return;
    }
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  const closeSocket = () => {
    if (!socket) {
      return;
    }
    socket.close();
    socket = null;
  };

  const scheduleReconnect = () => {
    if (!shouldReconnect) {
      return;
    }

    clearReconnectTimer();
    const exponentialDelay = Math.min(15_000, 1_000 * 2 ** retryAttempt);
    const jitter = Math.floor(Math.random() * 250);
    retryAttempt += 1;
    urlIndex = (urlIndex + 1) % socketUrls.length;

    reconnectTimer = setTimeout(() => {
      connect();
    }, exponentialDelay + jitter);
  };

  const connect = () => {
    if (!shouldReconnect) {
      return;
    }

    closeSocket();
    const nextSocket = new WebSocket(socketUrls[urlIndex]);
    socket = nextSocket;

    nextSocket.onopen = () => {
      retryAttempt = 0;
      sendActivitySubscription(nextSocket);
    };

    nextSocket.onmessage = (messageEvent) => {
      if (typeof messageEvent.data !== "string") {
        return;
      }

      const event = parseRealtimeEvent(messageEvent.data);
      if (!event) {
        return;
      }

      onEvent(event);
    };

    nextSocket.onerror = () => {
      closeSocket();
      scheduleReconnect();
    };

    nextSocket.onclose = () => {
      socket = null;
      scheduleReconnect();
    };
  };

  connect();

  return () => {
    shouldReconnect = false;
    clearReconnectTimer();
    closeSocket();
  };
}
