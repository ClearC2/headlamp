import React, {Fragment, PureComponent} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import Spinner from 'react-spinkit'
import config from './config'
import SourceReference from './SourceReference'
import ServerReference from './ServerReference'

class PathReferences extends PureComponent {
  static propTypes = {
    route: PropTypes.object.isRequired,
    hidePath: PropTypes.string,
    location: PropTypes.object
  }
  state = {
    src: [],
    server: [],
    loading: false
  }
  componentDidMount () {
    this.fetchData()
  }
  componentDidUpdate (prevProps) {
    if (this.props.route !== prevProps.route) {
      this.fetchData()
    }
  }
  fetchData = () => {
    this.setState({loading: true})
    const queryParams = new URLSearchParams(this.props.location.search)
    queryParams.set('path', this.props.route.path)
    axios.get(`${config.api}/_path?${queryParams.toString()}`).then(res => {
      this.setState({
        loading: false,
        src: res.data.src || [],
        server: res.data.server || {}
      })
    })
      .catch(() => {})
  }
  render () {
    if (this.state.loading) {
      return (
        <Spinner name='line-scale-pulse-out' fadeIn='quarter' />
      )
    }
    const {route, hidePath} = this.props
    const srcFiles = this.state.src || []
    const serverFiles = this.state.server || []
    const uid = route.id.replace(/[^a-z0-9]/gi, '')
    return (
      <div>
        {srcFiles.length > 0 && (
          <Fragment>
            <h6>References</h6>
            <div className='accordion' id='accordion'>
              {srcFiles.map((file, i) => (
                <SourceReference
                  key={`${uid}-${i}`}
                  id={`${uid}-${i}`}
                  reference={file}
                  hidePath={hidePath}
                />
              ))}
            </div>
          </Fragment>
        )}
        {route.filename && (
          <div className='mt-3'>
            <ServerReference
              file={route.filename}
              modified={route.lastModified}
              hidePath={hidePath}
            />
          </div>
        )}
        {!route.filename && serverFiles.length > 0 && (
          <div className='mt-3'>
            {serverFiles.map((file, i) => (
              <ServerReference
                key={i}
                file={`${file.file}:${file.lines.join(',')}`}
                modified={file.lastModified}
                hidePath={hidePath}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(PathReferences)
