(function () {
  enum SDKPlatform {
    DESKTOP,
    IOS,
    ANDROID,
  }

  // A task wraps a promise and allows it to be resolved/rejected from outside of its constructor
  // Useful when we need an async reply from something and we lose context, such as talking to
  // webkit or a parent frame
  class Task {
    public readonly promise: Promise<string | undefined>;

    private _promiseResolve!: (value: string | undefined | PromiseLike<string | undefined>) => void;
    private _promiseReject!: (reason?: string | undefined) => void;

    public constructor() {
      this.promise = new Promise((resolve, reject) => {
        this._promiseResolve = resolve;
        this._promiseReject = reject;
      });
    }

    public handleCallback(error?: string | null | Error, result?: string | null): void {
      // Perform type checking as we may be getting garbage from an outside source
      if (error instanceof Error) {
        let message = error.message;
        message = message !== "" ? message : "Unknown error";
        this._promiseReject(message);
        return;
      }
      if (typeof error === "string" && error !== "") {
        this._promiseReject(error);
        return;
      }

      this._promiseResolve(typeof result === "string" ? result : undefined);
    }
  }

  interface SDKTasks {
    [key: number]: Task;
  }

  interface MessageArgs {
    [key: string]: unknown;
  }

  // noinspection JSIgnoredPromiseFromCall
  class SDK implements BatchInAppSDK.SDK {
    private readonly _platform: SDKPlatform;
    private readonly _tasks: SDKTasks;
    private _taskCounter: number;
    private _windowEventListener?: (event: MessageEvent) => void;

    public constructor() {
      this._platform = SDKPlatform.DESKTOP;
      if (window.webkit?.messageHandlers?.batchBridge) {
        this._platform = SDKPlatform.IOS;
      }
      if (window._batchAndroidBridge) {
        this._platform = SDKPlatform.ANDROID;
      }
      this._tasks = {};
      this._taskCounter = 0;

      this._setupBrowserCallback();
    }

    public getPlatform(): string {
      return SDKPlatform[this._platform];
    }

    public getAdvertisingID(): Promise<string | undefined> {
      // Underlying method is different on purpose
      return this._sendNativeMessage("getAttributionID");
    }

    public getInstallationID(): Promise<string | undefined> {
      return this._sendNativeMessage("getInstallationID");
    }

    public getCustomRegion(): Promise<string | undefined> {
      return this._sendNativeMessage("getCustomRegion");
    }

    public getCustomLanguage(): Promise<string | undefined> {
      return this._sendNativeMessage("getCustomLanguage");
    }

    public getCustomUserID(): Promise<string | undefined> {
      return this._sendNativeMessage("getCustomUserID");
    }

    public getCustomPayload(): Promise<BatchInAppSDK.CustomPayload> {
      return this._sendNativeMessage("getCustomPayload").then((rawCustomPayload) => {
        // Don't even attempt to deserialize the payload if it's not a string that looks like a json object
        return SDK._parseJSONObject(rawCustomPayload, "Could not get custom payload from SDK");
      });
    }

    public getTrackingID(): Promise<string | undefined> {
      return this._sendNativeMessage("getTrackingID");
    }

    public openDeeplink(url: string, openInApp?: boolean, analyticsID?: string): void {
      // noinspection SuspiciousTypeOfGuard
      if (typeof url !== "string" || url.trim().length == 0) {
        console.log("Batch In-App - Invalid URL");
        return;
      }

      if (openInApp !== true && openInApp !== false) {
        openInApp = undefined;
      }

      if (typeof analyticsID !== "string" || analyticsID.trim().length == 0) {
        analyticsID = undefined;
      }

      this._sendNativeMessage("openDeeplink", { url, openInApp, analyticsID });
    }

    public performAction(
      name: string,
      args: BatchInAppSDK.ActionArguments,
      analyticsID?: string
    ): void {
      // noinspection SuspiciousTypeOfGuard
      if (typeof name !== "string" || name.trim().length == 0) {
        console.log("Batch In-App - Invalid action name");
        return;
      }
      if (typeof args !== "object" || Array.isArray(args)) {
        args = {};
      }

      if (typeof analyticsID !== "string" || analyticsID.trim().length == 0) {
        analyticsID = undefined;
      }

      this._sendNativeMessage("performAction", { name, args, analyticsID });
    }

    public dismiss(analyticsID?: string): void {
      if (typeof analyticsID !== "string" || analyticsID.trim().length == 0) {
        analyticsID = undefined;
      }

      this._sendNativeMessage("dismiss", { analyticsID });
    }

    // Cleans up non weak resources. For testing.
    public _deinit(): void {
      if (this._windowEventListener) {
        window.removeEventListener("message", this._windowEventListener);
      }
    }

    private static _isStringOrNullOrUndefined(value: unknown): value is string | null | undefined {
      return value === null || typeof value === "undefined" || typeof value === "string";
    }

    private static _parseJSONObject(
      rawJSON: string | undefined,
      errorText: string
    ): { [key: string]: unknown } {
      if (typeof rawJSON === "string" && rawJSON.slice(0, 1) == "{" && rawJSON.slice(-1) == "}") {
        try {
          return JSON.parse(rawJSON);
        } catch (e) {
          throw errorText + " (-2)";
        }
      }
      throw errorText + " (-3)";
    }

    private _setupBrowserCallback(): void {
      // We only need to setup a global handler on desktop platforms
      // iOS will call __handle_callback directly, while Android can synchronously get the result
      if (this._windowEventListener) {
        return;
      }
      if (this._platform != SDKPlatform.DESKTOP) {
        return;
      }
      this._windowEventListener = this._handleBrowserMessage.bind(this);
      window.addEventListener("message", this._windowEventListener);
    }

    private _sendNativeMessage(
      method: string,
      args: MessageArgs = {}
    ): Promise<string | undefined> {
      const task = new Task();
      switch (this._platform) {
        case SDKPlatform.ANDROID: {
          const rawAndroidResponse = window._batchAndroidBridge?.postMessage?.(
            method,
            JSON.stringify(args)
          );
          if (rawAndroidResponse) {
            try {
              const androidResponse = SDK._parseJSONObject(
                rawAndroidResponse,
                "Could not read response from native SDK"
              ) as BatchAndroidBridgeResult;
              task.handleCallback(androidResponse.error, androidResponse.result);
            } catch (err) {
              task.handleCallback(err);
            }
          }
          break;
        }
        case SDKPlatform.IOS: {
          this._taskCounter++;
          const taskID = this._taskCounter;
          // Store the task so we can be called back with the identifier
          // We need to do this before calling the bridge: if for some reason the bridge replies
          // synchronously (which it should never do), the callback would not work
          this._tasks[taskID] = task;

          const webkitResult = window.webkit?.messageHandlers?.batchBridge?.postMessage?.({
            taskID,
            method,
            args,
          });

          // On iOS 14, we can get a reply with a promise
          // On iOS 13 and lower we will get called back via eval()
          // noinspection SuspiciousTypeOfGuard
          if (typeof webkitResult !== "undefined" && webkitResult instanceof Promise) {
            webkitResult
              .then((result) => {
                task.handleCallback(undefined, result);
              })
              .catch((err) => {
                task.handleCallback(err);
              });
            // Delete the useless task
            delete this._tasks[taskID];
          }

          break;
        }
        case SDKPlatform.DESKTOP:
          this._taskCounter++;
          this._tasks[this._taskCounter] = task;
          this._postBrowserMessage(this._taskCounter, method, args);
          break;
      }
      return task.promise;
    }

    private _postBrowserMessage(taskID: number, method: string, args: MessageArgs): void {
      window.parent.postMessage(
        {
          from: "batch-in_app-sdk",
          taskID: this._taskCounter,
          method,
          args,
        },
        "*"
      );
    }

    private _handleBrowserMessage(event: MessageEvent): void {
      if (typeof event.data !== "object" || event.data === null) {
        return;
      }
      const eventData = event.data as { [key: string]: unknown };
      if ("batch-in_app-sdk-callback" === eventData.from) {
        if (
          typeof eventData.taskID == "number" &&
          SDK._isStringOrNullOrUndefined(eventData.error) &&
          SDK._isStringOrNullOrUndefined(eventData.result)
        ) {
          this._handleCallback(eventData.taskID, eventData.error, eventData.result);
        }
      }
    }

    public _handleCallback(taskID: number, error?: string | null, result?: string | null): void {
      const storedTask = this._tasks[taskID];
      if (storedTask) {
        storedTask.handleCallback(error, result);
        delete this._tasks[taskID];
      }
    }

    public __onWebkitCallback(taskID: unknown, response?: BatchWebkitBridgeResponse): void {
      if (typeof taskID == "number") {
        this._handleCallback(taskID, response?.error, response?.result);
      }
    }
  }

  if (window.batchInAppSDK === undefined) {
    window.batchInAppSDK = new SDK();
  }
})();
