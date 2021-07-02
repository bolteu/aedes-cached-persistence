/* eslint-disable no-var */
'use strict'

const { Packet } = require('aedes-persistence')
const EE = require('events').EventEmitter
const inherits = require('util').inherits
const MultiStream = require('multistream')
const parallel = require('fastparallel')
const subTopic = '$SYS/sub/+'

function CachedPersistence (opts) {
  if (!(this instanceof CachedPersistence)) {
    return new CachedPersistence(opts)
  }

  EE.call(this)

  this.destroyed = false
  this._parallel = parallel()
  this._waiting = {}
}

inherits(CachedPersistence, EE)

CachedPersistence.prototype.cleanSubscriptions = function (client, cb) {
  const that = this
  this.subscriptionsByClient(client, function (err, subs, client) {
    if (err || !subs) { return cb(err, client) }
    subs = subs.map(subToTopic)
    that.removeSubscriptions(client, subs, cb)
  })
}

CachedPersistence.prototype.outgoingEnqueueCombi = function (subs, packet, cb) {
  this._parallel({
    persistence: this,
    packet: packet
  }, outgoingEnqueue, subs, cb)
}

function outgoingEnqueue (sub, cb) {
  this.persistence.outgoingEnqueue(sub, this.packet, cb)
}

CachedPersistence.prototype.createRetainedStreamCombi = function (patterns) {
  const that = this
  const streams = patterns.map(function (p) {
    return that.createRetainedStream(p)
  })
  return MultiStream.obj(streams)
}

CachedPersistence.prototype.destroy = function (cb) {
  this.destroyed = true
  if (cb) {
    cb();
  }
}


function subToTopic (sub) {
  return sub.topic
}

Object.defineProperty(CachedPersistence.prototype, 'broker', {
  enumerable: false,
  get: function () {
    return this._broker
  },
  set: function (broker) {
    this._broker = broker
    setImmediate(() => this.emit('ready'));
  }
})

module.exports = CachedPersistence
module.exports.Packet = Packet
