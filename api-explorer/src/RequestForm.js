import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import * as utils from './utils'
import axios from 'axios/index'
import config from './config'
import pathToRegexp from 'path-to-regexp/index'

export default class RequestForm extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    location: PropTypes.object,
    setResponse: PropTypes.func
  }
  state = {
    paramValues: {},
    queryValues: {},
    method: '',
    payload: ''
  }
  componentDidMount () {
    this.initForm()
  }
  componentDidUpdate (prevProps) {
    if (prevProps.route !== this.props.route) {
      this.initForm()
    }
  }
  initForm = () => {
    const {route} = this.props
    const methods = utils.getAvailableMethods(route)
    const paramValues = {}
    utils.getPathParams(route).forEach(param => {
      paramValues[param.name] = param.value || ''
    })
    const queryValues = {}
    utils.getQueryParams(route).forEach(param => {
      queryValues[param.name] = param.value || ''
    })
    const method = methods[0]
    const payload = utils.getMethodPayload(route, method)
    this.setState({
      method,
      paramValues,
      queryValues,
      payload,
      sending: false
    })
  }
  onSubmit = e => {
    e.preventDefault()
    const method = this.state.method
    const {route} = this.props
    const toPath = pathToRegexp.compile(route.path)
    let path = null
    try {
      // build path
      path = toPath(this.state.paramValues)
    } catch (e) {
      window.alert(e)
      return
    }
    let payload
    if (['post', 'put', 'patch'].includes(method) && this.state.payload) {
      try {
        payload = JSON.parse(this.state.payload)
      } catch (e) {
        window.alert('Invalid json')
        return
      }
    }
    // build query string
    const queryParams = new URLSearchParams()
    Object.keys(this.state.queryValues)
      .filter(q => this.state.queryValues[q])
      .forEach(q => {
        queryParams.set(q, this.state.queryValues[q])
      })
    const queryString = queryParams.toString()
    // assemble url
    path = `${path}${queryString && `?${queryString}`}`

    this.setState({sending: true})
    this.props.setResponse(null)
    axios[method](`${config.api}${path}`, payload).then(res => {
      this.setState({sending: false})
      this.props.setResponse(res)
    })
      .catch(error => {
        this.setState({sending: false})
        this.props.setResponse(error ? error.response : null)
      })
  }
  render () {
    const {route} = this.props
    const availableMethods = utils.getAvailableMethods(route)
    const params = utils.getPathParams(route)
    const query = utils.getQueryParams(route)
    const {
      method,
      paramValues,
      queryValues,
      payload,
      sending
    } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <div className='row'>
          {params.length > 0 && (
            <div className='col'>
              <h6>URL Params</h6>
              {params.map(param => (
                <div key={param.name} className='form-group'>
                  <label>{param.name}</label>
                  <input
                    className='form-control'
                    value={paramValues[param.name] || ''}
                    onChange={e => {
                      this.setState({
                        paramValues: {
                          ...paramValues,
                          [param.name]: e.target.value
                        }
                      })
                    }}
                  />
                  {param.help && (
                    <small>{param.help}</small>
                  )}
                </div>
              ))}
            </div>
          )}
          {query.length > 0 && (
            <div className='col'>
              <h6>Query Params</h6>
              {query.map(param => (
                <div key={param.name} className='form-group'>
                  <label>{param.name}</label>
                  <input
                    className='form-control'
                    value={queryValues[param.name] || ''}
                    onChange={e => {
                      this.setState({
                        queryValues: {
                          ...queryValues,
                          [param.name]: e.target.value
                        }
                      })
                    }}
                  />
                  {param.help && (
                    <small>{param.help}</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='form-group'>
          <label>Method</label>
          <select
            className='form-control col-2'
            value={method || ''}
            onChange={e => {
              this.setState({
                method: e.target.value,
                response: null,
                payload: utils.getMethodPayload(route, e.target.value)
              })
            }}
            disabled={availableMethods.length <= 1}
          >
            {availableMethods.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>
        {['post', 'put', 'patch'].includes(method) && (
          <div className='form-group'>
            <label>Payload</label>
            <textarea
              className='form-control'
              placeholder='Payload'
              value={payload || ''}
              onChange={e => this.setState({payload: e.target.value})}
            />
          </div>
        )}
        <button type='submit' className='btn btn-sm btn-primary' disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    )
  }
}
