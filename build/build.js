
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
  \n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("yields-has-transitions/index.js", Function("exports, require, module",
"/**\n\
 * Check if `el` or browser supports transitions.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports = module.exports = function(el){\n\
  switch (arguments.length) {\n\
    case 0: return bool;\n\
    case 1: return bool\n\
      ? transitions(el)\n\
      : bool;\n\
  }\n\
};\n\
\n\
/**\n\
 * Check if the given `el` has transitions.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function transitions(el, styl){\n\
  if (el.transition) return true;\n\
  styl = window.getComputedStyle(el);\n\
  return !! parseFloat(styl.transitionDuration, 10);\n\
}\n\
\n\
/**\n\
 * Style.\n\
 */\n\
\n\
var styl = document.body.style;\n\
\n\
/**\n\
 * Export support.\n\
 */\n\
\n\
var bool = 'transition' in styl\n\
  || 'webkitTransition' in styl\n\
  || 'MozTransition' in styl\n\
  || 'msTransition' in styl;\n\
//@ sourceURL=yields-has-transitions/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("ecarter-css-emitter/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var events = require('event');\n\
\n\
// CSS events\n\
\n\
var watch = [\n\
  'transitionend'\n\
, 'webkitTransitionEnd'\n\
, 'oTransitionEnd'\n\
, 'MSTransitionEnd'\n\
, 'animationend'\n\
, 'webkitAnimationEnd'\n\
, 'oAnimationEnd'\n\
, 'MSAnimationEnd'\n\
];\n\
\n\
/**\n\
 * Expose `CSSnext`\n\
 */\n\
\n\
module.exports = CssEmitter;\n\
\n\
/**\n\
 * Initialize a new `CssEmitter`\n\
 *\n\
 */\n\
\n\
function CssEmitter(element){\n\
  if (!(this instanceof CssEmitter)) return new CssEmitter(element);\n\
  this.el = element;\n\
}\n\
\n\
/**\n\
 * Bind CSS events.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
CssEmitter.prototype.bind = function(fn){\n\
  for (var i=0; i < watch.length; i++) {\n\
    events.bind(this.el, watch[i], fn);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind CSS events\n\
 * \n\
 * @api public\n\
 */\n\
\n\
CssEmitter.prototype.unbind = function(fn){\n\
  for (var i=0; i < watch.length; i++) {\n\
    events.unbind(this.el, watch[i], fn);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Fire callback only once\n\
 * \n\
 * @api public\n\
 */\n\
\n\
CssEmitter.prototype.once = function(fn){\n\
  var self = this;\n\
  function on(){\n\
    self.unbind(on);\n\
    fn.apply(self.el, arguments);\n\
  }\n\
  self.bind(on);\n\
  return this;\n\
};\n\
\n\
//@ sourceURL=ecarter-css-emitter/index.js"
));
require.register("component-once/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Identifier.\n\
 */\n\
\n\
var n = 0;\n\
\n\
/**\n\
 * Global.\n\
 */\n\
\n\
var global = (function(){ return this })();\n\
\n\
/**\n\
 * Make `fn` callable only once.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(fn) {\n\
  var id = n++;\n\
  var called;\n\
\n\
  function once(){\n\
    // no receiver\n\
    if (this == global) {\n\
      if (called) return;\n\
      called = true;\n\
      return fn.apply(this, arguments);\n\
    }\n\
\n\
    // receiver\n\
    var key = '__called_' + id + '__';\n\
    if (this[key]) return;\n\
    this[key] = true;\n\
    return fn.apply(this, arguments);\n\
  }\n\
\n\
  return once;\n\
};\n\
//@ sourceURL=component-once/index.js"
));
require.register("yields-after-transition/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
var has = require('has-transitions')\n\
  , emitter = require('css-emitter')\n\
  , once = require('once');\n\
\n\
/**\n\
 * Transition support.\n\
 */\n\
\n\
var supported = has();\n\
\n\
/**\n\
 * Export `after`\n\
 */\n\
\n\
module.exports = after;\n\
\n\
/**\n\
 * Invoke the given `fn` after transitions\n\
 *\n\
 * It will be invoked only if the browser\n\
 * supports transitions __and__\n\
 * the element has transitions\n\
 * set in `.style` or css.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @return {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function after(el, fn){\n\
  if (!supported || !has(el)) return fn();\n\
  emitter(el).bind(fn);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Same as `after()` only the function is invoked once.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
after.once = function(el, fn){\n\
  var callback = once(fn);\n\
  after(el, fn = function(){\n\
    emitter(el).unbind(fn);\n\
    callback();\n\
  });\n\
};\n\
//@ sourceURL=yields-after-transition/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~props.indexOf(_)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var expr = require('props');\n\
\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\" or \"age > 18 && age < 36\"\n\
  return new Function('_', 'return ' + get(str));\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
\n\
/**\n\
 * Built the getter function. Supports getter style functions\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(str) {\n\
  var props = expr(str);\n\
  if (!props.length) return '_.' + str;\n\
\n\
  var val;\n\
  for(var i = 0, prop; prop = props[i]; i++) {\n\
    val = '_.' + prop;\n\
    val = \"('function' == typeof \" + val + \" ? \" + val + \"() : \" + val + \")\";\n\
    str = str.replace(new RegExp(prop, 'g'), val);\n\
  }\n\
\n\
  return str;\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type = require('type');\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`\n\
 * in optional context `ctx`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} [ctx]\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn, ctx){\n\
  fn = toFunction(fn);\n\
  ctx = ctx || this;\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn, ctx);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn, ctx);\n\
      return object(obj, fn, ctx);\n\
    case 'string':\n\
      return string(obj, fn, ctx);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn, ctx) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn.call(ctx, key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj[i], i);\n\
  }\n\
}\n\
//@ sourceURL=component-each/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object Error]': return 'error';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val !== val) return 'nan';\n\
  if (val && val.nodeType === 1) return 'element';\n\
\n\
  return typeof val.valueOf();\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("yields-unserialize/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Unserialize the given \"stringified\" javascript.\n\
 * \n\
 * @param {String} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
module.exports = function(val){\n\
  try {\n\
    return JSON.parse(val);\n\
  } catch (e) {\n\
    return val || undefined;\n\
  }\n\
};\n\
//@ sourceURL=yields-unserialize/index.js"
));
require.register("yields-store/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var each = require('each')\n\
  , unserialize = require('unserialize')\n\
  , storage = window.localStorage\n\
  , type = require('type');\n\
\n\
/**\n\
 * Store the given `key` `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports = module.exports = function(key, val){\n\
  switch (arguments.length) {\n\
    case 2: return set(key, val);\n\
    case 0: return all();\n\
    case 1: return 'object' == type(key)\n\
      ? each(key, set)\n\
      : get(key);\n\
  }\n\
};\n\
\n\
/**\n\
 * supported flag.\n\
 */\n\
\n\
exports.supported = !! storage;\n\
\n\
/**\n\
 * export methods.\n\
 */\n\
\n\
exports.set = set;\n\
exports.get = get;\n\
exports.all = all;\n\
\n\
/**\n\
 * Set `key` to `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 */\n\
\n\
function set(key, val){\n\
  return null == val\n\
    ? storage.removeItem(key)\n\
    : storage.setItem(key, JSON.stringify(val));\n\
}\n\
\n\
/**\n\
 * Get `key`.\n\
 *\n\
 * @param {String} key\n\
 * @return {Mixed}\n\
 */\n\
\n\
function get(key){\n\
  return null == key\n\
    ? storage.clear()\n\
    : unserialize(storage.getItem(key));\n\
}\n\
\n\
/**\n\
 * Get all.\n\
 *\n\
 * @return {Object}\n\
 */\n\
\n\
function all(){\n\
  var len = storage.length\n\
    , ret = {}\n\
    , key\n\
    , val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    key = storage.key(i);\n\
    ret[key] = get(key);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=yields-store/index.js"
));
require.register("notify/index.js", Function("exports, require, module",
"var template = require('./template');\n\
var list = require('./list');\n\
var domify = require('domify');\n\
var after = require('after-transition').once;\n\
var store = require('store');\n\
\n\
/**\n\
 * Current active notification\n\
 */\n\
var active;\n\
\n\
/**\n\
 * Queue of messages. Whenever a message is hidden\n\
 * it will check the queue and display the next one automatically\n\
 *\n\
 * @type {Array}\n\
 */\n\
\n\
var queue = [];\n\
\n\
function next() {\n\
  active = null;\n\
  if(queue.length) {\n\
    var item = queue.shift();\n\
    item.show();\n\
  }\n\
}\n\
\n\
/**\n\
 * Create a list and add it to the DOM. All notifications\n\
 * will be added to this list.\n\
 */\n\
var list = domify(list);\n\
document.body.appendChild(list);\n\
\n\
/**\n\
 * Create a notification\n\
 *\n\
 * @param {String} message\n\
 * @param {String} type\n\
 */\n\
\n\
function Notification(message, type) {\n\
if(!(this instanceof Notification)) {\n\
  return new Notification(message, type);\n\
}\n\
this.el = domify(template);\n\
this.content(message);\n\
this.type(type);\n\
}\n\
\n\
/**\n\
 * Set the message content\n\
 *\n\
 * @param {String} message\n\
 *\n\
 * @return {Notification}\n\
 */\n\
\n\
Notification.prototype.content = function (message) {\n\
  this.el.innerHTML = message;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the notification type. This could be\n\
 * 'warning', 'info', 'error' or 'success'\n\
 *\n\
 * @param {String} type\n\
 *\n\
 * @return {Notification}\n\
 */\n\
Notification.prototype.type = function (type) {\n\
  this.el.classList.add(type);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Set the duration for the notification to be displayed\n\
 *\n\
 * @param {Number} dur\n\
 *\n\
 * @return {Notification}\n\
 */\n\
Notification.prototype.duration = function (dur) {\n\
  this.duration = dur;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the notification. If there is currently a\n\
 * notification being displayed, it will be added\n\
 * to the queue and will show when the queue is empty.\n\
 *\n\
 * @return {Notification}\n\
 */\n\
\n\
Notification.prototype.show = function (duration){\n\
  if(active && active !== this) {\n\
    queue.push(this);\n\
    return this;\n\
  }\n\
  active = this;\n\
  list.appendChild(this.el);\n\
  this.el.offsetHeight;\n\
  this.el.classList.remove('hide');\n\
  setTimeout(this.hide.bind(this), duration || 1500);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the notification and show the next\n\
 * item in the queue\n\
 *\n\
 * @return {Notification}\n\
 */\n\
\n\
 Notification.prototype.hide = function () {\n\
  var self = this;\n\
  function end() {\n\
    next();\n\
    list.removeChild(self.el);\n\
  }\n\
  after(this.el, end);\n\
  this.el.classList.add('hide');\n\
 };\n\
\n\
/**\n\
 * Warning-level message\n\
 *\n\
 * @param {String} message\n\
 *\n\
 * @return {Notification}\n\
 */\n\
exports.warn = function(message, duration){\n\
  return Notification(message, 'warning').show(duration);\n\
};\n\
\n\
/**\n\
 * Success-level message\n\
 *\n\
 * @param {String} message\n\
 *\n\
 * @return {Notification}\n\
 */\n\
exports.success = function(message, duration){\n\
  return Notification(message, 'success').show(duration);\n\
};\n\
\n\
/**\n\
 * Error-level message\n\
 *\n\
 * @param {String} message\n\
 *\n\
 * @return {Notification}\n\
 */\n\
exports.error = function(message, duration){\n\
  return Notification(message, 'error').show(duration);\n\
};\n\
\n\
/**\n\
 * Store a message for showing on the next page\n\
 *\n\
 * @param {String} id\n\
 * @param {String} type\n\
 * @param {String} message\n\
 * @param {Number} duration\n\
 *\n\
 * @return {[type]}\n\
 */\n\
exports.flash = function(id, type, message, duration){\n\
  if(arguments.length === 1) {\n\
    var data = store(id);\n\
    if(!data) return;\n\
    exports[data.type](data.message, data.duration);\n\
    store(id, null);\n\
    return;\n\
  }\n\
  store(id, {\n\
    type: type,\n\
    message: message,\n\
    duration: duration\n\
  });\n\
};\n\
\n\
\n\
/**\n\
 * In case you want to do something custom\n\
 *\n\
 * @type {Function}\n\
 */\n\
exports.Notification = Notification;\n\
\n\
\n\
\n\
//@ sourceURL=notify/index.js"
));
require.register("notify/template.js", Function("exports, require, module",
"module.exports = '<div class=\"Notification hide\"></div>';//@ sourceURL=notify/template.js"
));
require.register("notify/list.js", Function("exports, require, module",
"module.exports = '<div class=\"Notifications\"></div>\\n\
';//@ sourceURL=notify/list.js"
));







require.alias("component-domify/index.js", "notify/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("yields-after-transition/index.js", "notify/deps/after-transition/index.js");
require.alias("yields-after-transition/index.js", "notify/deps/after-transition/index.js");
require.alias("yields-after-transition/index.js", "after-transition/index.js");
require.alias("yields-has-transitions/index.js", "yields-after-transition/deps/has-transitions/index.js");
require.alias("yields-has-transitions/index.js", "yields-after-transition/deps/has-transitions/index.js");
require.alias("yields-has-transitions/index.js", "yields-has-transitions/index.js");
require.alias("ecarter-css-emitter/index.js", "yields-after-transition/deps/css-emitter/index.js");
require.alias("component-event/index.js", "ecarter-css-emitter/deps/event/index.js");

require.alias("component-once/index.js", "yields-after-transition/deps/once/index.js");

require.alias("yields-after-transition/index.js", "yields-after-transition/index.js");
require.alias("yields-store/index.js", "notify/deps/store/index.js");
require.alias("yields-store/index.js", "store/index.js");
require.alias("component-each/index.js", "yields-store/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "yields-store/deps/type/index.js");

require.alias("yields-unserialize/index.js", "yields-store/deps/unserialize/index.js");

require.alias("notify/index.js", "notify/index.js");