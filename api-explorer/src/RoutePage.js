import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import Route from './Route'

class RoutePage extends PureComponent {
  static propTypes = {
    routes: PropTypes.array,
    match: PropTypes.object,
    hidePath: PropTypes.string,
    src: PropTypes.any
  }

  render () {
    const {match, hidePath, src} = this.props
    const route = this.props.routes.find(r => r.id === match.params.id)
    return route
      ? <Route route={route} hidePath={hidePath} src={src} />
      : <div className={'text-center'}>No route found...</div>
  }
}

export default withRouter(RoutePage)
