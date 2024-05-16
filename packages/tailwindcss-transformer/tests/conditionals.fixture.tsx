import React, { ReactNode } from 'react'
import { cx as cn } from 'class-variance-authority'

interface ButtonProps {
  children: ReactNode
  className?: string
}

const Button: React.FC<ButtonProps> = ({ children, className }) => {
  const buttonClasses = cn(
    (something === 'flex' || 'flex') && 'flex',
    ['flex', 'flex'],
    something === 'flex' || something === 'flex' ? (something ? 'flex' : 'flex') : 'flex',
    className
  )

  return <button className={buttonClasses}>{children}</button>
}

export default Button
