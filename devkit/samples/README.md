# Samples

Sample formats that are shipped with the dev kit to test features

## How to use

To test these formats, you will need to host the files on a web server so that it can be accessed by your test device. Any kind of static hosting will work.

You can also start a local webserver for tests.
For example, if python3 is available on your computer:

```
python3 -m http.serve
```

You can then use your internal IP address in the dashboard URL field, and send a test push.  
Example: `http://192.168.0.10:8080`