/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/triple-slash-reference */
// noinspection DuplicatedCode
/// <reference path="./private-sdk.d.ts" />

require("../src/sdk");
const Task = require("./task");

const privateSDK = window.batchInAppSDK as PrivateSDK;

beforeEach(() => {
  // Reset callbacks
  privateSDK._tasks = {};
  privateSDK._taskCounter = 0;
});

it("calls postMessage when on a browser", () => {
  // Backup postMessage as jsdom isn't fully reset between tests
  const originalPostMessage = window.parent.postMessage;
  try {
    const mockPostMessage = jest.fn();
    window.parent.postMessage = mockPostMessage;
    window.batchInAppSDK.dismiss();
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith(
      {
        from: "batch-in_app-sdk",
        taskID: 1,
        method: "dismiss",
        args: {},
      },
      "*"
    );
  } finally {
    window.parent.postMessage = originalPostMessage;
  }
});

it("can be called back from iframe with error", async () => {
  // We can't use await, as postMessage will not trigger until after all awaits
  const pendingTests = [];

  let mockTaskID = 123456;
  const expectedError = "err";
  let task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  window.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID: mockTaskID,
      error: expectedError,
      result: undefined,
    },
    "*"
  );

  pendingTests.push(expect(task.promise).rejects.toEqual(expectedError));

  mockTaskID++;
  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  window.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID: mockTaskID,
      error: expectedError,
      result: null,
    },
    "*"
  );
  pendingTests.push(expect(task.promise).rejects.toEqual(expectedError));

  // Error takes precedence on result
  mockTaskID++;
  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  window.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID: mockTaskID,
      error: expectedError,
      result: "foo",
    },
    "*"
  );
  pendingTests.push(expect(task.promise).rejects.toEqual(expectedError));

  const allAsyncTests = Promise.all(pendingTests);

  // This test needs to be done after all tests
  return allAsyncTests.then(() => {
    return new Promise<void>((resolve) => {
      // Test that the SDK cleaned up properly
      expect(Object.keys(privateSDK._tasks).length).toEqual(0);
      resolve();
    });
  });
});

it("can be called back from iframe with a result", async () => {
  // We can't use await, as postMessage will not trigger until after all awaits
  const pendingTests = [];

  let mockTaskID = 123456;
  const expectedResult = "res";

  mockTaskID++;
  let task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  window.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID: mockTaskID,
      error: undefined,
      result: expectedResult,
    },
    "*"
  );
  pendingTests.push(expect(task.promise).resolves.toEqual(expectedResult));

  mockTaskID++;
  task = new Task();
  privateSDK._tasks[mockTaskID] = task;
  window.postMessage(
    {
      from: "batch-in_app-sdk-callback",
      taskID: mockTaskID,
      error: null,
      result: expectedResult,
    },
    "*"
  );
  pendingTests.push(expect(task.promise).resolves.toEqual(expectedResult));

  const allAsyncTests = Promise.all(pendingTests);

  // This test needs to be done after all tests
  return allAsyncTests.then(() => {
    return new Promise<void>((resolve) => {
      // Test that the SDK cleaned up properly
      expect(Object.keys(privateSDK._tasks).length).toEqual(0);
      resolve();
    });
  });
});
