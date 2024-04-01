import { Link } from 'react-router-dom';

function Login() {
   return (
      <form action="http://localhost:8080/api/login" method="POST">
         <input name="email" type="email"></input><br/>
         <input name="password" type="password"></input><br/>
         <button type="submit">Submit</button><br/>
         <p>No account ?</p><div><Link to="/register">Register</Link></div>
      </form>
   );
}
  
export default Login;