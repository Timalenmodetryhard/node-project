import React, { useState } from 'react'
import { Link } from 'react-router-dom';

function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
         const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });

         if (response.ok) {
            console.log('Connexion réussie !');
         } else {
            console.error('Erreur lors de la connexion');
         }
      } catch (error) {
         console.error('Erreur lors de la requête :', error);
      }
   };
    return (
       <form onSubmit={handleSubmit}>
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></input><br/>
            <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input><br/>
            <button type="submit">Submit</button><br/>
            <p>No account ?</p><div><Link to="/register">Register</Link></div>
       </form>
    );
  }
  
  export default Login;