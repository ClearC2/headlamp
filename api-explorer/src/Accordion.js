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
    const id = this.getId()
    window.$(`#collapse-${id}`).on('show.bs.collapse', () => this.setState({open: true}))
    window.$(`#collapse-${id}`).on('hidden.bs.collapse', () => this.setState({open: false}))
  }
  getId = () => {
    return this.props.id.replace(/\W/g, '')
  }
  render () {
    const {option} = this.props
    const id = this.getId()
    const headingId = `heading-${id}`
    const collapseId = `collapse-${id}`
    return (
      <div className='card'>
        <div
          className='card-header'
          id={headingId}
          style={{padding: '0rem'}}
        >
          <div className='row'>
            <div className={option ? 'col-10' : 'col'}>
              <span className='mb-0'>
                <button
                  className='btn btn-link'
                  style={{fontSize: '.75rem'}}
                  type='button'
                  data-toggle='collapse'
                  data-target={`#${collapseId}`}
                  aria-controls={collapseId}
                  id={`${id}-link`}
                >
                  {this.props.title}
                </button>
              </span>
            </div>
            {option && (
              <div className='col-2 text-right'>
                {this.props.option}
              </div>
            )}
          </div>
        </div>

        <div id={collapseId} className='collapse' aria-labelledby={headingId}>
          <div className='card-body px-4 border-bottom' style={{overflowX: 'scroll'}}>
            {this.state.open && this.props.children}
          </div>
        </div>
      </div>
    )
  }
}
