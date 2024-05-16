import React, { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
}

const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <button data-id="id-123" className={something === 'flex' ? 'flex' : 'flex'}>
      {children}
    </button>
  )
}

export default Button
