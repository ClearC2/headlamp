import pathToRegexp from 'path-to-regexp/index'
import moment from 'moment/moment'

export function normalizeParams (params = {}) {
  const newParams = {}
  Object.keys(params).forEach(key => {
    const isObject = typeof params[key] === 'object'
    newParams[key] = {
      name: key,
      value: isObject ? params[key].value : (params[key] || ''),
      help: isObject ? params[key].help : ''
    }
  })
  return newParams
}

export function getAvailableMethods (route) {
  return ['get', 'post', 'put', 'patch', 'delete'].filter(m => {
    return Object.keys(route.methods).includes(m)
  })
}

export function getMethodPayload (route, method) {
  let payload = route.payload
  if (!payload) return ''
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    payload = payload[method.toUpperCase()] || payload
  }
  return JSON.stringify(payload || '', null, 4) || ''
}

export function getPathParams (route) {
  const urlParams = []
  pathToRegexp(route.path, urlParams)
  const routeParams = route.params || {}
  return urlParams.map(p => {
    const userDefined = routeParams[p.name] || {}
    return {
      ...p,
      value: '',
      help: '',
      ...userDefined
    }
  })
}

export function getQueryParams (route) {
  return Object.keys(route.query || {}).sort().map(name => {
    const param = route.query[name]
    const isObject = typeof param === 'object'
    return {
      name,
      value: isObject ? param.value : '',
      help: isObject ? param.help : ''
    }
  })
}

export function buildRouteSearchString (route) {
  const simplePath = '/' + route.path
    .split('/')
    .filter(p => !!p)
    .map(p => {
      return p.includes(':') ? ':' : p
    })
    .join('/')
  return `${route.path} ${simplePath} ${route.title} ${route.description}`.toLowerCase()
}

export function displayDate (date) {
  return date ? moment(date).local().format('ddd, MMM Do YYYY, h:mm a') : ''
}

export function cleanFilename (file) {
  const firstChar = file.substr(0, 1)
  return ['/', '\\'].includes(firstChar) ? file.substr(1) : file
}
