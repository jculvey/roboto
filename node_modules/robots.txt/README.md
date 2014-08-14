## Robots.txt

Pass in the location of your `robots.txt` file on the file system, and this module
will return you a piece of Connect/Express middleware that will serve it at `GET /robots.txt`.

This makes one *synchronous* call to read the file upon start up, then reads it from memory
for every request. If you gave the wrong path, you will know about it at startup. Cache headers
are set for you.

## Installation

    npm install --save robots.txt

## Usage

    var robots = require('robots.txt')

    // Pass in the absolute path to your robots.txt file
    app.use(robots(__dirname + '/robots.txt'))

## Credits
Built by [Tom Gallacher](http://twitter.com/tomgco) and [Ben Gourley](https://github.com/bengourley)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
