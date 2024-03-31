import React, { useState, useEffect } from 'react';

function Home() {
   const [userData, setUserData] = useState(null);

   useEffect(() => {
      fetch('http://localhost:8080/api/logged', {
         method: 'GET',
         credentials: 'include'
      })
      .then(response => {
         if (!response.ok) {
            throw new Error('Impossible de récupérer les données utilisateur');
         }
         return response.json();
      })
      .then(data => {
         setUserData(data);
      })
      .catch(error => {
         console.error('Erreur lors de la récupération des données utilisateur:', error);
      });
   }, []);

   return (
      <div>
         <p>Welcome {userData && userData.name}</p>
      </div>
   );
}

export default Home;