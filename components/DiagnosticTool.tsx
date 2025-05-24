import React, { useState } from 'react'
import axios from 'axios'

export const DiagnosticTool = () => {
  const [endpoint, setEndpoint] = useState('')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const testEndpoint = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await axios.get(endpoint)
      setResponse(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}
    >
      <h3>Diagnostic Tool</h3>
      <input
        type="text"
        placeholder="Enter API endpoint"
        value={endpoint}
        onChange={e => setEndpoint(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <button onClick={testEndpoint} disabled={loading || !endpoint}>
        {loading ? 'Testing...' : 'Test Endpoint'}
      </button>
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</div>
      )}
      {response && (
        <pre
          style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default DiagnosticTool
