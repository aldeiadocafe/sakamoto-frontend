import React from 'react'
import logo from '../assets/logo.png'

const Logo = () => {
  return (
    <div className='logo'>
        <a href='/'>
          <img src={logo} 
            style={{width: '20px'}}/>
        </a>
    </div>
  )
}

export default Logo