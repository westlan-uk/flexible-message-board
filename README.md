#Node FMB
####A potential replacement for Flexible Message Board
___


###Prerequisites

Install NPM and run the following commands in the Node FMB folder:

    npm install express
    npm install socket.io
    npm install fs
    npm install body-parser
    npm install cookie-parser
    npm install express-session
    npm install serve-index

___


###Usage

* Run `app.js` using NodeJS.
    * Format: `node app.js`
    * Example: `node app.js admin1234`
* Go to `/` to view the output of FMB.
* Go to `/control` to control the output.

___


### Tests

This project uses nodeunit to run tests, at the moment there is no coverage. 

	npm install nodeunit

Once installed, tests can be run from the base directory, specifying "tests" as
the directory that contains all the tests.

	nodeunit tests

###Message Formats

Sent as application/json POST requests

####Youtube - `/youtube`

    {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=L3yAImNACTw",
        expire: 0
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
* `type` - Defines the message type
* `url` - URL Relevant to the type. (youtube video etc.)
* `priority` - See Priority section below

If `0` is used for `expire`, it will be treated as infinite.

#### Priority
* 3 - Override - Display Immediately
* 2 - Next - Appear after current slides
* 1 - Add - Add to slide loop

### Other

#### Sounds
* [204424 jaraxe alarm 3][jaraxe alarm 3]


[jaraxe alarm 3]: https://freesound.org/people/JarAxe/sounds/204424/
