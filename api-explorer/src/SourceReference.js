import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter from './SyntaxHighlighter'
import {cleanFilename, displayDate} from './utils'

export default class SourceReference extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    reference: PropTypes.object,
    hidePath: PropTypes.string
  }
  state = {
    showCode: false
  }
  componentDidMount () {
    const {id} = this.props
    window.$(`#collapse-${id}`).on('show.bs.collapse', () => this.setState({showCode: true}))
    window.$(`#collapse-${id}`).on('hidden.bs.collapse', () => this.setState({showCode: false}))
  }
  render () {
    const {id, reference, hidePath} = this.props
    if (!reference) return null
    const headingId = `heading-${id}`
    const collapseId = `collapse-${id}`
    const lineNumbers = typeof reference.lineNo === 'number' ? [reference.lineNo] : reference.lineNos
    const filename = cleanFilename(`${reference.file.replace(hidePath, '')}:${lineNumbers.join(',')}`)

    return (
      <div className='card'>
        <div
          className='card-header'
          id={headingId}
          style={{padding: '0rem'}}
          title={displayDate(reference.lastModified)}>
          <span className='mb-0'>
            <button
              className='btn btn-link'
              style={{fontSize: '.75rem'}}
              type='button'
              data-toggle='collapse'
              data-target={`#${collapseId}`}
              aria-controls={collapseId}>
              {filename}
            </button>
          </span>
        </div>

        <div id={collapseId} className='collapse' aria-labelledby={headingId}>
          <div className='card-body border-bottom' style={{overflowX: 'scroll'}}>
            {this.state.showCode && (
              <SyntaxHighlighter
                language='jsx'
                startingLineNumber={reference.startLineNo}
                lineNumberStyle={no => ({color: lineNumbers.includes(no) ? '#007bff' : '#c8c8c8'})}
              >
                {reference.lines.join('\n')}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      </div>
    )
  }
}