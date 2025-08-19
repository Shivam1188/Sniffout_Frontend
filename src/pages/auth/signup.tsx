import AuthForm from "../../components/AuthForm";

const SignUp = () => {
  return (
    <AuthForm
      title="Create an Account"
      fields={[
        {name:"firstname", label: "Full Name", type: "text", placeholder: "John " },
        {name:"lastname", label: "Last Name", type: "text", placeholder: "Doe" },
        { name:"email",label: "Email", type: "email", placeholder: "you@example.com" },
        { name:"password",label: "Password", type: "password", placeholder: "••••••••" },
        { name:"confirmpassword",label: "Confirm Password", type: "password", placeholder: "••••••••" }
      ]}
      buttonText="🚀 Sign Up"
      linkText="Already have an account?"
      linkPath="/auth/login"
      linkLabel="Sign in"
      type="signup"

    />
  );
};

export default SignUp;
