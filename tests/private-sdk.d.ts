/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../src/index.d.ts" />
/// <reference path="../src/window.d.ts" />
/// <reference path="./task.ts" />

/* Type definitions that expose private members */

interface SDKTasks {
  [key: number]: typeof Task;
}

declare enum SDKPlatform {
  DESKTOP,
  IOS,
  ANDROID,
}

interface MessageArgs {
  [key: string]: unknown;
}

interface PrivateSDK extends BatchInAppSDK.SDK {
  _taskCounter: number;
  _tasks: SDKTasks;
  _platform: SDKPlatform;
  __onWebkitCallback(taskID: unknown, response?: BatchWebkitBridgeResponse): void;
  _sendNativeMessage(method: string, args: MessageArgs): Promise<string | undefined>;
  _postBrowserMessage(taskID: number, method: string, args: MessageArgs): void;
  _deinit(): void;
}
