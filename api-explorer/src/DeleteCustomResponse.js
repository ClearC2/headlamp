import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from './config'

class DeleteCustomResponse extends React.Component {
  static propTypes = {
    route: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired
  }
  state = {
    loading: false
  }
  onClick = () => {
    if (this.state.loading) return
    const {route, id} = this.props
    this.setState({loading: true})
    axios.delete(`${config.api}/_route/${route.id}/responses/${id}`).then(() => {
      this.setState({loading: false})
      this.props.onSuccess()
    })
      .catch(() => {
        this.setState({loading: false})
      })
  }
  render () {
    return (
      <a onClick={this.onClick} style={{cursor: 'pointer'}}>
        <span className='ml-1 badge badge-danger'>
          {this.state.loading ? '...' : <span>&times;</span>}
        </span>
      </a>
    )
  }
}

export default DeleteCustomResponse
