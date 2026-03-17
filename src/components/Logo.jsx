import React from 'react'
import logo from '../assets/logo.png'

const Logo = () => {
  return (
    <div className='logo'>
      <img src={logo} 
        style={{width: '20px'}}/>
    </div>
  )
}

export default Logo