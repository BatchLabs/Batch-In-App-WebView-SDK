interface BatchWebkitBridgeResponse {
  error?: string | null;
  result?: string | null;
}

interface BatchWebkitBridgeMessage {
  taskID: number;
  method: string;
  args: { [key: string]: unknown };
}

interface BatchWebkitBridgeHandler {
  batchBridge?: {
    postMessage: (message: BatchWebkitBridgeMessage) => void | Promise<string>;
  };
}

interface WebkitWindow {
  messageHandlers?: BatchWebkitBridgeHandler;
}

interface BatchAndroidBridge {
  postMessage?: (message: string, args: string) => string;
}

interface BatchAndroidBridgeResult {
  error?: string | null;
  result?: string | null;
}

interface Window {
  webkit?: WebkitWindow;
  _batchAndroidBridge: BatchAndroidBridge;
}
