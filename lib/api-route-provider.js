"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _express = _interopRequireDefault(require("express"));
var _glob = _interopRequireDefault(require("glob"));
var _child_process = _interopRequireDefault(require("child_process"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var execSync = _child_process["default"].execSync;
function _default(app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // HAR support
  var har = null;
  // to keep track of the sequence of requests
  var harState = {};
  app.use(function (req, res, next) {
    var _har, _har2;
    var harRoutes = ((_har = har) === null || _har === void 0 ? void 0 : _har.requests) || [];
    var incomingPath = (_har2 = har) !== null && _har2 !== void 0 && _har2.matchQuery ? req.originalUrl : req.path;
    var matchingRequests = harRoutes.filter(function (r) {
      var _har3;
      var compareUrl = r.path;
      if ((_har3 = har) !== null && _har3 !== void 0 && _har3.matchQuery) {
        var url = new URL(r.request.url);
        compareUrl = "".concat(url.pathname).concat(url.search);
      }
      return compareUrl === incomingPath && r.method === req.method;
    });
    harState[incomingPath] = harState[incomingPath] || 0;
    var requestIndex = harState[incomingPath];
    var matchingRequest = matchingRequests[requestIndex];
    if (matchingRequest) {
      // increase the sequence to be ready for the next request
      ++harState[incomingPath];
      res.set('X-Headlamp-HAR-response-sequence', requestIndex + 1);
      res.set('X-Headlamp-HAR-matching-responses', matchingRequests.length);
      return res.status(matchingRequest.response.status).json(matchingRequest.json);
    }
    next();
  });
  var responseStore = createActivationStore();
  var customResponseStore = createCustomResponseStore();
  function getAllRouteResponses(routeId) {
    var fileRoute = getFileRoutes(options).find(function (r) {
      return r.id === routeId;
    });
    var fileResponses = getRouteResponses(options, fileRoute);
    var customResponses = customResponseStore.getResponses(routeId);
    return fileResponses.concat(customResponses);
  }

  // create routes from files
  getFileRoutes(options).forEach(function (route) {
    // create express route
    var appRoute = app.route(route.path);
    // add methods to route
    route.methods.forEach(function (method) {
      appRoute[method](function (req, res) {
        var responses = getAllRouteResponses(route.id);
        var respId = responseStore.getActivatedResponseId(route.id);
        if (route.filename) {
          res.set('X-Headlamp-Route-File', route.filename);
        }
        res.set('X-Headlamp-Route-Link', "http://".concat(req.headers.host, "/_docs/request/").concat(route.id));
        if (respId !== undefined) {
          var resp = responses[respId];
          var response = callIfFunc(resp);
          if (response) {
            return res.status(response.status || 200).json(response.response);
          }
        }
        if (typeof route.response === 'function') {
          return route.response(req, res);
        } else if (_typeof(route.response) === 'object') {
          return res.json(route.response);
        }
        var firstResponse = callIfFunc(responses[0] || {});
        return res.status(firstResponse.status || 500).json(firstResponse.response || 'No response defined.');
      });
    });
  });

  // after creating file routes
  warnDuplicateRoutes(app);
  app.get('/_api', function (req, res) {
    var fileRoutes = getFileRoutes(options);
    var routes = getAPIRoutes(app).map(function (r) {
      // attempt to find route file for route
      var routeFile = fileRoutes.find(function (route) {
        var methods = Object.keys(r.methods).filter(function (method) {
          return r.methods[method];
        });
        var methodMatch = methods.filter(function (n) {
          return route.methods.indexOf(n) !== -1;
        }).length;
        return methodMatch && route.path === r.path;
      }) || {};
      var id = getRouteId(r);
      return {
        id: id,
        path: r.path,
        methods: r.methods,
        title: routeFile.title,
        description: routeFile.description,
        query: routeFile.query,
        params: routeFile.params,
        filename: routeFile.filename,
        payload: routeFile.payload,
        routeFile: Object.keys(routeFile).length > 0,
        headers: getRouteHeaders(options, routeFile)
      };
    });
    return res.json({
      routes: routes,
      title: options.title,
      description: options.description,
      hidePath: options.hidePath,
      src: options.src,
      har: har
    });
  });
  app.get('/_grep', function (req, res) {
    var q = req.query.q;
    if (!q) {
      return res.status(400).json({
        error: 'No search query param.'
      });
    }
    // coalesce array of src dirs
    var srcDirs = dirsToArray(options.src);
    if (srcDirs.length === 0) {
      return res.json({
        q: q,
        files: []
      });
    }
    // determine how many lines of code to show
    var showLines = Number(req.query.lines);
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10;
    }
    var halfLines = Math.ceil(showLines / 2) - 1;
    if (q.includes('"') && q.includes('\'')) {
      // limitation of grep
      return res.status(400).json({
        error: 'Searches cannot include both single and double quotes.'
      });
    }
    var escChar = q.includes('\'') ? '"' : '\'';
    var files = {};
    srcDirs.forEach(function (dir) {
      var searchResult = '';
      try {
        searchResult = execSync("grep -rnF --include=\\*.js --include=\\*.json ".concat(escChar).concat(q).concat(escChar, " ").concat(dir));
      } catch (e) {
        searchResult = '';
      }
      // convert to array, filter blanks
      searchResult.toString().split('\n').filter(function (l) {
        return !!l;
      }).forEach(function (result) {
        var _parseFileAndLineNo = parseFileAndLineNo(result),
          file = _parseFileAndLineNo.file,
          lineNo = _parseFileAndLineNo.lineNo;
        if (!files[file]) {
          files[file] = {
            file: file,
            lineNos: []
          };
        }
        var existingLines = files[file].lineNos;
        if (existingLines.findIndex(function (no) {
          return no === lineNo;
        }) === -1) {
          existingLines.push(lineNo);
        }
      });
    });
    var serverDirs = dirsToArray(options.server);
    // convert to array of objects
    var matchedFiles = Object.keys(files).sort().map(function (key) {
      return files[key];
    }).filter(function (ref) {
      // filter out any server files
      return !serverDirs.some(function (dir) {
        return ref.file.includes(dir);
      });
    }).map(function (ref) {
      var content = _fs["default"].readFileSync(ref.file).toString();
      var lines = content.split('\n');
      var startLineNo = 1;
      // if only single line, show code window rather than entire file
      if (ref.lineNos.length === 1) {
        var lineNo = ref.lineNos[0];
        var startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines; // start halfLines lines back
        startLineNo = startLine;
        var linesCopy = _toConsumableArray(lines);
        lines = linesCopy.splice(startLine - 1, showLines);
      }
      return _objectSpread(_objectSpread({}, ref), {}, {
        startLineNo: startLineNo,
        lines: lines
      });
    });
    res.json({
      q: q,
      files: matchedFiles
    });
  });
  app.get('/_path', function (req, res) {
    var path = req.query.path;
    if (!path) {
      return res.status(400).json({
        error: 'No path query param.'
      });
    }
    // determine how many lines of code to show
    var showLines = Number(req.query.lines);
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10;
    }
    var halfLines = Math.ceil(showLines / 2) - 1;
    var serverDirs = dirsToArray(options.server);
    var files = findPathInSrc(options, path).filter(function (test) {
      // filter out any server files
      return !serverDirs.some(function (dir) {
        return test.file.includes(dir);
      });
    });
    var pattern = createSrcPathRegExp(path);
    var isExact = !path.includes(':');
    var srcFiles = [];
    files.forEach(function (test) {
      var file = test.file,
        lineNo = test.lineNo;
      var content = _fs["default"].readFileSync(file).toString();
      var lines = content.split('\n');
      var line = lines[lineNo - 1] || '';
      var matches = false;
      if (isExact) {
        matches = line.includes(path) && !line.includes("".concat(path, "/"));
      } else {
        var result = pattern.exec(line);
        matches = result && result.length > 0;
      }
      if (matches) {
        var startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines; // start halfLines lines back
        var linesCopy = _toConsumableArray(lines);
        srcFiles.push({
          file: file,
          startLineNo: startLine,
          lineNo: lineNo,
          lines: linesCopy.splice(startLine - 1, showLines)
        });
      }
    });
    return res.json({
      path: path,
      src: srcFiles,
      server: findPathInServer(options, path)
    });
  });
  app.get('/_route/:routeId/responses', function (req, res) {
    var routeId = req.params.routeId;
    var fileRoute = getFileRoutes(options).find(function (r) {
      return r.id === routeId;
    }) || {};
    var responses = getAllRouteResponses(routeId);
    var responseId = responseStore.getActivatedResponseId(fileRoute.id);
    return res.json({
      respId: responseId || (fileRoute.response ? null : 0),
      responses: responses
    });
  });
  app.get('/_route/:routeId/responses/:respId/activate', function (req, res) {
    var _req$params = req.params,
      routeId = _req$params.routeId,
      respId = _req$params.respId;
    var fileRoute = getFileRoutes(options).find(function (r) {
      return r.id === routeId;
    });
    var responses = getAllRouteResponses(routeId);
    if (fileRoute && responses[respId]) {
      responseStore.setActiveResponse(routeId, respId);
    }
    return res.json({
      route: fileRoute,
      respId: respId
    });
  });
  app.get('/_route/:routeId/responses/deactivate', function (req, res) {
    var routeId = req.params.routeId;
    var fileRoute = getFileRoutes(options).find(function (r) {
      return r.id === routeId;
    });
    responseStore.setActiveResponse(routeId, null);
    return res.json({
      route: fileRoute,
      respId: undefined
    });
  });
  app.put('/_route/:routeId/responses', function (req, res) {
    var routeId = req.params.routeId;
    var _customResponseStore$ = customResponseStore.save(routeId, req.body.response),
      id = _customResponseStore$.id;
    var responses = getAllRouteResponses(routeId);
    var index = responses.findIndex(function (r) {
      return r.id === id;
    });
    responseStore.setActiveResponse(routeId, "".concat(index > -1 ? index : ''));
    return res.json({
      message: 'Saved'
    });
  });
  app["delete"]('/_route/:routeId/responses/:id', function (req, res) {
    var routeId = req.params.routeId;
    var responses = getAllRouteResponses(routeId);
    var activeIndex = responseStore.getActivatedResponseId(routeId);
    var deleteIndex = responses.findIndex(function (r) {
      return r.id === req.params.id;
    });
    if (Number(activeIndex) === Number(deleteIndex)) {
      responseStore.setActiveResponse(routeId, null);
    }
    customResponseStore["delete"](routeId, req.params.id);
    return res.json({
      message: 'Deleted'
    });
  });
  app.post('/_har', function (req, res) {
    har = req.body.har;
    harState = {};
    return res.json({
      message: 'Success'
    });
  });
  app.get('/_har', function (req, res) {
    return res.json({
      har: har
    });
  });
  app["delete"]('/_har', function (req, res) {
    har = null;
    harState = {};
    return res.json({
      message: 'Success'
    });
  });

  // serve the api explorer
  app.use('/_docs', _express["default"]["static"](_path["default"].resolve(__dirname, '..', 'api-explorer-dist')));

  // fallback to serve the api explorer so /_docs/request/* will work
  app.use('/_docs/*', _express["default"]["static"](_path["default"].resolve(__dirname, '..', 'api-explorer-dist')));
}
function warnDuplicateRoutes(app) {
  var routes = getAPIRoutes(app);
  var checker = {};
  routes.forEach(function (route) {
    Object.keys(route.methods).forEach(function (method) {
      if (route.methods[method]) {
        var id = "".concat(method, " ").concat(route.path);
        if (typeof checker[id] === 'undefined') {
          checker[id] = 0;
        }
        ++checker[id];
      }
    });
  });
  Object.keys(checker).forEach(function (id) {
    if (checker[id] > 1) {
      console.warn("Duplicate route found: ".concat(id)); // eslint-disable-line
    }
  });
}

// holds routeId/responseId pairs
function createActivationStore() {
  var store = {};
  return {
    getActivatedResponseId: function getActivatedResponseId(routeId) {
      return store[routeId];
    },
    setActiveResponse: function setActiveResponse(routeId, responseId) {
      if (responseId === null || responseId === undefined) {
        delete store[routeId];
      } else {
        store[routeId] = responseId;
      }
    }
  };
}
function createCustomResponseStore() {
  var store = {}; //
  return {
    getResponses: function getResponses(routeId) {
      return Array.isArray(store[routeId]) ? store[routeId] : [];
    },
    save: function save(routeId, response) {
      response = _objectSpread(_objectSpread({}, response), {}, {
        id: response.id || Buffer.from(String(new Date().getTime())).toString('base64')
      });
      var routeResponses = this.getResponses(routeId);
      var index = routeResponses.findIndex(function (r) {
        return r.id === response.id;
      });
      var newResponses = _toConsumableArray(routeResponses);
      if (index > -1) {
        newResponses[index] = response;
      } else {
        newResponses.push(response);
      }
      store[routeId] = newResponses;
      return response;
    },
    "delete": function _delete(routeId, id) {
      store[routeId] = this.getResponses(routeId).filter(function (r) {
        return r.id !== id;
      });
    }
  };
}
function getRouteResponses(options) {
  var route = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var routeResponses = Array.isArray(route.responses) ? route.responses : [];
  var globalResponses = Array.isArray(options.responses) ? options.responses : [];
  return routeResponses.concat(route.globalResponses === false || !route.filename ? [] : globalResponses).filter(function (r) {
    return !!r;
  }).map(function (r) {
    return callIfFunc(r);
  });
}
function getRouteHeaders(options, route) {
  var routeHeaders = _typeof(route.headers) === 'object' ? route.headers : {};
  var globalHeaders = _typeof(options.headers) === 'object' ? options.headers : {};
  if (globalHeaders === false) {
    return routeHeaders;
  }
  return Object.assign({}, globalHeaders, routeHeaders);
}
function callIfFunc(subject) {
  return typeof subject === 'function' ? subject() : subject;
}
function getFileRoutes(options) {
  var src = options.src,
    srcDir = options.srcDir;
  var routes = [];
  var filesToRoutes = function filesToRoutes(files) {
    return files.filter(function (file) {
      // ignore fixtures
      return _path["default"].basename(file).substr(0, 1) !== '_';
    }).map(function (file) {
      var required = require(file);
      var route = required["default"] || required;
      route.filename = file;
      var methods = route.method ? [route.method] : route.methods;
      route.methods = methods.map(function (method) {
        return method.toLowerCase();
      });
      route.id = getRouteId(route);
      route.responses = Array.isArray(route.responses) ? route.responses : [];
      return route;
    });
  };
  if (options.routes) {
    routes = routes.concat(filesToRoutes(_glob["default"].sync("".concat(options.routes, "/**/*.+(js|json)"))));
  }
  if (src && srcDir) {
    routes = routes.concat(filesToRoutes(_glob["default"].sync("".concat(src, "/**/").concat(srcDir, "/**/*.+(js|json)"))));
  }
  return routes;
}
function getRouteId(route) {
  var methods = Array.isArray(route.methods) ? route.methods : Object.keys(route.methods);
  return Buffer.from("".concat(methods.join('-'), "-").concat(route.path)).toString('base64');
}
function getAPIRoutes(app) {
  var routes = [];
  app._router.stack.forEach(function (middleware) {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push(middleware.route);
    } else if (middleware.name === 'router') {
      // router middleware
      middleware.handle.stack.forEach(function (handler) {
        if (handler.route) routes.push(handler.route);
      });
    }
  });
  return routes
  // ignore paths that start with /_ and the catchall
  .filter(function (r) {
    return r.path.substr(0, 2) !== '/_' && r.path !== '*';
  }).map(function (r) {
    r.id = getRouteId(r);
    return r;
  });
}
function parseFileAndLineNo(str) {
  // windows filenames usually start with C:\Users
  var colonInFilename = str.substr(0, 2).includes(':');
  var firstColon = nthIndex(str, ':', colonInFilename ? 2 : 1);
  var secondColon = nthIndex(str, ':', colonInFilename ? 3 : 2);
  var file = str.substr(0, firstColon);
  var lineNo = Number(str.substr(firstColon + 1, secondColon - (firstColon + 1)));
  return {
    file: file,
    lineNo: lineNo
  };
}
function dirsToArray(dirs) {
  return (Array.isArray(dirs) ? dirs : [dirs]).filter(function (d) {
    return !!d;
  });
}

/**
 * Uses grep to find js/json files/lines with all non variable path parts in line
 *
 * @param options
 * @param path
 * @returns Array
 */
function findPathInSrc(options, path) {
  // coalesce array of src dirs
  var srcDirs = dirsToArray(options.src);
  if (srcDirs.length === 0) {
    return [];
  }
  // get non variable path parts
  var parts = path.split('/').filter(function (p) {
    return !!p && !p.includes(':');
  });
  // no parts to search
  if (parts.length === 0) {
    return [];
  }
  var files = {};
  srcDirs.forEach(function (dir) {
    // build grep search
    var _parts = _toArray(parts),
      first = _parts[0],
      rest = _parts.slice(1);
    var partsPattern = ["grep -rn --include=\\*.js --include=\\*.json '".concat(first, "' ").concat(dir)];
    rest.forEach(function (p) {
      return partsPattern.push("grep '".concat(p, "'"));
    });
    var search = partsPattern.join(' | ');
    // execute, convert to array, filter blanks
    var searchResult = '';
    try {
      searchResult = execSync(search).toString();
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var _parseFileAndLineNo2 = parseFileAndLineNo(result),
        file = _parseFileAndLineNo2.file,
        lineNo = _parseFileAndLineNo2.lineNo;
      files["".concat(file, ":").concat(lineNo)] = {
        file: file,
        lineNo: lineNo
      };
    });
  });
  // convert to array of objects
  return Object.keys(files).sort().map(function (key) {
    return files[key];
  });
}
function findPathInServer(options, path) {
  // coalesce array of server dirs
  var dirs = dirsToArray(options.server);
  if (dirs.length === 0) {
    return [];
  }
  var files = {};
  dirs.forEach(function (dir) {
    var searchResult = '';
    try {
      searchResult = execSync("grep -rn --include=\\*.js --include=\\*.json '".concat(path, "' ").concat(dir)).toString();
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var _parseFileAndLineNo3 = parseFileAndLineNo(result),
        file = _parseFileAndLineNo3.file,
        lineNo = _parseFileAndLineNo3.lineNo;
      if (!files[file]) {
        files[file] = {
          file: file,
          lines: []
        };
      }
      var existingLines = files[file].lines;
      if (existingLines.findIndex(function (no) {
        return no === lineNo;
      }) === -1) {
        existingLines.push(lineNo);
      }
    });
  });
  // convert to array of objects
  return Object.keys(files).sort().map(function (key) {
    return files[key];
  });
}
function createSrcPathRegExp(path) {
  var parts = path.split('/');
  var pattern = parts.map(function (p, i) {
    if (p.includes(':')) return '[\\s\\S]*';
    if (i + 1 === parts.length) return "".concat(p, "*");
    return p;
  }).join('\\/');
  pattern = "(".concat(pattern, ")\\w+");
  return new RegExp(pattern);
}
function nthIndex(str, pat, n) {
  var L = str.length;
  var i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}