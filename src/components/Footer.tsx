import {
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const handleBack = () => {
    window.location.href = "https://www.sniffout.ai/";
  };

  const socialLinks = [
    {
      icon: <FaInstagram />,
      link: "https://www.instagram.com/sniffout.ai/",
    },
    { icon: <FaTwitter />, link: "https://x.com/SniffOutAI" },
    {
      icon: <FaYoutube />,
      link: "https://www.youtube.com/@SniffOut-AI",
    },
    {
      icon: <FaLinkedin />,
      link: "https://www.linkedin.com/company/sniffoutai/",
    },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-white to-[#f9faff] text-gray-800 pt-10 pb-4 border-t border-gray-200">
      <div className="container max-w-[1120px] mx-auto px-6">
        {/* Main Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
          {/* Left: Logo + Social Icons */}
          <div>
            <img
              src="/logo1.png"
              alt="Logo"
              className="cursor-pointer  mx-auto md:mx-0 object-contain"
              onClick={handleBack}
            />
            <div className="flex justify-center gap-3 mt-6">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[35px] h-[35px] flex items-center justify-center rounded-full bg-[#fe6a3c] text-white text-[20px] shadow-sm hover:shadow-lg hover:scale-110 transition-all duration-300 ease-in-out"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col justify-center items-center space-y-2 font-semibold mt-4 md:mt-0">
            <a
              href="https://www.sniffout.ai/terms-and-conditions/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-orange-500"
            >
              Terms and Conditions
            </a>
            <a
              href="https://www.sniffout.ai/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-orange-500"
            >
              Privacy Policy
            </a>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-center md:justify-start items-center gap-2">
              <span className="bg-orange-500 text-white p-2 rounded-full">
                <FaPhoneAlt />
              </span>
              <span>+1 267-279-9509</span>
            </div>
            <div className="flex justify-center md:justify-start items-center gap-2">
              <span className="bg-orange-500 text-white p-2 rounded-full">
                <FaEnvelope />
              </span>
              <span>info@sniffout.ai</span>
            </div>
            <div className="flex justify-center md:justify-start items-start gap-2">
              <span className="bg-orange-500 text-white p-2 rounded-full mt-1">
                <FaMapMarkerAlt />
              </span>
              <span>
                PO Box 152, Pottstown Pa.19464
                <br />
                United States
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6 w-11/12 mx-auto"></div>

        {/* Bottom Bar */}
        <div className="text-center text-sm text-gray-600">
          Delivered by{" "}
          <a
            href="https://devexhub.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 font-semibold hover:underline"
          >
            DevexHub
          </a>{" "}
          / Copywriting © 2025
        </div>
      </div>
    </footer>
  );
};

export default Footer;
