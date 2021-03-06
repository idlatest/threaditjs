(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["azalea"] = factory();
	else
		root["azalea"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var http = __webpack_require__(1);
	var road = __webpack_require__(2);
	var view = __webpack_require__(5);
	var river = __webpack_require__(6);

	function toString (value) {
		var type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
		return type;
	}

	function hash2Path (hash) {
		return hash.replace(/^(#\/|#)?/, '/');
	}

	function _azalea (context, routes, components, attribute) {
		
		var router = road(routes);

		var _render = view.call(context, null, components, attribute);

		var init = function() {
			var contextElementHTML = context.Element.innerHTML;
			context.Element.innerHTML = '';
			_render.append(document, true);

			context.Element.innerHTML = contextElementHTML;
			_render.append(context.Element, false);
			contextElementHTML = null;

			init = undefined;
		};

		var render = function() {
			_render.remove();
			_render.append(context.Element, false);
			_render();
		};
		
		function app (req, res) {
			var path = hash2Path(req.hash);
			var route = router(path);

			var flow = river([init, (route && route.fn), render]);

			context.Render = _render;
			context.Location = req;
			context.Element = res;
			context.Route = route;
			context.Router = router;

			flow.call(context);
		}

		http.createServer(app).listen();	

	}

	function azalea () {
		var context = this || {}, routes = [], components = {}, attribute = 'component';

		for (var i = arguments.length - 1; i >= 0; i--) {
			var arg = arguments[i];
			switch (toString(arg)) {
				case 'array': 
					routes = arg;
					break;
				case 'object':
					components = arg;
					break;
				case 'string':
					attribute = arg;
					break;
			}
			
		};

		_azalea(context, routes, components, attribute);

	}

	module.exports = azalea;

/***/ },
/* 1 */
/***/ function(module, exports) {

	// return native http module for nodejs env
	// return configured http module for browser env, support IE >= 9

	module.exports = (function() {
	    function xhttp (win, doc) {
	        var http = {
	            createServer: function createServer(listener) {
	                listener = listener || function() {};

	                var started = false;
	                
	                function start() {
	                    var location = win.location;
	                    var element = doc.querySelector('[http]') || doc.body;

	                    if (started) return console.log('xhttp has already started! thank you!');

	                    function hashChanged () {
	                        listener(location, element);
	                    }

	                    win.addEventListener('hashchange', hashChanged, false);


	                    start.stop = function() {
	                        win.removeEventListener('hashchange', hashChanged, false);
	                        started = false;
	                        // console.log('stopped')
	                    };

	                    listener(location, element);
	                    started = true;

	                }

	                function listen(callback) {
	                    callback = typeof callback === 'function' ? callback : function() {};
	                    var _cb = function() {
	                        start();
	                        callback();
	                    };

	                    var cb = function() {
	                        doc.removeEventListener("DOMContentLoaded", cb, false);
	                        // console.log('started')
	                        _cb();
	                    };
	                    doc.readyState === 'loading' ? doc.addEventListener("DOMContentLoaded", cb, false) : _cb();

	                    return _cb;
	                }

	                return {
	                    listen: listen
	                };
	            }
	        };    
	        
	        return http;
	    }

	    try {
	        return xhttp(window, document);
	    } catch (e) {
	        throw new Error('this module is for browser, please use native http module instead.');
	    }
	})();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// road.js

	var pathRegexp = __webpack_require__(3);

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function road (routes, options) {
		
		if (!Array.isArray(routes)) throw new Error('routes must be an array.');

		routesObj = {};

		for (var i = routes.length - 1; i >= 0; i--) {
			var route = routes[i];
			if (route.name && route.path) {
				var _route = routesObj[route.name] = {};
				_route.route = route;
				_route.keys = [],
				_route.regexp = pathRegexp(route.path, _route.keys, options);
			}
		};

		// fork from express.js
		// http://expressjs.com/
		// https://github.com/strongloop/express/blob/master/LICENSE

		function match (path) {
			if (path == null) {
				// no path, nothing matches
				this.params = undefined;
				this.path = undefined;
				return false;
			}

			var m = this.regexp.exec(path);

			if (!m) {
			this.params = undefined;
			this.path = undefined;
			return false;
			}

			// store values
			this.params = {};
			this.path = m[0];

			var keys = this.keys;
			var params = this.params;
			var prop;
			var n = 0;
			var key;
			var val;

			for (var i = 1, len = m.length; i < len; ++i) {
				key = keys[i - 1];
				prop = key
				  ? key.name
				  : n++;
				val = decode_param(m[i]);

				if (val !== undefined || !(hasOwnProperty.call(params, prop))) {
				  params[prop] = val;
				}
			}

			return true;		

		}

		function decode_param(val){
			if (typeof val !== 'string') {
				return val;
			}

			try {
				return decodeURIComponent(val);
			} catch (e) {
				var err = new TypeError("Failed to decode param '" + val + "'");
				err.status = 400;
				throw err;
			}
		}

		function parse (path) {
			for (var name in routesObj) {
				var _route = routesObj[name];
				if (match.call(_route, path)) {
					var route = _route.route;
					route.params = _route.params;
					return route;
				}
			}
		}

		function numberParam (path, value) {
			return path.replace('*', value);
		}

		function commasParam (path, key, value) {
			return path.replace(':' + key, value);
		}

		function stringify (name, params) {
			var route = routesObj[name];
			if (!route) return '';
			
			var path = route.route.path;

			numberValues = [];

			for (var key in params) {
				if (/\d+/.test(key.toString())) {
					numberValues.splice(+key, 0, params[key]);
				} else {
					path = commasParam(path, key, params[key]);
				}
				
			}

			for (var i = 0, len = numberValues.length - 1; i <= len; i++) {
				path = numberParam(path, numberValues[i]);
			};


			return path;
		}

		function router () {
			switch (arguments.length) {
				case 0:
					return routes;
				case 1:
					return parse.apply(null, arguments);
				case 2:
					return stringify.apply(null, arguments);
				default:
					throw new Error('not implemented for more than three arguments');
			}
		}

		return router;
	}

	module.exports = road;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(4)

	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {String} str
	 * @return {Array}
	 */
	function parse (str) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var res

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }

	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var suffix = res[6]
	    var asterisk = res[7]

	    var repeat = suffix === '+' || suffix === '*'
	    var optional = suffix === '?' || suffix === '*'
	    var delimiter = prefix || '/'
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      pattern: escapeGroup(pattern)
	    })
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {String}   str
	 * @return {Function}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
	    }
	  }

	  return function (obj) {
	    var path = ''
	    var data = obj || {}

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i]

	      if (typeof token === 'string') {
	        path += token

	        continue
	      }

	      var value = data[token.name]
	      var segment

	      if (value == null) {
	        if (token.optional) {
	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encodeURIComponent(value[j])

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment
	        }

	        continue
	      }

	      segment = encodeURIComponent(value)

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {String} str
	 * @return {String}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {String}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {RegExp} path
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        pattern: null
	      })
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {Array}  path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {String} path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path)
	  var re = tokensToRegExp(tokens, options)

	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i])
	    }
	  }

	  return attachKeys(re, keys)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {Array}  tokens
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {}

	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''
	  var lastToken = tokens[tokens.length - 1]
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]

	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = token.pattern

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }

	      if (token.optional) {
	        if (prefix) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }

	      route += capture
	    }
	  }

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
	  }

	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
	  }

	  return new RegExp('^' + route, flags(options))
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 [keys]
	 * @param  {Object}                [options]
	 * @return {RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || []

	  if (!isarray(keys)) {
	    options = keys
	    keys = []
	  } else if (!options) {
	    options = {}
	  }

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, keys, options)
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(path, keys, options)
	  }

	  return stringToRegexp(path, keys, options)
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	// view.js

	function isHTMLElement (el) {
		if (el === document) return true;
		return typeof el === 'object' ? (Object.prototype.toString.call(el).substr(8, 4) === 'HTML') : false;
	}

	function nope () {}

	var forEach = Array.prototype.forEach;
	var push = Array.prototype.push;

	function view (el, Components, attr) {
		attr = attr || 'http';
		Components = Components || {};
		var selector = '[' + attr + ']';
		var context = this;

		var elements = [];
		var staticElements = [];

		function renderComponent (el) {
			var http = el.getAttribute(attr);
			http && Components[http] ? Components[http].call(context, el, render) : console.log('Component ' + http + ' not implemented');
		}

		function _render () {
			forEach.call(staticElements, renderComponent, context);
			forEach.call(elements, renderComponent, context);
		};

		function render (fn) {
			fn = fn || nope;
			switch (fn.length) {
				case 0:
					fn.call(context);
					_render();
					break;
				default:
					fn.call(context, _render);
					break;
			}
		};

		
		render.appendStatic = function appendStatic (nodeList) {
			push.apply(staticElements, nodeList);
			return render;		
		}

		render.appendDynamic = function appendDynamic (nodeList) {
			push.apply(elements, nodeList);
			return render;
		};

		render.append = function append (element, isStatic) {
			if (!isHTMLElement(element)) throw new Error('first argument must be an html element');
			var method = isStatic ? 'appendStatic' : 'appendDynamic';
			var nodeList = element.querySelectorAll(selector);
			render[method](nodeList);
			return render;
		};

		render.remove = function remove (removeStatic) {
			elements = [];
			if (removeStatic) staticElements = [];
			return render;
		};

		render.elements = function(isStatic) {
			return isStatic ? staticElements : elements;
		};

		if (el) render.append(el);

		return render;
	}

	module.exports = view;


/***/ },
/* 6 */
/***/ function(module, exports) {

	// flow manager

	function toString (value) {
		var type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
		return type;
	}

	function exec (fn, cb) {
		switch (fn.length) {
			case 0: 
				fn.call(this);
				cb();
				break;
			case 1:
				fn.call(this, cb);
				break;
			default:
				cb();
				break;
		}		
	}

	function serially (array) {
		var fns = array.slice();

		function next (done) {
			done = done || function() {};
			var self = this;
			var fn = fns.shift();
			
			var callback = function() {
				next.call(self, done);
			};

			fn = river(fn);
			typeof fn === 'function' ? exec.call(this, fn, callback) : fns.length === 0 ? done.call(this) : callback();

		}

		return next;

	}

	function parallelly (obj) {
		
		var oked = {};

		for (var name in obj) {
			oked[name] = false;
		}

		function ok () {
			for (var k in oked) {
				if (oked[k] === false) return false;
			}

			return true;
		}

		function next (done) {
			done = done || function() {};
			var self = this;

			var callback = function(name) {
				return function() {
					oked[name] = true;
					if (ok()) done.call(self);
				};
			};

			for (var name in obj) {
				var fn = river(obj[name]);
				var cb = callback(name);
				typeof fn === 'function' ? exec.call(this, fn, cb) : cb();
			}
		}

		return next;
	}

	function river (obj) {
		var type = toString(obj);

		switch (type) {
			case 'function': 
				return obj;
			case 'array':
				return serially(obj);			
			case 'object':
				return parallelly(obj);
			default:
				return obj;
		}

	}

	module.exports = river;
	// test

	// if function, run it normally
	// if array, run them serially
	// if object, run them parallelly

	// context is always the same, an object created when flow was added

	// var ff = function(name) {
	// 	name = name || '';
	// 	function random (n) {
	// 		n = n || 1000;
	// 		return Math.round(Math.random() * n);
	// 	}

	// 	function async (done) {
	// 		var callback = function() {
	// 			console.log('async step \t', random(), '\t', context === this,  '\t', name);
	// 			done();
	// 		}.bind(this);

	// 		setTimeout(callback, random());
	// 	}

	// 	function sync () {
	// 		console.log('sync step \t', random(),  '\t', context === this, '\t', name);
	// 	};

	// 	return random() < 500 ? sync : async;
	// };

	// var flow = {
	// 	option1: {
	// 		step2: ff('option1.step2'),
	// 		step4: ff('option1.step4'),
	// 		step1: [ff('option1.step1.0'), ff('option1.step1.1')],
	// 		step3: {
	// 			step31: ff('option1.step3.step31'),
	// 			step32: [ff('option1.step3.step32.0'), ff('option1.step3.step32.1')]
	// 		}
	// 	},
	// 	option2: ff('option2'),
	// 	option3: ff('option3'),
	// 	option4: [ff('option4.0'), ff('option4.1')],
	// }

	// var fff = river(flow);

	// var context = {xxx: true};

	// fff.call(context, function() {
	// 	console.log('done', context === this);
	// })

	// var s1 = function() {
	// 	console.log('s1');
	// };

	// var s2 = function(cb) {
	// 	var callback = function() {
	// 		console.log('s2');
	// 		cb();
	// 	};
	// 	setTimeout(callback, 1000);
	// };
	// var s5 = function(cb) {
	// 	var callback = function() {
	// 		console.log('s5');
	// 		cb();
	// 	};
	// 	setTimeout(callback, 1000);
	// };
	// var s3 = function() {
	// 	console.log('s3');
	// };

	// var s4 = function(cb) {
	// 	var callback = function() {
	// 		console.log('s4');
	// 		cb();
	// 	};
	// 	setTimeout(callback, 1000);
	// };

	// var sss = [s1, s2]

	// var ss = [sss, s5, s3, null, 'undefined', undefined, s4];

	// var f = river(ss);


	// f.call({a: 1});

	// var pp = {
	// 	s1: s1,
	// 	s2: s2,
	// 	s3: s3,
	// 	s4: s4,
	// 	ss: ss
	// }

	// var p = river(pp);
	// p.call({p: true})

/***/ }
/******/ ])
});
;