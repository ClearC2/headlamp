import React, {Component} from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter from './SyntaxHighlighter'

function StatusBadge ({status}) {
  status = String(status)
  const leadingNumber = status.substr(0, 1)
  let className = 'badge-secondary'
  if (leadingNumber === '2') className = 'badge-success'
  if (leadingNumber === '3') className = 'badge-dark'
  if (leadingNumber === '4') className = 'badge-warning'
  if (leadingNumber === '5') className = 'badge-danger'

  return <span className={`badge ${className} mr-1`}>{status}</span>
}
StatusBadge.propTypes = {
  status: PropTypes.number
}

export default class Response extends Component {
  static propTypes = {
    response: PropTypes.any,
    status: PropTypes.number,
    path: PropTypes.string,
    onRemove: PropTypes.func
  }
  getResponse = () => {
    const {response = {}} = this.props
    const {data} = response
    try {
      if (data) {
        return JSON.stringify(data, null, 2)
      }
    } catch (e) {}
    return data
  }
  render () {
    const {response = {}, onRemove} = this.props
    const {status, config = {}} = response
    const {url = '', method = ''} = config
    return (
      <div>
        <div className='row mt-4'>
          <div className='col col-11'>
            <StatusBadge status={status} /> {method.toUpperCase()} {url.substr(21)}
          </div>
          <div className='col col-1 text-right'>
            <button
              title='Remove response'
              className={'btn btn-sm tn-secondary'}
              onClick={onRemove}>
              <span className='oi oi-trash' />
            </button>
          </div>
        </div>
        <div className='border mt-2 px-4 pt-2 pb-1'>
          <SyntaxHighlighter
            language='json'
            lineNumberStyle={{color: '#c8c8c8'}}
          >{this.getResponse()}</SyntaxHighlighter>
        </div>
      </div>
    )
  }
}
