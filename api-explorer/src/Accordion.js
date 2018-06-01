import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

export default class Accordion extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    headerProps: PropTypes.object,
    title: PropTypes.any,
    option: PropTypes.any,
    children: PropTypes.any
  }
  state = {
    open: false
  }
  componentDidMount () {
    const {id} = this.props
    window.$(`#collapse-${id}`).on('show.bs.collapse', () => this.setState({open: true}))
    window.$(`#collapse-${id}`).on('hidden.bs.collapse', () => this.setState({open: false}))
  }
  render () {
    const {id, headerProps} = this.props
    const headingId = `heading-${id}`
    const collapseId = `collapse-${id}`
    return (
      <div className='card'>
        <div
          className='card-header'
          id={headingId}
          style={{padding: '0rem'}}
          {...headerProps}
        >
          <div className='row'>
            <div className='col-10'>
              <span className='mb-0'>
                <button
                  className='btn btn-link'
                  style={{fontSize: '.75rem'}}
                  type='button'
                  data-toggle='collapse'
                  data-target={`#${collapseId}`}
                  aria-controls={collapseId}
                >
                  {this.props.title}
                </button>
              </span>
            </div>
            <div className='col-2 text-right'>
              {this.props.option}
            </div>
          </div>
        </div>

        <div id={collapseId} className='collapse' aria-labelledby={headingId}>
          <div className='card-body pl-4 border-bottom' style={{overflowX: 'scroll'}}>
            {this.state.open && this.props.children}
          </div>
        </div>
      </div>
    )
  }
}