import React, { ReactNode } from 'react'
import { cx as cn } from 'class-variance-authority'

interface ButtonProps {
  children: ReactNode
  className?: string
}

const Button: React.FC<ButtonProps> = ({ children, className }) => {
  const buttonClasses = cn('bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded', className)

  return <button className={buttonClasses}>{children}</button>
}

export default Button
