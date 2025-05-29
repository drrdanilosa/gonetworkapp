'use client'

import React, { useState } from 'react'
import { registerUser } from '@/services/auth-service'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await registerUser(name, email, password)
      setMessage('Registration successful! You can now log in.')
      console.log('User registered:', response.user)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed. Username might already be taken.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {message && <p className="message">{message}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
