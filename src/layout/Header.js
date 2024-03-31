import React from 'react'
import { Link } from 'react-router-dom';

function Header() {
    return (
       <header>
            <nav>
                <div><Link to="/">Home</Link></div>
                <div><Link to="/login">Login</Link></div>
            </nav>
       </header>
    );
  }
  
  export default Header;