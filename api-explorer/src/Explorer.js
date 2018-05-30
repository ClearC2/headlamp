import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactPaginate from 'react-paginate'
import {withRouter} from 'react-router-dom'
import Route from './Route'
import Search from './Search'

class Explorer extends PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    routes: PropTypes.array,
    hidePath: PropTypes.string,
    src: PropTypes.any
  }
  redirect = (values = {}) => {
    const queryParams = new URLSearchParams(this.props.location.search)
    Object.keys(values).forEach(key => {
      queryParams.set(key, values[key])
    })
    const search = queryParams.toString()
    const method = values.q === undefined ? 'push' : 'replace'
    this.props.history[method]({
      pathname: '/',
      search: search ? `?${search}` : ''
    })
  }
  render () {
    const queryParams = new URLSearchParams(this.props.location.search)
    const search = (queryParams.get('q') || '').toLowerCase()
    const queryPage = Number(queryParams.get('page')) || 1
    const page = queryPage <= 1 ? 1 : queryPage
    const zeroIndexPage = page - 1

    let routes = this.props.routes.filter(route => {
      return route.search.includes(search)
    })
    const numberPerPage = 20
    const pageCount = Math.ceil(routes.length / numberPerPage)
    const begin = (zeroIndexPage * numberPerPage)
    const end = begin + numberPerPage
    routes.sort((a, b) => {
      if (a.path < b.path) return -1
      if (a.path > b.path) return 1
      return 0
    })
    routes = routes.slice(begin, end)
    return (
      <div>
        <div className='mb-3'>
          <Search
            value={search}
            onChange={(e) => {
              this.redirect({
                q: e.target.value,
                page: 1
              })
            }}
          />
        </div>
        {routes.map((route, i) => (
          <div key={i} className={'mb-2'}>
            <Route
              key={i}
              route={route}
              hidePath={this.props.hidePath}
              src={this.props.src}
            />
          </div>
        ))}
        <div className='text-center' id='react-paginate'>
          <ReactPaginate
            previousLabel='Prev'
            nextLabel='Next'
            initialPage={zeroIndexPage || 0}
            forcePage={zeroIndexPage || 0}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={({selected}) => {
              this.redirect({page: selected + 1})
            }}
            containerClassName={`pagination ${pageCount <= 1 ? 'd-none' : ''}`}
            subContainerClassName='pages pagination'
            activeClassName='active'
            breakClassName='page-item'
            breakLabel={<a className='page-link'>...</a>}
            pageClassName='page-item'
            previousClassName='page-item'
            nextClassName='page-item'
            pageLinkClassName='page-link'
            previousLinkClassName='page-link'
            nextLinkClassName='page-link'
          />
        </div>
      </div>
    )
  }
}

export default withRouter(Explorer)
