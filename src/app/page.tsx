// src/app/page.tsx
import LoginButton from "lib/components/loginButton"; 

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to SecureNote!</h1>
      <LoginButton/>
    </div>
  );
};

export default HomePage;

