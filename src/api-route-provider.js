import fs from 'fs'
import path from 'path'
import express from 'express'
import glob from 'glob'
import childProcess from 'child_process'
const {execSync} = childProcess

export default function (app, options = {}) {
  const responseStore = createActivationStore()

  // create routes from files
  getFileRoutes(options.routes).forEach(route => {
    // create express route
    const appRoute = app.route(route.path)
    // add methods to route
    route.methods.forEach(method => {
      appRoute[method]((req, res) => {
        const responses = getRouteResponses(options, route)
        const respId = responseStore.getActivatedResponseId(route.id)
        if (respId !== undefined) {
          let resp = responses[respId]
          const response = callIfFunc(resp)
          if (response) {
            return res
              .status(response.status || 200)
              .json(response.response)
          }
        }
        if (typeof route.response === 'function') {
          return route.response(req, res)
        } else if (typeof route.response === 'object') {
          return res.json(route.response)
        }
        const firstResponse = callIfFunc(responses[0] || {})
        if (route.filename) {
          res.set('X-Headlamp-Route-File', route.filename)
        }
        return res
          .status(firstResponse.status || 500)
          .json(firstResponse.response || 'No response defined.')
      })
    })
  })

  // after creating file routes
  warnDuplicateRoutes(app)

  app.get('/_api', (req, res) => {
    const fileRoutes = getFileRoutes(options.routes)
    const routes = getAPIRoutes(app)
      .map(r => {
        // attempt to find route file for route
        const routeFile = fileRoutes.find(route => {
          const methods = Object.keys(r.methods).filter(method => r.methods[method])
          const methodMatch = methods.filter(n => {
            return route.methods.indexOf(n) !== -1
          }).length
          return methodMatch && route.path === r.path
        }) || {}
        const id = getRouteId(r)
        return {
          id,
          path: r.path,
          methods: r.methods,
          title: routeFile.title,
          description: routeFile.description,
          query: routeFile.query,
          params: routeFile.params,
          filename: routeFile.filename,
          lastModified: routeFile.lastModified,
          payload: routeFile.payload,
          routeFile: Object.keys(routeFile).length > 0,
          headers: getRouteHeaders(options, routeFile)
        }
      })

    return res.json({
      routes,
      title: options.title,
      description: options.description,
      hidePath: options.hidePath,
      src: options.src
    })
  })

  app.get('/_grep', (req, res) => {
    const {q} = req.query
    if (!q) {
      return res.status(400).json({error: 'No search query param.'})
    }
    // coalesce array of src dirs
    const srcDirs = dirsToArray(options.src)
    if (srcDirs.length === 0) {
      return res.json({q, files: []})
    }
    // determine how many lines of code to show
    let showLines = Number(req.query.lines)
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10
    }
    const halfLines = Math.ceil(showLines / 2) - 1
    if (q.includes('"') && q.includes("'")) {
      // limitation of grep
      return res
        .status(400)
        .json({error: 'Searches cannot include both single and double quotes.'})
    }
    const escChar = q.includes("'") ? '"' : "'"
    const files = {}
    srcDirs.forEach(dir => {
      let searchResult = ''
      try {
        searchResult = execSync(`grep -rnF --include=\\*.js --include=\\*.json ${escChar}${q}${escChar} ${dir}`)
      } catch (e) {
        searchResult = ''
      }
      // convert to array, filter blanks
      searchResult.toString().split('\n').filter(l => !!l).forEach(result => {
        const {file, lineNo} = parseFileAndLineNo(result)
        if (!files[file]) {
          files[file] = {file, lineNos: []}
        }
        const existingLines = files[file].lineNos
        if (existingLines.findIndex(no => no === lineNo) === -1) {
          existingLines.push(lineNo)
        }
      })
    })
    const serverDirs = dirsToArray(options.server)
    // convert to array of objects
    const matchedFiles = Object.keys(files)
      .sort()
      .map(key => files[key])
      .filter(ref => {
        // filter out any server files
        return !serverDirs.some(dir => ref.file.includes(dir))
      })
      .map(ref => {
        const content = fs.readFileSync(ref.file).toString()
        let lines = content.split('\n')
        let startLineNo = 1
        // if only single line, show code window rather than entire file
        if (ref.lineNos.length === 1) {
          const lineNo = ref.lineNos[0]
          const startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines // start halfLines lines back
          startLineNo = startLine
          const linesCopy = [...lines]
          lines = linesCopy.splice(startLine - 1, showLines)
        }
        return {
          ...ref,
          startLineNo,
          lines,
          lastModified: getLastModified(ref.file)
        }
      })

    res.json({q, files: matchedFiles})
  })

  app.get('/_path', (req, res) => {
    const {path} = req.query
    if (!path) {
      return res.status(400).json({error: 'No path query param.'})
    }
    // determine how many lines of code to show
    let showLines = Number(req.query.lines)
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10
    }
    const halfLines = Math.ceil(showLines / 2) - 1
    const serverDirs = dirsToArray(options.server)
    const files = findPathInSrc(options, path).filter(test => {
      // filter out any server files
      return !serverDirs.some(dir => test.file.includes(dir))
    })
    const pattern = createSrcPathRegExp(path)
    const isExact = !path.includes(':')
    let srcFiles = []
    files.forEach(test => {
      const {file, lineNo} = test
      const content = fs.readFileSync(file).toString()
      const lines = content.split('\n')
      const line = lines[lineNo - 1] || ''
      let matches = false
      if (isExact) {
        matches = line.includes(path) && !line.includes(`${path}/`)
      } else {
        const result = pattern.exec(line)
        matches = result && result.length > 0
      }
      if (matches) {
        const startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines // start halfLines lines back
        const linesCopy = [...lines]
        srcFiles.push({
          file,
          lastModified: getLastModified(file),
          startLineNo: startLine,
          lineNo,
          lines: linesCopy.splice(startLine - 1, showLines)
        })
      }
    })

    return res.json({
      path,
      src: srcFiles,
      server: findPathInServer(options, path)
    })
  })

  app.get('/_route/:routeId/responses', (req, res) => {
    const routeId = req.params.routeId
    const fileRoute = getFileRoutes(options.routes).find(r => r.id === routeId) || {}
    const responses = getRouteResponses(options, fileRoute)
    const responseId = responseStore.getActivatedResponseId(fileRoute.id)
    return res.json({
      respId: responseId || fileRoute.response ? null : 0,
      responses
    })
  })

  app.get('/_route/:routeId/responses/:respId/activate', (req, res) => {
    const {routeId, respId} = req.params
    const fileRoute = getFileRoutes(options.routes).find(r => r.id === routeId)
    const responses = getRouteResponses(options, fileRoute)
    if (fileRoute && responses[respId]) {
      responseStore.setActiveResponse(routeId, respId)
    }
    return res.json({
      route: fileRoute,
      respId
    })
  })

  app.get('/_route/:routeId/responses/deactivate', (req, res) => {
    const {routeId} = req.params
    const fileRoute = getFileRoutes(options.routes).find(r => r.id === routeId)
    responseStore.setActiveResponse(routeId, null)
    return res.json({
      route: fileRoute,
      respId: undefined
    })
  })

  // serve the api explorer
  app.use('/_docs', express.static(path.resolve(__dirname, '..', 'api-explorer-dist')))

  // fallback to serve the api explorer so /_docs/request/* will work
  app.use('/_docs/*', express.static(path.resolve(__dirname, '..', 'api-explorer-dist')))
}

function warnDuplicateRoutes (app) {
  const routes = getAPIRoutes(app)
  const checker = {}
  routes.forEach(route => {
    Object.keys(route.methods).forEach(method => {
      if (route.methods[method]) {
        const id = `${method} ${route.path}`
        if (typeof checker[id] === 'undefined') {
          checker[id] = 0
        }
        ++checker[id]
      }
    })
  })

  Object.keys(checker).forEach(id => {
    if (checker[id] > 1) {
      console.warn(`Duplicate route found: ${id}`) // eslint-disable-line
    }
  })
}

// holds routeId/responseId pairs
function createActivationStore () {
  const store = {}
  return {
    getActivatedResponseId (routeId) {
      return store[routeId]
    },
    setActiveResponse (routeId, responseId) {
      if (responseId === null || responseId === undefined) {
        delete store[routeId]
      } else {
        store[routeId] = responseId
      }
    }
  }
}

function getRouteResponses (options, route) {
  const routeResponses = Array.isArray(route.responses) ? route.responses : []
  const globalResponses = Array.isArray(options.responses) ? options.responses : []
  return routeResponses
    .concat(route.globalResponses === false || !route.filename ? [] : globalResponses)
    .filter(r => !!r)
    .map(r => callIfFunc(r))
}

function getRouteHeaders (options, route) {
  const routeHeaders = typeof route.headers === 'object' ? route.headers : {}
  const globalHeaders = typeof options.headers === 'object' ? options.headers : {}
  if (globalHeaders === false) {
    return routeHeaders
  }
  return Object.assign({}, globalHeaders, routeHeaders)
}

function callIfFunc (subject) {
  return typeof subject === 'function' ? subject() : subject
}

function getFileRoutes (dir) {
  if (!dir) return []
  return glob.sync(`${dir}/**/*.+(js|json)`)
    .filter(file => {
      // ignore fixtures
      return path.basename(file).substr(0, 1) !== '_'
    })
    .map(file => {
      const required = require(file)
      const route = required.default || required
      route.filename = file
      const methods = route.method ? [route.method] : route.methods
      route.methods = methods.map(method => method.toLowerCase())
      route.lastModified = getLastModified(file)
      route.id = getRouteId(route)
      route.responses = Array.isArray(route.responses) ? route.responses : []
      return route
    })
}

function getRouteId (route) {
  const methods = Array.isArray(route.methods) ? route.methods : Object.keys(route.methods)
  return Buffer.from(`${methods.join('-')}-${route.path}`).toString('base64')
}

function getAPIRoutes (app) {
  const routes = []
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      routes.push(middleware.route)
    } else if (middleware.name === 'router') {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) routes.push(handler.route)
      })
    }
  })

  return routes
    // ignore paths that start with /_ and the catchall
    .filter(r => r.path.substr(0, 2) !== '/_' && r.path !== '*')
    .map(r => {
      r.id = getRouteId(r)
      return r
    })
}

function parseFileAndLineNo (str) {
  // windows filenames usually start with C:\Users
  const colonInFilename = str.substr(0, 2).includes(':')
  const firstColon = nthIndex(str, ':', colonInFilename ? 2 : 1)
  const secondColon = nthIndex(str, ':', colonInFilename ? 3 : 2)
  const file = str.substr(0, firstColon)
  const lineNo = Number(str.substr(firstColon + 1, secondColon - (firstColon + 1)))
  return {file, lineNo}
}

function getLastModified (file) {
  try {
    const dir = path.dirname(file)
    return execSync(`cd ${dir} && git log -1 --date=iso --format=%cD ${file}`).toString().trim()
  } catch (e) {
    return fs.statSync(file).mtime
  }
}

function dirsToArray (dirs) {
  return (Array.isArray(dirs) ? dirs : [dirs]).filter(d => !!d)
}

/**
 * Uses grep to find js/json files/lines with all non variable path parts in line
 *
 * @param options
 * @param path
 * @returns Array
 */
function findPathInSrc (options, path) {
  // coalesce array of src dirs
  const srcDirs = dirsToArray(options.src)
  if (srcDirs.length === 0) {
    return []
  }
  // get non variable path parts
  const parts = path
    .split('/')
    .filter(p => {
      return !!p && !p.includes(':')
    })
  // no parts to search
  if (parts.length === 0) {
    return []
  }
  const files = {}
  srcDirs.forEach(dir => {
    // build grep search
    const [first, ...rest] = parts
    const partsPattern = [`grep -rn --include=\\*.js --include=\\*.json '${first}' ${dir}`]
    rest.forEach(p => partsPattern.push(`grep '${p}'`))
    const search = partsPattern.join(' | ')
    // execute, convert to array, filter blanks
    let searchResult = ''
    try {
      searchResult = execSync(search).toString()
    } catch (e) {
      searchResult = ''
    }
    searchResult.split('\n').filter(l => !!l).forEach(result => {
      const {file, lineNo} = parseFileAndLineNo(result)
      files[`${file}:${lineNo}`] = {file, lineNo}
    })
  })
  // convert to array of objects
  return Object.keys(files).sort().map(key => files[key])
}

function findPathInServer (options, path) {
  // coalesce array of server dirs
  const dirs = dirsToArray(options.server)
  if (dirs.length === 0) {
    return []
  }
  const files = {}
  dirs.forEach(dir => {
    let searchResult = ''
    try {
      searchResult = execSync(`grep -rn --include=\\*.js --include=\\*.json '${path}' ${dir}`).toString()
    } catch (e) {
      searchResult = ''
    }
    searchResult.split('\n').filter(l => !!l).forEach(result => {
      const {file, lineNo} = parseFileAndLineNo(result)
      if (!files[file]) {
        files[file] = {file, lines: [], lastModified: getLastModified(file)}
      }
      const existingLines = files[file].lines
      if (existingLines.findIndex(no => no === lineNo) === -1) {
        existingLines.push(lineNo)
      }
    })
  })
  // convert to array of objects
  return Object.keys(files).sort().map(key => files[key])
}

function createSrcPathRegExp (path) {
  const parts = path.split('/')
  let pattern = parts
    .map((p, i) => {
      if (p.includes(':')) return '[\\s\\S]*'
      if ((i + 1) === parts.length) return `${p}*`
      return p
    })
    .join('\\/')
  pattern = `(${pattern})\\w+`
  return new RegExp(pattern)
}

function nthIndex (str, pat, n) {
  const L = str.length
  let i = -1
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i)
    if (i < 0) break
  }
  return i
}
