import React from 'react'
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/prism-light'
import jsx from 'react-syntax-highlighter/languages/prism/jsx'
import js from 'react-syntax-highlighter/languages/prism/javascript'
import json from 'react-syntax-highlighter/languages/prism/json'
import prism from 'react-syntax-highlighter/styles/prism/coy'

registerLanguage('jsx', jsx)
registerLanguage('js', js)
registerLanguage('json', json)

export default function Highlighter (props) {
  return (
    <SyntaxHighlighter
      style={prism}
      showLineNumbers
      lineNumberStyle={{color: '#c8c8c8'}}
      {...props}
    />
  )
}
