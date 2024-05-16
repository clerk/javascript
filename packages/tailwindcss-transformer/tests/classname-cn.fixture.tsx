import React, { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
}

const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <button data-test-id="id-123" className={cn('flex')}>
      {children}
    </button>
  )
}

export default Button
