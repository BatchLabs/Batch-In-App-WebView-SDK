// Copy of "Task" in sdk.ts
// As we don't have a module bundler, we can't use imports in sdk.ts and I do not wish
// to make the build more complicated for the time being. Copy pasting is enough.
(function () {
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

    public handleCallback(error?: string | null, result?: string | null): void {
      // Perform type checking as we may be getting garbage from an outside source
      if (typeof error === "string" && error !== "") {
        this._promiseReject(error);
        return;
      }

      this._promiseResolve(typeof result === "string" ? result : undefined);
    }
  }
  module.exports = Task;
})();
