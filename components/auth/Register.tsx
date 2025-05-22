'use client'

"use client"

import React, { useState } from 'react'
import { registerUser } from '../../features/auth/authService'

const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const isRegistered = registerUser(username, password, role)
    if (isRegistered) {
      setMessage('Registration successful! You can now log in.')
    } else {
      setMessage('Registration failed. Username might already be taken.')
    }
  }

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
        <div>
          <label>Role:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {message && <p className="message">{message}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register
