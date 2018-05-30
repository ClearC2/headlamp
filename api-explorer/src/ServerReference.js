import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {cleanFilename, displayDate} from './utils'

export default class ServerReference extends PureComponent {
  static propTypes = {
    file: PropTypes.string,
    modified: PropTypes.string,
    hidePath: PropTypes.string
  }

  render () {
    const {file, modified, hidePath} = this.props
    const filename = cleanFilename(file.replace(hidePath, ''))
    return (
      <p className={'card-text mr-1 mb-0 text-muted'} title={displayDate(modified)}>
        <small>{filename}</small>
      </p>
    )
  }
}
