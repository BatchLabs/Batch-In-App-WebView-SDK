# Batch In-App WebView SDK


# Integrating the SDK into your web page

Add the following tag on your page:
```
<head>
<script src="https://cdn.jsdelivr.net/npm/@batch.com/in-app-webview-sdk@1.0/build/batch-webview-sdk.min.js"></script>
```
As the script is very light, we encourage you to synchronously load it in `<head>` so that it is always available.

You can also host `batch-webview-sdk.min.js` on your own server. 

Releases are [published on npm]](https://www.npmjs.com/package/@batch.com/in-app-webview-sdk): `@batch.com/in-app-webview-sdk`

# Developing the SDK

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