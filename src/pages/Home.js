import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/logged');
        setAccount(res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du compte:', error);
      }
    };

    fetchAccount();
  }, []);

  return (
    <div>
      <p>Welcome {account}</p>
    </div>
  );
}

export default Home;
