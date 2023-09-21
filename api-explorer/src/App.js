import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {Route, withRouter} from 'react-router-dom'
import axios from 'axios'
import Explorer from './Explorer'
import config from './config'
import RoutePage from './RoutePage'
import {buildRouteSearchString, normalizeParams} from './utils'
import Markdown from './Markdown'
import Grep from './Grep'
import Settings from './Settings'
import {AppContext} from './AppContext'

const defaultTitle = 'Headlamp'

class App extends Component {
  static propTypes = {
    history: PropTypes.object
  }

  state = {
    routes: [],
    showDescription: false,
    showOptions: false
  }

  componentDidMount () {
    axios.get(`${config.api}/_api`).then(res => {
      document.title = res.data.title || defaultTitle

      const routes = res.data.routes.map(r => {
        return {
          ...r,
          params: normalizeParams(r.params),
          query: normalizeParams(r.query),
          search: buildRouteSearchString(r)
        }
      })
      this.setState({
        ...res.data,
        routes
      })
    })
  }

  goTo = (pathname) => {
    const queryParams = new URLSearchParams(window.location.search)
    // remove search query when clicking home
    queryParams.set('q', '')
    queryParams.set('page', 1)
    this.props.history.push({
      pathname,
      search: queryParams.toString()
    })
  }

  render () {
    const queryParams = new URLSearchParams(window.location.search)
    // remove search query when clicking home
    queryParams.set('q', '')
    queryParams.set('page', 1)
    return (
      <AppContext.Provider value={this.state}>
        <div className={'container mt-5'} style={{marginBottom: '5rem'}}>
          <div className='row'>
            <div className='col'>
              <a
                id='app-title'
                onClick={() => this.goTo('/')}
              >
                <h1>
                  {this.state.title || defaultTitle}
                </h1>
              </a>
            </div>
            <div className='col mt-3 text-right'>
              {this.state.har && (
                <span
                  className='badge badge-warning mr-3'
                  style={{cursor: 'pointer'}}
                  onClick={() => this.setState({showOptions: !this.state.showOptions})}
                  role='button'
                >
                  HAR Active
                </span>
              )}
              {this.state.src && (
                <a
                  onClick={() => this.goTo('/grep')}
                  title='grep'
                  style={{cursor: 'pointer', color: '#007bff'}}
                >
                  <span className='oi oi-magnifying-glass' />
                </a>
              )}
              {this.state.description && (
                <a
                  className='ml-3'
                  onClick={() => this.setState({showDescription: !this.state.showDescription})}
                  title='Description'
                  style={{cursor: 'pointer', color: '#007bff'}}
                >
                  <span className='oi oi-document' />
                </a>
              )}
              {this.state.src && (
                <Fragment>
                  <a
                    className='ml-3'
                    onClick={() => window.location.reload()}
                    title='Refresh'
                    style={{cursor: 'pointer', color: '#007bff'}}
                  >
                    <span className='oi oi-loop-circular' />
                  </a>
                  <a
                    className='ml-3'
                    onClick={() => this.setState({showOptions: !this.state.showOptions})}
                    title='Settings'
                    style={{cursor: 'pointer', color: '#007bff'}}
                  >
                    <span className='oi oi-cog' />
                  </a>
                </Fragment>
              )}
            </div>
          </div>
          {this.state.src && this.state.showOptions && (
            <Fragment>
              <Settings />
            </Fragment>
          )}
          {this.state.description && this.state.showDescription && (
            <div className='border px-4 pt-3 mb-3'>
              <Markdown>{this.state.description}</Markdown>
            </div>
          )}
          <Route
            exact
            path='/'
            render={props => (
              <Explorer
                {...props}
                routes={this.state.routes}
                hidePath={this.state.hidePath}
                src={this.state.src}
              />
            )}
          />
          <Route
            path='/request/:id'
            render={props => (
              <RoutePage
                {...props}
                routes={this.state.routes}
                hidePath={this.state.hidePath}
                src={this.state.src}
              />
            )}
          />
          <Route
            path='/grep'
            render={props => (
              <Grep
                {...props}
                hidePath={this.state.hidePath}
              />
            )}
          />
        </div>
      </AppContext.Provider>
    )
  }
}

export default withRouter(App)
