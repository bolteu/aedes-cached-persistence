# aedes-cached-persistence&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/aedes-cached-persistence.svg)](https://travis-ci.org/mcollina/aedes-cached-persistence)

Abstract class to write an [Aedes][aedes] [persistence][persistence] with in-process caching of subscriptions.
It implements the API defined by [aedes-persistence](persistence).

* [Install](#install)
* [Provided methods](#api)
* [Implement another persistence](#implement)
* [License](#license)

<a name="install"></a>
## Install
To install aedes-cached--persistence, simply use npm:

```
npm install aedes-cached-persistence --save
```

## Provided methods

  * <a href="http://github.com/mcollina/aedes-persistence#constructor"><code><b>CachedPersistence()</b></code></a>
  * <a href="http://github.com/mcollina/aedes-persistence#subscriptionsByTopic"><code>instance.<b>subscriptionsByTopic()</b></code></a>
  * <a href="http://github.com/mcollina/aedes-persistence#cleanSubscriptions"><code>instance.<b>cleanSubscriptions()</b></code></a>
  * <a href="http://github.com/mcollina/aedes-persistence#destroy"><code>instance.<b>destroy()</b></code></a>

## Implement another persistence

### Inheritance

In order to reuse aedes-cached-persistence, you need to:

```js
'use strict'

var util = require('util')
var CachedPersistence = require('aedes-cached-persistence')

// if you need http://npm.im/aedes-packet, it is available
// from this module as well
// var Packet = CachedPersistence.Packet

function MyPersistence (opts) {
  if (!(this instanceof MyPersistence)) {
    return new MyPersistence(opts)
  }
  // initialize your data here

  CachedPersistence.call(this, opts)
}

util.inherits(MyPersistence, CachedPersistence)

MyPersistence.prototype.addSubscriptions = function (client, subs, cb) {
  // ..persistence specific implementation..

  // call this._addedSubscriptions when you are done
  this._addedSubscriptions(client, subsObjs, cb)
}

MyPersistence.prototype.removeSubscriptions = function (client, subs, cb) {
  // ..persistence specific implementation..

  // call this._addedSubscriptions when you are done
  this._removedSubscriptions(client, subs.map(subs, client), cb)
}

function toSubObj (sub) {
  return {
    clientId: this.id,
    topic: sub.topic
  }
}
```

### Tests

A persistence needs to pass all tests defined in
[./abstract.js](./abstract.js). You can import and use that test suite
in the following manner:

```js
var test = require('tape').test
var myperst = require('./')
var abs = require('aedes-cached-persistence/abstract')

abs({
  test: test,
  persistence: myperst
})
```

If you require some async stuff before returning, a callback is also
supported:

```js
var test = require('tape').test
var myperst = require('./')
var abs = require('aedes-persistence/abstract')
var clean = require('./clean') // invented module

abs({
  test: test,
  buildEmitter: require('mymqemitter'), // optional
  persistence: function build (cb) {
    clean(function (err) {
      cb(err, myperst())
    })
  }
})
```

## License

MIT

[aedes]: http://npm.im/aedes
[aedes-persistence]: http://npm.im/aedes-persistence
