import { Link } from 'react-router-dom';

function Register() {
   return (
      <form action="http://localhost:8080/api/register" method="POST">
         <input id="name" name="name" type="text" /><br />
         <input id="email" name="email" type="email"/><br />
         <input id="password" name="password" type="password"/><br />
         <button type="submit">Submit</button><br />
         <p>Already registered ?</p>
         <div><Link to="/login">Login</Link></div>
      </form>
   );
}

export default Register;
