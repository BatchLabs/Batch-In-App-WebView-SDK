# Development Kit

This test page loads a template in an iframe and displays raw messages emitted by the Javascript SDK on the right.  
It allows for easy testing of `batchInAppSDK` implementation.

The devkit will also implement `batchInAppSDK` with test values.

## How to use

Open index.html in a browser.  
Set the URL to the server serving your in-development template web page, and click `Load`.

When performing actions on `batchInAppSDK`, they will be logged on the right.

Note: Due to how iframes work in a browser, you might need to reload the page when you update the page you're working on or it will not refresh.  
You can use `Remeber URL` to save the URL you're currently displaying: it will automatically be restored on reload.