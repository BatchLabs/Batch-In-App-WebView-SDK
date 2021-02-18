# Batch In-App WebView - 'Survey' Demo Template

## Features
 - Responsive design (works on both phones and tablets)
 - Batch In-App WebView Javascript SDK integration:
   - Batch events are triggered on survey answer
   - Custom payload is used to optionally specify a survey ID
   - A developer-controlled analytics ID is used on dismissal, both using the JS SDK and the `?batchAnalyticsID` query parameter

## How to use

To test this format, you will need to host the files on a web server so that it can be accessed by your test device. Any kind of static hosting will work.

You can also start a local webserver for tests.
For example, if python3 is available on your computer:

```
python3 -m http.serve
```

You can then use your internal IP address in the dashboard URL field, and send a test push.  
Example: `http://192.168.0.10:8080`