import React, {Fragment, PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from './config'
import Accordion from './Accordion'
import SyntaxHighlighter from './SyntaxHighlighter'
import {StatusBadge} from './Response'
import ActivateStaticResponse from './ActivateStaticResponse'
import Markdown from './Markdown'
import CustomResponseForm from './CustomResponseForm'
import DeleteCustomResponse from './DeleteCustomResponse'
import {useCopyToClipboard} from './copyToClipboard'

export default class StaticResponses extends PureComponent {
  static propTypes = {
    route: PropTypes.object
  }
  state = {
    responses: [],
    respId: null,
    loading: false,
    response: null
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
              option={route.routeFile && (
                <span className='mr-2 mb-0 d-block' style={{marginTop: '.15rem'}}>
                  <ActivateStaticResponse
                    active={String(this.state.respId) === String(i)}
                    route={route}
                    respId={i}
                    onActivate={respId => this.setState({respId})}
                  />
                  {response.id && (
                    <DeleteCustomResponse
                      route={route}
                      id={response.id}
                      onSuccess={this.fetchData}
                    />
                  )}
                </span>
              )}
            >
              {response.description && (
                <Markdown>
                  {response.description}
                </Markdown>
              )}
              {response.id ? (
                <CustomResponseForm
                  route={route}
                  response={response}
                  onSuccess={() => {
                    window.$('#custom-link').click()
                    this.fetchData()
                  }}
                />
              ) : (
                <div className='position-relative'>
                <div className={response.description ? 'border p-4' : undefined}>
                  <CopyButton
                    className="btn btn-xs position-absolute"
                    style={{zIndex: 1, top: '.5rem', right: '.5rem'}}
                    text={JSON.stringify(response.response, null, 4)}
                  />
                  <button
                    className="btn btn-xs position-absolute"
                    style={{zIndex: 1, top: '.5rem', right: '5rem'}}
                    onClick={() => {
                      window.$('#custom-link').click()
                      setTimeout(() => {
                        window.document.getElementById('custom-link').scrollIntoView()
                      }, 500)
                      this.setState({response})
                    }}
                  >
                    Customize
                  </button>
                  <SyntaxHighlighter language='json'>
                    {JSON.stringify(response.response, null, 4)}
                  </SyntaxHighlighter>
                </div>
                </div>
              )}
            </Accordion>
          ))}
          <Accordion id='custom' title='Add Custom'>
            <CustomResponseForm
              route={route}
              response={this.state.response}
              onSuccess={() => {
                window.$('#custom-link').click()
                this.setState({response: null})
                this.fetchData()
              }}
            />
          </Accordion>
        </div>
      </div>
    )
  }
}

function CopyButton({className, style, text}) {
  const [, copyToClipboard] = useCopyToClipboard()
  const onClick = () => {
    copyToClipboard(text)
  }
  return (
    <button className={className} style={style}onClick={onClick}>Copy</button>
  )
}
