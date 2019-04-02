import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from './config'

const textAreaStyle = {
  fontSize: 12,
  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
}

class CustomResponseForm extends React.Component {
  static propTypes = {
    route: PropTypes.object.isRequired,
    onSuccess: PropTypes.func.isRequired,
    response: PropTypes.object
  }
  state = {
    loading: false,
    title: '',
    status: '200',
    response: ''
  }
  constructor (props) {
    super(props)
    const {response = {}} = props
    this.state = {
      loading: false,
      title: response.title || '',
      status: `${response.status || '200'}`,
      response: response.response ? JSON.stringify(response.response, null, 2) : ''
    }
  }
  onSubmit = (e) => {
    e.preventDefault()
    const errors = []
    if (this.state.status.length !== 3) {
      errors.push('Invalid status.')
    }
    try {
      JSON.parse(this.state.response)
    } catch (e) {
      errors.push('Invalid json.')
    }
    if (errors.length > 0) {
      window.alert(errors.join('\n'))
    } else {
      this.save()
    }
  }
  save = () => {
    if (this.state.loading) return
    this.setState({loading: true})
    const {route} = this.props
    const payload = {
      response: {
        ...this.props.response,
        title: this.state.title,
        status: Number(this.state.status),
        response: JSON.parse(this.state.response)
      }
    }
    axios.put(`${config.api}/_route/${route.id}/responses`, payload).then(res => {
      const state = this.props.response
        ? {
          loading: false
        }
        : {
          loading: false,
          title: '',
          status: 200,
          response: ''
        }
      this.setState(state)
      this.props.onSuccess()
      if (this.props.response) {
        window.alert('Saved')
      }
    })
      .catch(() => {
        this.setState({loading: false})
      })
  }
  render () {
    return (
      <form onSubmit={this.onSubmit}>
        <div className='form-group'>
          <label>Title</label>
          <input
            required
            className='form-control'
            value={this.state.title}
            onChange={(e) => {
              this.setState({title: e.target.value})
            }}
          />
        </div>
        <div className='form-group'>
          <label>Status</label>
          <input
            required
            className='form-control'
            value={this.state.status}
            maxLength={3}
            onChange={(e) => {
              const status = String(e.target.value).substring(0, 3).replace(/\D/g, '')
              this.setState({status})
            }}
          />
        </div>
        <div className='form-group'>
          <label>Response</label>
          <textarea
            required
            className='form-control'
            rows={10}
            value={this.state.response}
            style={textAreaStyle}
            onChange={(e) => this.setState({response: e.target.value})}
          />
        </div>
        <button
          type='submit'
          className='btn btn-sm btn-primary'
          disabled={this.state.loading}
        >
          {this.state.loading ? 'Submitting' : 'Submit'}
        </button>
      </form>
    )
  }
}

export default CustomResponseForm
