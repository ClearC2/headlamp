import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from './config'

export default class ActivateStaticResponse extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    respId: PropTypes.number,
    onActivate: PropTypes.func,
    active: PropTypes.bool
  }
  state = {
    loading: false
  }
  onClick = e => {
    e.preventDefault()
    if (!this.props.active) {
      this.activate()
    } else {
      this.deactivate()
    }
  }
  activate = () => {
    if (this.state.loading) return
    this.setState({loading: true})
    const {route, respId} = this.props
    axios.get(`${config.api}/_route/${route.id}/responses/${respId}/activate`).then(res => {
      this.setState({loading: false})
      this.props.onActivate(res.data.respId)
    })
      .catch(() => {})
  }
  deactivate = () => {
    if (this.state.loading) return
    this.setState({loading: true})
    const {route} = this.props
    axios.get(`${config.api}/_route/${route.id}/responses/deactivate`).then(res => {
      this.setState({loading: false})
      this.props.onActivate(res.data.respId)
    })
      .catch(() => {})
  }

  getText = () => {
    if (this.state.loading) {
      return 'Loading...'
    }
    return this.props.active ? 'Active' : 'Activate'
  }
  getBadgeClass = () => {
    if (this.state.loading) return 'badge-secondary'
    return this.props.active ? 'badge-success' : 'badge-primary'
  }
  render () {
    return (
      <a href='' onClick={this.onClick} style={{cursor: 'pointer'}}>
        <span className={`badge ${this.getBadgeClass()}`}>
          {this.getText()}
        </span>
      </a>
    )
  }
}
