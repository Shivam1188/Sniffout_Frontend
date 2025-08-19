import AuthForm from "../../components/AuthForm";

const Login = () => {
  return (
    <AuthForm
      title="Welcome Back"
      fields={[
        {name:"email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name:"password",label: "Password", type: "password", placeholder: "••••••••" }
      ]}
      buttonText="🔐 Login"
      linkText="Don’t have an account?"
      linkPath="/auth/signup"
      linkLabel="Sign up"
      type="login"
    />
  );
};

export default Login;
