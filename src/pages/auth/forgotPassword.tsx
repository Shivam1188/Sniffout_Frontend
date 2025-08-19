import AuthForm from "../../components/AuthForm";

const ForgotPassword = () => {
  return (
    <AuthForm
      title="Forgot Password"
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter your registered email",
        },
      ]}
      buttonText="📧 Send Reset Link"
      linkText="Remember your password?"
      linkPath="/auth/login"
      linkLabel="Back to Login"
      type="forgot-password" 
    />
  );
};

export default ForgotPassword;
