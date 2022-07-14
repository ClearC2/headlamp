import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import Har from './Har'

class Settings extends PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
  }

  onSubmit = e => {
    e.preventDefault()
    window.location.reload()
  }

  render () {
    const queryParams = new URLSearchParams(this.props.location.search)
    const lines = queryParams.get('lines')
    return (
      <div className='border rounded bg-light p-2 mb-3'>
        <form onSubmit={this.onSubmit}>
          <div className='form-group'>
            <label htmlFor='exampleInputEmail1'>Lines</label>
            <input
              type='number'
              value={lines || ''}
              onChange={e => {
                queryParams.set('lines', e.target.value)
                this.props.history.replace({
                  search: queryParams.toString()
                })
              }}
              className='form-control'
              placeholder='Enter lines' />
            <small className='form-text text-muted'>
              The number of lines of code to display
            </small>
          </div>
          <button type='submit' className='btn btn-primary'>
            Save
          </button>
        </form>
        <div className='mt-3'>
          <Har />
        </div>
      </div>
    )
  }
}

export default withRouter(Settings)
