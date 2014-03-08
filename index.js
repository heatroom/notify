var template = require('./template');
var list = require('./list');
var domify = require('domify');
var after = require('after-transition').once;
var store = require('store');

/**
 * Current active notification
 */
var active;

/**
 * Queue of messages. Whenever a message is hidden
 * it will check the queue and display the next one automatically
 *
 * @type {Array}
 */

var queue = [];

function next() {
  active = null;
  if(queue.length) {
    var item = queue.shift();
    item.show();
  }
}

/**
 * Create a list and add it to the DOM. All notifications
 * will be added to this list.
 */
var list = domify(list);
document.body.appendChild(list);

/**
 * Create a notification
 *
 * @param {String} message
 * @param {String} type
 */

function Notification(message, type) {
if(!(this instanceof Notification)) {
  return new Notification(message, type);
}
this.el = domify(template);
this.content(message);
this.type(type);
}

/**
 * Set the message content
 *
 * @param {String} message
 *
 * @return {Notification}
 */

Notification.prototype.content = function (message) {
  this.el.innerHTML = message;
  return this;
};

/**
 * Set the notification type. This could be
 * 'warning', 'info', 'error' or 'success'
 *
 * @param {String} type
 *
 * @return {Notification}
 */
Notification.prototype.type = function (type) {
  this.el.classList.add(type);
  return this;
};


/**
 * Set the duration for the notification to be displayed
 *
 * @param {Number} dur
 *
 * @return {Notification}
 */
Notification.prototype.duration = function (dur) {
  this.duration = dur;
  return this;
};

/**
 * Show the notification. If there is currently a
 * notification being displayed, it will be added
 * to the queue and will show when the queue is empty.
 *
 * @return {Notification}
 */

Notification.prototype.show = function (duration){
  if(active && active !== this) {
    queue.push(this);
    return this;
  }
  active = this;
  list.appendChild(this.el);
  this.el.offsetHeight;
  this.el.classList.remove('hide');
  setTimeout(this.hide.bind(this), duration || 1500);
  return this;
};

/**
 * Hide the notification and show the next
 * item in the queue
 *
 * @return {Notification}
 */

 Notification.prototype.hide = function () {
  var self = this;
  function end() {
    next();
    list.removeChild(self.el);
  }
  after(this.el, end);
  this.el.classList.add('hide');
 };

/**
 * Warning-level message
 *
 * @param {String} message
 *
 * @return {Notification}
 */
exports.warn = function(message, duration){
  return Notification(message, 'warning').show(duration);
};

/**
 * Success-level message
 *
 * @param {String} message
 *
 * @return {Notification}
 */
exports.success = function(message, duration){
  return Notification(message, 'success').show(duration);
};

/**
 * Error-level message
 *
 * @param {String} message
 *
 * @return {Notification}
 */
exports.error = function(message, duration){
  return Notification(message, 'error').show(duration);
};

/**
 * Store a message for showing on the next page
 *
 * @param {String} id
 * @param {String} type
 * @param {String} message
 * @param {Number} duration
 *
 * @return {[type]}
 */
exports.flash = function(id, type, message, duration){
  if(arguments.length === 1) {
    var data = store(id);
    if(!data) return;
    exports[data.type](data.message, data.duration);
    store(id, null);
    return;
  }
  store(id, {
    type: type,
    message: message,
    duration: duration
  });
};


/**
 * In case you want to do something custom
 *
 * @type {Function}
 */
exports.Notification = Notification;



