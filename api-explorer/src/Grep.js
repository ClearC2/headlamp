import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Spinner from 'react-spinkit'
import {withRouter} from 'react-router-dom'
import Search from './Search'
import config from './config'
import SourceReference from './SourceReference'

class Grep extends PureComponent {
  static propTypes = {
    hidePath: PropTypes.string,
    location: PropTypes.object,
    history: PropTypes.object
  }
  state = {
    loading: false,
    files: [],
    searched: false
  }
  componentDidMount () {
    this.search()
  }
  isDisabled = () => {
    const search = this.getSearchString()
    const {loading} = this.state
    return search.length < 3 || loading
  }
  getSearchString = () => {
    const queryParams = new URLSearchParams(this.props.location.search)
    return queryParams.get('q') || ''
  }
  search = () => {
    if (this.isDisabled()) return
    this.setState({loading: true, error: null, files: []})
    const queryParams = new URLSearchParams(this.props.location.search)
    axios.get(`${config.api}/_grep?${queryParams.toString()}`).then(res => {
      this.setState({...res.data, loading: false, searched: true})
    }).catch(error => {
      this.setState({loading: false, error: error.response.data.error})
    })
  }
  render () {
    const {
      loading,
      searched,
      files,
      error
    } = this.state
    const queryParams = new URLSearchParams(this.props.location.search)
    const search = queryParams.get('q')
    return (
      <div>
        <div className='mb-3'>
          <Search
            value={search}
            placeholder='grep'
            onChange={(e) => {
              const queryParams = new URLSearchParams(this.props.location.search)
              queryParams.set('q', e.target.value)
              const search = queryParams.toString()
              this.props.history.replace({
                pathname: '/grep',
                search: search ? `?${search}` : ''
              })
            }}
            onSubmit={this.search}
            disabled={this.isDisabled()}
          />
        </div>
        {loading && (
          <div className='text-center mt-5'>
            <Spinner name='line-scale-pulse-out' fadeIn='quarter' />
          </div>
        )}
        {!loading && searched && files.length === 0 && !error && (
          <div className='text-center mt-5'>
            No luck...
          </div>
        )}
        {error && (
          <div className='text-center mt-5'>
            {error}
          </div>
        )}
        {!loading && files.length > 0 && (
          <div className='accordion' id='accordion'>
            {files.map((file, i) => (
              <SourceReference
                key={`file-${i}`}
                id={`file-${i}`}
                reference={file}
                hidePath={this.props.hidePath}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(Grep)
