import React from 'react'
import PropTypes from 'prop-types'
import MarkdownIt from 'markdown-it'
import ReactDOMServer from 'react-dom/server'
import SyntaxHighlighter from './SyntaxHighlighter'

const markdown = MarkdownIt({
  highlight: function (str, lang) {
    const code = (
      <SyntaxHighlighter language={lang} >
        {str}
      </SyntaxHighlighter>
    )
    return `<div class="border px-3 pt-2 pb-0">${ReactDOMServer.renderToStaticMarkup(code)}</div>`
  }
})

export default function Markdown ({children}) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: markdown.render(children)
      }}
    />
  )
}

Markdown.propTypes = {children: PropTypes.string}
