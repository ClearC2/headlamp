import React, {useRef, useState} from 'react'
import axios from 'axios'
import config from './config'
import useAppState from './AppContext'

export default function Har () {
  const app = useAppState()
  const formRef = useRef()
  const [har, setHar] = useState(() => {
    if (app.har) {
      return {filename: app.har.filename, requests: app.har.requests}
    }
  })
  const resetForm = () => {
    formRef.current.reset()
    setHar(null)
  }
  const onChange = (e) => {
    const file = e.target?.files?.[0]
    if (!file) {
      resetForm()
      return
    }
    const reader = new window.FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        const requests = (json?.log?.entries || [])
          .filter(entry => {
            // is api request
            return entry.response.headers.find(h => h.name === 'Content-Type' && h.value.includes('application/json'))
          })
          .map(entry => {
            const url = new window.URL(entry.request.url)
            return {
              path: url.pathname,
              query: Object.fromEntries(url.searchParams.entries()),
              method: entry.request.method,
              url: entry.request.url,
              request: entry.request,
              response: entry.response,
              json: entry.response.content.mimeType === 'application/json'
                ? JSON.parse(entry.response.content.text)
                : null
            }
          }).filter(entry => {
            return entry.request.method !== 'OPTIONS'
          })
        setHar({filename: file.name, requests})
      } catch (e) {
        window.alert('Could not parse HAR')
        resetForm()
      }
    }
    reader.onerror = (e) => {
      window.alert('Could not read HAR')
      console.error(e) // eslint-disable-line
      resetForm()
    }
    reader.readAsText(e.target.files[0], 'UTF-8')
  }
  const onSubmit = (e) => {
    e.preventDefault()
    if (app.har) {
      axios.delete(`${config.api}/_har`)
        .then(res => {
          window.alert(res.data.message)
          window.location.reload()
        })
      return
    }
    axios.post(`${config.api}/_har`, {har})
      .then((res) => {
        window.alert(res?.data?.message)
        window.location.reload()
      })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <div className='input-group is-invalid'>
        <div className='custom-file'>
          <input
            type='file'
            className='custom-file-input'
            id='har-file'
            onChange={onChange}
            required
            disabled={!!app.har}
            readOnly={!!app.har}
          />
          <label className='custom-file-label' htmlFor='har-file'>
            {har?.filename || 'Choose HAR file...'}
          </label>
        </div>
        <div className='input-group-append'>
          <button className='btn btn-primary' type='submit'>
            {app.har ? 'Clear HAR' : 'Upload HAR'}
          </button>
        </div>
      </div>
    </form>
  )
}
