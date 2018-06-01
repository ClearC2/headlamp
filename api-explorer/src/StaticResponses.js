import React, {Fragment, PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from './config'
import Accordion from './Accordion'
import SyntaxHighlighter from './SyntaxHighlighter'
import {StatusBadge} from './Response'
import ActivateStaticResponse from './ActivateStaticResponse'
import Markdown from './Markdown'

export default class StaticResponses extends PureComponent {
  static propTypes = {
    route: PropTypes.object
  }
  state = {
    responses: [],
    respId: null,
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
    const {route} = this.props
    axios.get(`${config.api}/_route/${route.id}/responses`).then(res => {
      this.setState({
        loading: false,
        respId: res.data.respId,
        responses: res.data.responses || []
      })
    })
      .catch(() => {})
  }
  render () {
    if (this.state.responses.length === 0) return null
    const {route} = this.props
    return (
      <div className='mt-4'>
        <h6>Responses</h6>
        <div className='accordion'>
          {this.state.responses.map((response, i) => (
            <Accordion
              key={i}
              id={`${route.id}-resp-${i}`}
              title={(
                <Fragment>
                  <StatusBadge status={response.status} /> {response.title}
                </Fragment>
              )}
              option={(
                <span className='d-block mr-2 mb-0' style={{marginTop: '.15rem'}}>
                  <ActivateStaticResponse
                    active={String(this.state.respId) === String(i)}
                    route={route}
                    respId={i}
                    onActivate={respId => this.setState({respId})}
                  />
                </span>
              )}
            >
              {response.description && (
                <Markdown>
                  {response.description}
                </Markdown>
              )}
              <div className={response.description ? 'border p-4' : undefined}>
                <SyntaxHighlighter language='json'>
                  {JSON.stringify(response.response, null, 4)}
                </SyntaxHighlighter>
              </div>
            </Accordion>
          ))}
        </div>
      </div>
    )
  }
}
