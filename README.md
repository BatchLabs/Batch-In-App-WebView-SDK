# Batch In-App WebView SDK

This repository hosts:
 - The Javascript "bridge" SDK, which allows communication from the page to the native component of Batch in iOS / Android apps.
 - A development kit, which is a simple webpage that allows testing of your implementation of the SDK in your page.  
   See the devkit folder's README for more info
 - A sample template, implementing a user survey.  
   The sample is responsive, implements iOS specific guidelines and uses the Javascript SDK to track events back to Batch.  
   See `devkit/samples/survey` for more information.

# Requirements

This SDK requires a relatively modern browser that supports `Promise`.  
On iOS/Android, it requires Batch SDK 1.17 or higher.

# Integrating the SDK into your web page

Add the following tag on your page:
```
<head>
<script src="https://cdn.jsdelivr.net/npm/@batch.com/in-app-webview-sdk@1.0/build/batch-webview-sdk.min.js"></script>
```
As the script is very light, we encourage you to synchronously load it in `<head>` so that it is always available.

The SDK will be available as a global object called `batchInAppSDK`.

You can also host `batch-webview-sdk.min.js` on your own server. 

Releases are [published on npm](https://www.npmjs.com/package/@batch.com/in-app-webview-sdk): `@batch.com/in-app-webview-sdk`

## API Reference

The API reference can be found [here, in the form of a Typescript definition](https://github.com/BatchLabs/Batch-In-App-WebView-SDK/blob/master/src/index.d.ts).

## Developing the SDK

Files are located in "src" and are built in "build".

src is typescript that compiles to ES5. Be careful about runtime dependencies, as Typescript doesn't polyfill them.

It's a standard typescript project so use your favourite editor. The repository comes preconfigured for IntelliJ (Webstorm/Phpstorm/Ultimate)
and VSCode.

Your editor should have an eslint plugin enabled. Formatting will be handled via prettier.

# Build the SDK

```
npm run build-minified
```


This will output `build/batch-webview-sdk.min.js`

# Serve it

`npm run serve`

This will serve the SDK on port 9094.
A devkit will also be available on http://localhost:9094

Note: This expects you to have built the SDK using `npm run build-minified`.

# Watch

```
npm run watch
```

Combines build & serve, will automatically rebuild the SDK when changes occur.
