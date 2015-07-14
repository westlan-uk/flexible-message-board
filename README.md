#Node FMB
####A potential replacement for Flexible Message Board
___


###Prerequisites

Install NPM and run the following commands in the Node FMB folder:

    npm install express
    npm install socket.io
    npm install body-parser
    npm install cookie-parser
    npm install express-session

___


###Usage

* Run app.js using NodeJS.
    * Format: `node app.js {adminPassword}`
    * Example: `node app.js admin1234`
* Go to /screen to view the output of FMB.
* Go to /control to control the output.

___


###Message Formats

Sent as application/json POST requests

####Youtube - `/youtube`

    {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=L3yAImNACTw",
        time: 0
    }

####Standard HTML - `/html`

    {
        type: "html",
        content: "<p>I love text messages</p>",
        expire: 0,
        urgent: true,
        delay: 10
    }

#### Message Key
* `content` - Content to be displayed
* `delay` - Seconds message should show before proceeding
* `expire` - Seconds before message should expire
* `time` - Time video should play for
* `type` - Defines the message type
* `urgent` - Will override current message
* `url` - URL Relevant to the type. (youtube video etc.)

If 0 is used for a period of time, it will be treated as forever (or in the case of youtube video, when it ends).