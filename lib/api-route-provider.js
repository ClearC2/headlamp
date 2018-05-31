'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var enterModule = require('react-hot-loader').enterModule;

  enterModule && enterModule(module);
})();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var execSync = _child_process2.default.execSync;

var _default = function _default(app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var fileRoutes = [];
  if (options.routes) {
    // find all route files
    _glob2.default.sync(options.routes + '/**/*.+(js|json)').forEach(function (file) {
      // ignore files that start with _ as a means to allow for fixture files
      if (_path2.default.basename(file).substr(0, 1) === '_') return;
      var filename = file;
      var required = require(filename);
      var route = required.default || required;
      route.filename = filename;
      var methods = route.method ? [route.method] : route.methods;
      route.methods = methods.map(function (method) {
        return method.toLowerCase();
      });
      route.lastModified = getLastModified(filename);
      fileRoutes.push(route);
      // create express route
      var appRoute = app.route(route.path);
      // add methods to route
      route.methods.forEach(function (method) {
        if (typeof route.response === 'function') {
          appRoute[method](route.response);
        } else {
          appRoute[method](function (req, res) {
            return res.json(route.response);
          });
        }
      });
    });
  }

  app.get('/_api', function (req, res) {
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

    var cleaned = routes.map(function (r) {
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
      var methods = Object.keys(r.methods).join('-');
      var id = Buffer.from(methods + '-' + r.path).toString('base64');
      return {
        id: id,
        path: r.path,
        methods: r.methods,
        title: routeFile.title,
        description: routeFile.description,
        query: routeFile.query,
        params: routeFile.params,
        filename: routeFile.filename,
        lastModified: routeFile.lastModified,
        payload: routeFile.payload
      };
    }).filter(function (r) {
      return !['/_api', '/_docs', '/_path', '/_grep', '*'].includes(r.path);
    });

    return res.json({
      routes: cleaned,
      title: options.title,
      description: options.description,
      hidePath: options.hidePath,
      src: options.src
    });
  });

  app.get('/_grep', function (req, res) {
    var q = req.query.q;

    if (!q) {
      return res.status(400).json({ error: 'No search query param.' });
    }
    // determine how many lines of code to show
    var showLines = Number(req.query.lines);
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10;
    }
    var halfLines = Math.ceil(showLines / 2) - 1;
    if (q.includes('"') && q.includes("'")) {
      // limitation of grep
      return res.status(400).json({ error: 'Searches cannot include both single and double quotes.' });
    }
    var escChar = q.includes("'") ? '"' : "'";

    // coalesce array of src dirs
    var srcDirs = dirsToArray(options.src);
    if (srcDirs.length === 0) {
      return [];
    }
    var files = {};
    srcDirs.forEach(function (dir) {
      var searchResult = '';
      try {
        searchResult = String(execSync('grep -rnF --include=\\*.js --include=\\*.json ' + escChar + q + escChar + ' ' + dir));
      } catch (e) {
        searchResult = '';
      }
      // convert to array, filter blanks
      searchResult.split('\n').filter(function (l) {
        return !!l;
      }).forEach(function (result) {
        var firstColon = nthIndex(result, ':', 1);
        var secondColon = nthIndex(result, ':', 2);
        var file = result.substr(0, firstColon);
        var lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)));
        if (!files[file]) {
          files[file] = { file: file, lineNos: [] };
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
      var content = _fs2.default.readFileSync(ref.file).toString();
      var lines = content.split('\n');
      var startLineNo = 1;
      // if only single line, show code window rather than entire file
      if (ref.lineNos.length === 1) {
        var lineNo = ref.lineNos[0];
        var startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines; // start halfLines lines back
        startLineNo = startLine;
        var linesCopy = [].concat(_toConsumableArray(lines));
        lines = linesCopy.splice(startLine - 1, showLines);
      }
      return _extends({}, ref, {
        startLineNo: startLineNo,
        lines: lines,
        lastModified: getLastModified(ref.file)
      });
    });

    res.json({ q: q, files: matchedFiles });
  });
  app.get('/_path', function (req, res) {
    var path = req.query.path;

    if (!path) {
      return res.status(400).json({ error: 'No path query param.' });
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
    var srcFiles = [];
    files.forEach(function (test) {
      var file = test.file,
          lineNo = test.lineNo;

      var content = String(_fs2.default.readFileSync(file));
      var lines = content.split('\n');
      var line = lines[lineNo - 1] || '';
      var result = pattern.exec(line);
      if (result && result.length > 0) {
        var startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines; // start halfLines lines back
        var linesCopy = [].concat(_toConsumableArray(lines));
        srcFiles.push({
          file: file,
          lastModified: getLastModified(file),
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

  // serve the api explorer
  app.use('/_docs', _express2.default.static(_path2.default.resolve(__dirname, '..', 'api-explorer-dist')));

  // fallback to serve the api explorer so /_docs/request/* will work
  app.get('*', function (req, res) {
    res.sendFile(_path2.default.resolve(__dirname, '..', 'api-explorer-dist', 'index.html'));
  });
};

exports.default = _default;


function getLastModified(file) {
  try {
    var dir = _path2.default.dirname(file);
    return String(execSync('cd ' + dir + ' && git log -1 --date=iso --format=%cD ' + file)).trim();
  } catch (e) {
    return _fs2.default.statSync(file).mtime;
  }
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

    var partsPattern = ['grep -rn --include=\\*.js --include=\\*.json \'' + first + '\' ' + dir];
    rest.forEach(function (p) {
      return partsPattern.push('grep \'' + p + '\'');
    });
    var search = partsPattern.join(' | ');
    // execute, convert to array, filter blanks
    var searchResult = '';
    try {
      searchResult = String(execSync(search));
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var firstColon = nthIndex(result, ':', 1);
      var secondColon = nthIndex(result, ':', 2);
      var file = result.substr(0, firstColon);
      var lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)));
      files[file + ':' + lineNo] = { file: file, lineNo: lineNo };
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
      searchResult = String(execSync('grep -rn --include=\\*.js --include=\\*.json \'' + path + '\' ' + dir));
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var firstColon = nthIndex(result, ':', 1);
      var secondColon = nthIndex(result, ':', 2);
      var file = result.substr(0, firstColon);
      var lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)));
      if (!files[file]) {
        files[file] = { file: file, lines: [], lastModified: getLastModified(file) };
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
    if (i + 1 === parts.length) return p + '*';
    return p;
  }).join('\\/');
  pattern = '(' + pattern + ')\\w+';
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
;

(function () {
  var reactHotLoader = require('react-hot-loader').default;

  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(execSync, 'execSync', 'src/api-route-provider.js');
  reactHotLoader.register(getLastModified, 'getLastModified', 'src/api-route-provider.js');
  reactHotLoader.register(dirsToArray, 'dirsToArray', 'src/api-route-provider.js');
  reactHotLoader.register(findPathInSrc, 'findPathInSrc', 'src/api-route-provider.js');
  reactHotLoader.register(findPathInServer, 'findPathInServer', 'src/api-route-provider.js');
  reactHotLoader.register(createSrcPathRegExp, 'createSrcPathRegExp', 'src/api-route-provider.js');
  reactHotLoader.register(nthIndex, 'nthIndex', 'src/api-route-provider.js');
  reactHotLoader.register(_default, 'default', 'src/api-route-provider.js');
  leaveModule(module);
})();

;