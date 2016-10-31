//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
require("./savage-image.less");

var cache = {};

var getURL = function(url, callback) {
  if (url in cache) return cache[url].push(callback);
  cache[url] = [callback];
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.onload = function() {
    cache[url].forEach(function(cb) {
      cb(null, xhr.responseText);
    });
    delete cache[url];
  };
  xhr.onerror = function() {
    cache[url].forEach(function(cb) {
      cb(xhr.status);
    });
    delete cache[url];
  }
  xhr.send();
};

var proto = Object.create(HTMLElement.prototype);

proto.createdCallback = function() {};
proto.attachedCallback = function() {
  this.loadImage();
};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {
  this.loadImage();
};

proto.loadImage = function() {
  var self = this;
  var src = this.getAttribute("src");
  if (!src) return;
  self.readyState = 0;
  self.ready = getURL(src, function(err, response) {
    if (err) return;
    self.innerHTML = response;
    self.readyState = 4;
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("load", true, false, null);
    self.dispatchEvent(event);
    if (self.onload) self.onload();
  });
}

try {
  document.registerElement("savage-image", { prototype: proto });
} catch (e) {
  console.error("<savage-image> has already been registered.")
}