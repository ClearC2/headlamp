import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

export default class Search extends PureComponent {
  static propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    disabled: PropTypes.bool
  }
  static defaultProps = {
    placeholder: 'Search',
    onSubmit: () => {}
  }
  onSubmit = e => {
    e.preventDefault()
    this.props.onSubmit()
  }

  render () {
    const {
      value,
      onChange,
      onSubmit,
      placeholder,
      disabled
    } = this.props
    return (
      <form onSubmit={this.onSubmit}>
        <div className='input-group'>
          <input
            type='text'
            value={value || ''}
            onChange={onChange}
            className='form-control'
            placeholder={placeholder}
          />
          <div className='input-group-append'>
            <button
              className='btn btn-primary'
              type='submit'
              onClick={onSubmit}
              disabled={disabled}
            >
              <span className='oi oi-magnifying-glass' />
            </button>
          </div>
        </div>
      </form>
    )
  }
}