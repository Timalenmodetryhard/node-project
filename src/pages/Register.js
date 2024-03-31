import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const handleSubmit = async (e) => {
      e.preventDefault();
    
      try {
         const response = await fetch('http://localhost:8080/api/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
         });

         if (response.ok) {
            console.log('Inscription réussie !');
         } else {
            console.error('Erreur lors de l\'inscription');
         }
      } catch (error) {
         console.error('Erreur lors de la requête :', error);
      }
   };

   return (
      <form onSubmit={handleSubmit}>
         <input name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} /><br />
         <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
         <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
         <button type="submit">Submit</button><br />
         <p>Already registered ?</p>
         <div><Link to="/login">Login</Link></div>
      </form>
   );
}

export default Register;
