import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter from './SyntaxHighlighter'
import {cleanFilename, displayDate} from './utils'
import Accordion from './Accordion'

export default class SourceReference extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    reference: PropTypes.object,
    hidePath: PropTypes.string
  }
  render () {
    const {id, reference, hidePath} = this.props
    if (!reference) return null
    const lineNumbers = typeof reference.lineNo === 'number' ? [reference.lineNo] : reference.lineNos
    const filename = cleanFilename(`${reference.file.replace(hidePath, '')}:${lineNumbers.join(',')}`)

    return (
      <Accordion
        id={id}
        title={(
          <span title={displayDate(reference.lastModified)}>
            {filename}
          </span>
        )}
      >
        <SyntaxHighlighter
          language='jsx'
          startingLineNumber={reference.startLineNo}
          lineNumberStyle={no => ({color: lineNumbers.includes(no) ? '#007bff' : '#c8c8c8'})}
        >
          {reference.lines.join('\n')}
        </SyntaxHighlighter>
      </Accordion>
    )
  }
}
