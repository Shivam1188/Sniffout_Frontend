import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      <div className="container max-w-[1120px] mx-auto">
        {/* Main Footer Section */}
        <div className="w-full mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Left: Logo + Social */}
          <div>
            {/* <h2 className="text-2xl font-bold text-blue-700 "> */}
            <img
              src="/logo1.png"
              alt="Logo"
              className="w-[300px] h-[80px] object-contain"
            />
            {/* </h2> */}
            <div className="flex justify-center md:justify-start gap-4 mt-6 ml-8">
              {[
                { icon: <FaFacebook />, color: "#1877F2" },
                { icon: <FaTwitter />, color: "#1DA1F2" },
                { icon: <FaYoutube />, color: "#FF0000" },
                { icon: <FaLinkedin />, color: "#0A66C2" },
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
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
            {/* <a
              href="#" // Terms of Service (keep or update your link)
              className="font-semibold text-gray-800 hover:text-blue-600"
            >
              Terms of Service
            </a> */}
            <a
              href="https://www.sniffout.io/privacy-policy/"
              target="_blank" // opens in a new tab (optional)
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 hover:text-blue-600 mt-6"
            >
              Privacy Policy
            </a>
          </div>

          {/* Right: Contact Info */}
          <div className="flex flex-col   gap-3 text-gray-700">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-orange-500" />
              <span>+1 267-279-9509</span>
            </div>
            <div className="flex items-center  gap-2">
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
