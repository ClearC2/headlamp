const {protocol, hostname, port} = window.location

export default {
  env: global.NODE_ENV,
  api: global.NODE_ENV === 'development' ? 'http://localhost:5033' : `${protocol}//${hostname}:${port}`
}
