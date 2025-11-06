import AuthForm from "../../components/AuthForm";

const Login = () => {
  return (
    <AuthForm
      title="Welcome Back"
      fields={[
        {
          name: "loginIdentifier",
          label: "Email or Phone Number",
          type: "text",
          placeholder: "you@example.com or 1234567890",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "••••••••",
        },
      ]}
      buttonText="🔐 Login"
      linkText="Don't have an account?"
      linkPath="/auth/signup"
      linkLabel="Sign up"
      type="login"
    />
  );
};

export default Login;
