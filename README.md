# Node FMB
#### A replacement for Flexible Message Board
___

Please see the `develop` branch util we have a stable release.
=======
### Prerequisites
Install NPM and run the following commands in the Node FMB folder:

	npm install

Ensure that `messages.js` and `settings.js` exist as empty JSON files in one of the following locations:
* `./configuration/`
* `C:\ProgramData\fmb\`
* `/etc/fmb/`

### Usage
___
* Run by using the command `npm start`.
* Go to `/` to view the output of FMB.
* Go to `/control` to control the output.
___

Default port is `1337`.
Default admin password is `123`.


#### Priority
* 1 - Override - Display Immediately
* 2 - Next - Appear after current slides
* 3 - Add - Add to slide loop

### Other

#### Known Issues
* Directly accessing admin areas via URI currently not protected
* Form submissions require more extensive validation (server and client)

#### Desired Features
* Status page to monitor screen connections & status. Ability to refresh individual screens.

#### Sounds
* [204424 jaraxe alarm 3][jaraxe alarm 3]


[jaraxe alarm 3]: https://freesound.org/people/JarAxe/sounds/204424/
