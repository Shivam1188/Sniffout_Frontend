const Header = () => {
  const handleBack = () => {
    window.location.href = "https://www.sniffout.io/";
  };

  return (
    <header className="flex items-center p-4 bg-gray-100 shadow-md">
      <button
        onClick={handleBack}
        className="text-gray-700 font-medium hover:text-blue-600 flex items-center gap-2"
      >
        ← Back
      </button>
    </header>
  );
};

export default Header;
