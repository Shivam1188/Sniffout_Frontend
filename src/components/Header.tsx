import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleBack = () => {
    window.location.href = "https://www.sniffout.ai/";
  };

  const handleNavigation = (section: string) => {
    if (section === "home") {
      window.location.href = "https://www.sniffout.ai/";
    } else if (section === "price") {
      window.location.href = "https://www.sniffout.ai/#price-table";
    } else if (section === "how-it-works") {
      window.location.href = "https://www.sniffout.ai/#how-work";
    } else if (section === "blog") {
      window.location.href = "https://www.sniffout.ai/blog/";
    } else if (section === "book-demo") {
      window.location.href = "https://www.sniffout.ai/#form-trial";
    }
  };

  return (
    <header className="w-full shadow-sm">
      <nav className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleBack}
        >
          <img
            src="/logo1.png"
            alt="Logo"
            className="w-[190px] mx-auto md:mx-0 object-contain"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 font-semibold">
          <ul className="flex space-x-6">
            <li>
              <button
                onClick={() => handleNavigation("home")}
                className="cursor-pointer hover:text-orange-500 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("price")}
                className="cursor-pointer hover:text-orange-500 transition-colors"
              >
                Price
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("how-it-works")}
                className="cursor-pointer hover:text-orange-600 transition-colors"
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("blog")}
                className="cursor-pointer hover:text-orange-500 transition-colors"
              >
                Blog
              </button>
            </li>
          </ul>
          <button
            onClick={() => handleNavigation("book-demo")}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:opacity-90 transition"
          >
            Book Demo
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none transition-transform duration-300"
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col bg-white font-semibold text-start shadow-sm border-t border-gray-200">
          <button
            onClick={() => {
              handleNavigation("home");
              setMenuOpen(false);
            }}
            className="py-3 px-4 border-b border-gray-200 text-orange-500 hover:text-orange-600 text-left transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => {
              handleNavigation("price");
              setMenuOpen(false);
            }}
            className="py-3 px-4 border-b border-gray-200 hover:text-orange-500 text-left transition-colors"
          >
            Price
          </button>
          <button
            onClick={() => {
              handleNavigation("how-it-works");
              setMenuOpen(false);
            }}
            className="py-3 px-4 border-b border-gray-200 hover:text-orange-500 text-left transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              handleNavigation("blog");
              setMenuOpen(false);
            }}
            className="py-3 px-4 border-b border-gray-200 hover:text-orange-500 text-left transition-colors"
          >
            Blog
          </button>
          <button
            onClick={() => {
              handleNavigation("book-demo");
              setMenuOpen(false);
            }}
            className="py-3 px-4 hover:text-orange-500 text-left transition-colors"
          >
            Book Demo
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
