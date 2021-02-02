declare namespace BatchInAppSDK {
  interface SDK {
    getPlatform(): string;

    getAdvertisingID(): Promise<string | undefined>;

    getInstallationID(): Promise<string | undefined>;

    getCustomRegion(): Promise<string | undefined>;

    getCustomLanguage(): Promise<string | undefined>;

    getCustomUserID(): Promise<string | undefined>;

    getCustomPayload(): Promise<BatchInAppSDK.CustomPayload>;

    getTrackingID(): Promise<string | undefined>;

    openDeeplink(url: string, openInApp?: boolean, analyticsID?: string): void;

    performAction(name: string, args: BatchInAppSDK.ActionArguments, analyticsID?: string): void;

    dismiss(analyticsID?: string): void;
  }

  interface CustomPayload {
    [key: string]: unknown;
  }

  interface ActionArguments {
    [key: string]: unknown;
  }
}

interface Window {
  batchInAppSDK: BatchInAppSDK.SDK;
}
