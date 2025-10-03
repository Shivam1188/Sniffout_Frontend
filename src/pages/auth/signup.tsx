import AuthForm from "../../components/AuthForm";

const SignUp = () => {
  return (
    <AuthForm
      title="Create an Account"
      fields={[
        {
          name: "firstname",
          label: "First Name",
          type: "text",
          placeholder: "Enter first name",
        },
        {
          name: "lastname",
          label: "Last Name",
          type: "text",
          placeholder: "Enter last name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
        {
          name: "confirmpassword",
          label: "Confirm Password",
          type: "password",
          placeholder: "Confirm password",
        },
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
