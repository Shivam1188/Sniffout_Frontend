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
      color: "#E4405F",
      link: "https://www.instagram.com/sniffout.ai/",
    },
    { icon: <FaTwitter />, color: "#1DA1F2", link: "https://x.com/SniffOutAI" },
    {
      icon: <FaYoutube />,
      color: "#FF0000",
      link: "https://www.youtube.com/@SniffOut-AI",
    },
    {
      icon: <FaLinkedin />,
      color: "#0A66C2",
      link: "https://www.linkedin.com/company/sniffoutai/",
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      <div className="container max-w-[1120px] mx-auto">
        {/* Main Footer Section */}
        <div className="w-full mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Left: Logo + Social */}
          <div className="footer-logo">
            <img
              src="/logo1.png"
              alt="Logo"
              className="cursor-pointer w-[300px] object-contain"
              onClick={handleBack}
            />
            <div className="flex justify-center md:justify-start gap-4 mt-6 ml-8">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-orange-500 shadow-md hover:scale-110 transition-all duration-300"
                  style={{
                    border: `2px solid ${item.color}`,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col gap-2">
            <a
              href="https://www.sniffout.ai/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 hover:text-blue-600 mt-6"
            >
              Privacy Policy
            </a>
          </div>

          {/* Right: Contact Info */}
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-orange-500" />
              <span>+1 267-279-9509</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-orange-500" />
              <span>info@sniffout.ai</span>
            </div>
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-orange-500 mt-1" />
              <span>
                PO Box 152, Pottstown Pa.19464 <br />
                United States
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Bottom Bar */}
        <div className="text-center text-sm py-4 text-gray-600">
          Delivered by{" "}
          <a
            href="https://devexhub.com/"
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
