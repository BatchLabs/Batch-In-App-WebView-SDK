/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/triple-slash-reference */
// noinspection DuplicatedCode
/// <reference path="./private-sdk.d.ts" />

require("../src/sdk");

describe("test bridge methods", () => {
  let sdk: PrivateSDK;
  let mockedPostBrowserMessage: jest.Mock;
  function expectPromise(value: any): void {
    expect(value).toBeInstanceOf(Promise);
  }
  function expectSDKToHaveCalledNativeMethod(method: string, args: { [key: string]: any }): void {
    expect(mockedPostBrowserMessage).toBeCalledWith(expect.any(Number), method, args);
  }

  beforeEach(() => {
    // Instantiate a SDK and mock _sendNativeMessage
    // Another ugly hack due to no module bundler
    // (okay I might change this later)
    const sdkConstructor = window.batchInAppSDK.constructor as { new (): PrivateSDK };

    sdk = new sdkConstructor();
    mockedPostBrowserMessage = jest.fn();
    sdk._postBrowserMessage = mockedPostBrowserMessage;
  });

  afterEach(() => {
    sdk._deinit();
  });

  test("getAdvertisingID", () => {
    expectPromise(sdk.getAdvertisingID());
    expectSDKToHaveCalledNativeMethod("getAttributionID", {});
  });

  test("getInstallationID", () => {
    expectPromise(sdk.getInstallationID());
    expectSDKToHaveCalledNativeMethod("getInstallationID", {});
  });

  test("getCustomRegion", () => {
    expectPromise(sdk.getCustomRegion());
    expectSDKToHaveCalledNativeMethod("getCustomRegion", {});
  });

  test("getCustomLanguage", () => {
    expectPromise(sdk.getCustomLanguage());
    expectSDKToHaveCalledNativeMethod("getCustomLanguage", {});
  });

  test("getCustomUserID", () => {
    expectPromise(sdk.getCustomUserID());
    expectSDKToHaveCalledNativeMethod("getCustomUserID", {});
  });

  test("getCustomPayload", () => {
    expectPromise(sdk.getCustomPayload());
    expectSDKToHaveCalledNativeMethod("getCustomPayload", {});
  });

  test("getTrackingID", () => {
    expectPromise(sdk.getTrackingID());
    expectSDKToHaveCalledNativeMethod("getTrackingID", {});
  });

  test("openDeeplink", () => {
    expect((sdk.openDeeplink as any)()).toBeUndefined();
    expect((sdk.openDeeplink as any)(22)).toBeUndefined();
    expect(sdk.openDeeplink("test1")).toBeUndefined();
    expect(sdk.openDeeplink("test2", true)).toBeUndefined();
    expect(sdk.openDeeplink("test3", false)).toBeUndefined();
    // @ts-expect-error Testing wrong openInApp type
    expect(sdk.openDeeplink("test4", 33)).toBeUndefined();
    // @ts-expect-error Testing wrong openInApp type
    expect(sdk.openDeeplink("test5", "invalid")).toBeUndefined();
    expect(sdk.openDeeplink("test6", undefined, "test_analytics")).toBeUndefined();
    // @ts-expect-error Testing wrong analytics ID type
    expect(sdk.openDeeplink("test7", undefined, 2)).toBeUndefined();
    // @ts-expect-error Testing wrong analytics ID type
    expect(sdk.openDeeplink("test8", undefined, null)).toBeUndefined();
    expect(sdk.openDeeplink("test9", true, "test_analytics")).toBeUndefined();

    expect(mockedPostBrowserMessage).toHaveBeenCalledTimes(9);
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test1" });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test2", openInApp: true });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test3", openInApp: false });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test4" });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test5" });
    expectSDKToHaveCalledNativeMethod("openDeeplink", {
      url: "test6",
      analyticsID: "test_analytics",
    });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test7" });
    expectSDKToHaveCalledNativeMethod("openDeeplink", { url: "test8" });
    expectSDKToHaveCalledNativeMethod("openDeeplink", {
      url: "test9",
      openInApp: true,
      analyticsID: "test_analytics",
    });
  });

  test("performAction", () => {
    expect((sdk.performAction as any)()).toBeUndefined();
    expect((sdk.performAction as any)("test1")).toBeUndefined();
    expect((sdk.performAction as any)("test2", [])).toBeUndefined();
    expect((sdk.performAction as any)("test3", "bad_value")).toBeUndefined();
    expect(sdk.performAction("test4", {})).toBeUndefined();
    expect(
      sdk.performAction("test5", { complex: { key: "value" }, str: "test_string" })
    ).toBeUndefined();
    expect(
      sdk.performAction(
        "test5",
        { complex: { key: "value" }, str: "test_string" },
        "test_analytics"
      )
    ).toBeUndefined();
    expect(
      // @ts-expect-error Testing wrong analytics ID type
      sdk.performAction("test5", { complex: { key: "value" }, str: "test_string" }, 22)
    ).toBeUndefined();
    expect(mockedPostBrowserMessage).toHaveBeenCalledTimes(7);
    expectSDKToHaveCalledNativeMethod("performAction", { name: "test1", args: {} });
    expectSDKToHaveCalledNativeMethod("performAction", { name: "test2", args: {} });
    expectSDKToHaveCalledNativeMethod("performAction", { name: "test3", args: {} });
    expectSDKToHaveCalledNativeMethod("performAction", { name: "test4", args: {} });
    expectSDKToHaveCalledNativeMethod("performAction", {
      name: "test5",
      args: { complex: { key: "value" }, str: "test_string" },
    });
    expectSDKToHaveCalledNativeMethod("performAction", {
      name: "test5",
      args: { complex: { key: "value" }, str: "test_string" },
      analyticsID: "test_analytics",
    });
    expectSDKToHaveCalledNativeMethod("performAction", {
      name: "test5",
      args: { complex: { key: "value" }, str: "test_string" },
    });
  });

  test("dismiss", () => {
    expect(sdk.dismiss()).toBeUndefined();
    expectSDKToHaveCalledNativeMethod("dismiss", {});
    // @ts-expect-error Testing wrong analytics ID type
    expect(sdk.dismiss(2)).toBeUndefined();
    expectSDKToHaveCalledNativeMethod("dismiss", {});
    // @ts-expect-error Testing wrong analytics ID type
    expect(sdk.dismiss(null)).toBeUndefined();
    expectSDKToHaveCalledNativeMethod("dismiss", {});
    expect(sdk.dismiss("test_analytics")).toBeUndefined();
    expectSDKToHaveCalledNativeMethod("dismiss", { analyticsID: "test_analytics" });
  });
});
