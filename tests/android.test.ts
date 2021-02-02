/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./private-sdk.d.ts" />

require("../src/sdk");
const Task = require("./task");

const privateSDK = window.batchInAppSDK as PrivateSDK;

// Those tests break with --runInBand until we get a module bundler

beforeAll(() => {
  privateSDK._platform = 2;
});

beforeEach(() => {
  // Reset callbacks
  privateSDK._tasks = {};
  privateSDK._taskCounter = 0;
});

afterAll(() => {
  privateSDK._platform = 0;
});

function mockBridgeResult(error?: string | null, result?: string | null) {
  window._batchAndroidBridge = {
    postMessage: jest.fn().mockReturnValue(JSON.stringify({
      error,
      result,
    })),
  };
}

it("detects android", () => {
  // Another ugly hack due to no module bundler
  // (okay I might change this later)
  const sdkConstructor = window.batchInAppSDK.constructor as { new (): PrivateSDK };

  window._batchAndroidBridge = {
    postMessage: (_message, _args) => {
      // Do nothing
      return JSON.stringify({
        error: "",
        result: "",
      });
    },
  };

  const testSDK = new sdkConstructor();
  expect(testSDK.getPlatform()).toEqual("ANDROID");
});

it("calls the batchAndroidBridge when on Android", () => {
  const mockAndroidHandler = jest.fn();
  window._batchAndroidBridge = {
    postMessage: mockAndroidHandler,
  };

  window.batchInAppSDK.dismiss();
  expect(mockAndroidHandler).toHaveBeenCalledTimes(1);
  expect(mockAndroidHandler).toHaveBeenCalledWith("dismiss", "{}");
});

it("can be called back from android with error", async () => {
  // Android tests must be end to end due to the bridge being synchronous
  const expectedError = "err";
  mockBridgeResult(expectedError, undefined);
  let promise = privateSDK._sendNativeMessage("getAdvertisingID", {});
  await expect(promise).rejects.toEqual(expectedError);

  mockBridgeResult(expectedError, null);
  promise = privateSDK._sendNativeMessage("getAdvertisingID", {});
  await expect(promise).rejects.toEqual(expectedError);

  // Error takes precedence on result
  mockBridgeResult(expectedError, "foo");
  promise = privateSDK._sendNativeMessage("getAdvertisingID", {});
  await expect(promise).rejects.toEqual(expectedError);

  // Test that the SDK cleaned up properly
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});

it("can be called back from android with a result", async () => {
  // Android tests must be end to end due to the bridge being synchronous
  const expectedResult = "res";

  mockBridgeResult(undefined, expectedResult);
  let promise = privateSDK._sendNativeMessage("getAdvertisingID", {});
  await expect(promise).resolves.toEqual(expectedResult);

  mockBridgeResult(null, expectedResult);
  promise = privateSDK._sendNativeMessage("getAdvertisingID", {});
  await expect(promise).resolves.toEqual(expectedResult);

  // Test that the SDK cleaned up properly
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});
