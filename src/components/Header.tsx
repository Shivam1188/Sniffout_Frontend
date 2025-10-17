const Header = () => {
  const handleBack = () => {
    window.location.href = "https://www.sniffout.ai/";
  };

  return (
    <header className="flex items-center p-4 bg-white shadow-md w-full">
      <div className="container max-w-[1120px] mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div>
          <img
            src="/logo1.png"
            alt="Logo"
            className="cursor-pointer w-[300px] h-[80px] object-contain"
            onClick={handleBack}
          />
        </div>

        {/* Button on the right */}
        <div>
          <button
            onClick={handleBack}
            className="cursor-pointer flex items-center gap-2 text-[#d56b61] font-semibold border border-[#d56b61] px-10 py-2 rounded-full transition-all duration-300 hover:bg-[#d56b61] hover:text-white hover:shadow-lg hover:scale-105"
          >
            ← Back
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
