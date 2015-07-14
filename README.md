#Node FMB
####A potential replacement for Flexible Message Board
___


###Prerequisites

Install NPM and run the following commands in the Node FMB folder:

    npm install express
    npm install socket.io

___


###Usage

* Run app.js using NodeJS.
* Go to /screen to view the output of FMB.
* Go to /control to control the output.

___


###Message Formats

####Youtube

    {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=L3yAImNACTw"
    }

####Standard HTML

    {
        type: "html",
        content: "<p>I love text messages</p>"
    }