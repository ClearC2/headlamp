import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {Link, withRouter} from 'react-router-dom'
import Response from './Response'
import * as utils from './utils'
import RequestForm from './RequestForm'
import PathReferences from './PathReferences'
import Markdown from './Markdown'

class Route extends Component {
  static propTypes = {
    route: PropTypes.object,
    location: PropTypes.object,
    hidePath: PropTypes.string,
    src: PropTypes.any
  }
  state = {
    expanded: false
  }
  componentDidMount () {
    this.expandIfLinked()
  }
  componentDidUpdate (props) {
    if (props.route !== this.props.route) {
      this.expandIfLinked()
    }
  }
  expandIfLinked = () => {
    this.setState({
      expanded: this.props.location.pathname.includes('/request/')
    })
  }
  render () {
    const {route} = this.props
    const {expanded} = this.state
    return (
      <div className='card'>
        <div className='card-body' style={{paddingBottom: expanded ? '1rem' : '.75rem', paddingTop: '1rem'}}>
          <div className={`row ${this.state.expanded && 'mb-2'}`}>
            <div className='col-11'>
              <a onClick={() => this.setState({expanded: !expanded})} style={{cursor: 'pointer'}}>
                <h6
                  className={`card-subtitle text-muted`}
                  style={{marginTop: 0}}
                >
                  <span className={'mr-1'} style={{fontWeight: 100}}>
                    {utils.getAvailableMethods(route).map(m => m.toUpperCase()).join('|')}
                  </span>
                  {route.path}
                </h6>
              </a>
            </div>
            <div className='col-1 text-right'>
              <Link to={{pathname: `/request/${route.id}`, search: this.props.location.search}}>
                <span className='oi oi-link-intact' />
              </Link>
            </div>
          </div>
          {expanded && (
            <Fragment>
              {route.title && (
                <h5 className='card-title'>
                  {route.title || route.path}
                </h5>
              )}
              {route.description && (
                <div className='card-text'>
                  <Markdown>{route.description}</Markdown>
                </div>
              )}
              <div className={'text-left'}>
                <hr />
                <RequestForm
                  route={route}
                  setResponse={response => this.setState({response})}
                />
              </div>
              {this.state.response && (
                <Response
                  onRemove={() => this.setState({response: null})}
                  response={this.state.response}
                />
              )}
              {this.props.src && (
                <div className='mt-5'>
                  <PathReferences
                    route={route}
                    hidePath={this.props.hidePath}
                  />
                </div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Route)
