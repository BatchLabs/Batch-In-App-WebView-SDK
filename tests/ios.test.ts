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
  privateSDK._platform = 1;
});

beforeEach(() => {
  // Reset callbacks
  privateSDK._tasks = {};
  privateSDK._taskCounter = 0;
});

afterAll(() => {
  privateSDK._platform = 0;
});

it("detects iOS", () => {
  // Another ugly hack due to no module bundler
  // (okay I might change this later)
  const sdkConstructor = window.batchInAppSDK.constructor as { new (): PrivateSDK };

  window.webkit = {
    messageHandlers: {
      batchBridge: {
        postMessage: (_) => {
          // Nothing
        },
      },
    },
  };

  const testSDK = new sdkConstructor();
  expect(testSDK.getPlatform()).toEqual("IOS");
});

it("can get the result from a callback on iOS 13 and lower", async () => {
  window.webkit = {
    messageHandlers: {
      batchBridge: {
        postMessage: (message) => {
          privateSDK.__onWebkitCallback(message.taskID, {
            result: "ok",
          });
        },
      },
    },
  };

  const installationID = window.batchInAppSDK.getInstallationID();
  await expect(installationID).resolves.toEqual("ok");
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});

it("can error from a callback on iOS 13 and lower", async () => {
  window.webkit = {
    messageHandlers: {
      batchBridge: {
        postMessage: (message) => {
          privateSDK.__onWebkitCallback(message.taskID, { error: "test_error" });
        },
      },
    },
  };

  const installationID = window.batchInAppSDK.getInstallationID();
  await expect(installationID).rejects.toEqual("test_error");
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});

it("can get the result from a promise on iOS 14", async () => {
  window.webkit = {
    messageHandlers: {
      batchBridge: {
        postMessage: () => {
          return Promise.resolve("ok");
        },
      },
    },
  };

  const installationID = window.batchInAppSDK.getInstallationID();
  await expect(installationID).resolves.toEqual("ok");
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});

it("can error from a promise on iOS 14", async () => {
  window.webkit = {
    messageHandlers: {
      batchBridge: {
        postMessage: () => {
          return Promise.reject("test_error");
        },
      },
    },
  };

  const installationID = window.batchInAppSDK.getInstallationID();
  await expect(installationID).rejects.toEqual("test_error");
  expect(Object.keys(privateSDK._tasks).length).toEqual(0);
});

it("calls webkit message handler when on iOS", () => {
  const mockWebkitHandler = jest.fn();
  window.webkit = {
    messageHandlers: {
      batchBridge: { postMessage: mockWebkitHandler },
    },
  };

  window.batchInAppSDK.dismiss();
  expect(mockWebkitHandler).toHaveBeenCalledTimes(1);
  expect(mockWebkitHandler).toHaveBeenCalledWith({
    taskID: 1,
    method: "dismiss",
    args: {},
  });
});

it("can be called back from iOS with error", async () => {
  const mockTaskID = 123456;
  const expectedError = "err";
  let task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  privateSDK.__onWebkitCallback(mockTaskID, { error: expectedError, result: undefined });
  await expect(task.promise).rejects.toEqual(expectedError);

  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  privateSDK.__onWebkitCallback(mockTaskID, { error: expectedError, result: null });
  await expect(task.promise).rejects.toEqual(expectedError);

  // Error takes precedence on result
  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  privateSDK.__onWebkitCallback(mockTaskID, { error: expectedError, result: "foo" });
  await expect(task.promise).rejects.toEqual(expectedError);

  // Test that the SDK cleaned up properly
  expect(privateSDK._tasks[mockTaskID]).toBeUndefined();
});

it("can be called back from iOS with a result", async () => {
  const mockTaskID = 123456;
  const expectedResult = "res";

  let task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  privateSDK.__onWebkitCallback(mockTaskID, { error: undefined, result: expectedResult });
  await expect(task.promise).resolves.toEqual(expectedResult);

  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  privateSDK.__onWebkitCallback(mockTaskID, { error: null, result: expectedResult });
  await expect(task.promise).resolves.toEqual(expectedResult);

  // Test that the SDK cleaned up properly
  expect(privateSDK._tasks[mockTaskID]).toBeUndefined();
});
