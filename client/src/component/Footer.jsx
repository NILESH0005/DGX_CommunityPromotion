import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaGlobe,
} from 'react-icons/fa';
import images from '../../public/images';

const Footer = () => {
  return (
    <footer className="bg-DGXblue dark:bg-gray-900">
      <div className="container px-6 py-8 mx-auto">
        <div className="flex flex-col items-center text-center">
          <a href="/">
            <img className="w-auto h-7" src={images.gilogowhite} alt="GiVenture Logo" />
          </a>

          <div className="flex flex-wrap justify-center mt-6 -mx-4">
            {[
              { name: "Home", link: "/" },
              { name: "Discussion", link: "/Discussion" },
              { name: "Event and Workshop", link: "/EventWorkshopPage" },
              { name: "Blogs", link: "/Blog" },
              { name: "Quiz", link: "/QuizInterface" },
              { name: "LMS", link: "/LearningPath" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="mx-4 text-sm text-white transition-colors duration-300 hover:text-DGXgreen dark:text-gray-300 dark:hover:text-blue-400"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <hr className="my-6 border-gray-200 md:my-10 dark:border-gray-700" />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            © Copyright 2025. All Rights Reserved.
          </p>

          <div className="flex -mx-2 mt-4 sm:mt-0">
            {[
              {
                icon: <FaFacebookF />,
                label: "Facebook",
                url: "https://www.facebook.com/GlobalInfoventures/",
              },
              {
                icon: <FaLinkedinIn />,
                label: "LinkedIn",
                url: "https://in.linkedin.com/company/global-infoways",
              },
              {
                icon: <FaInstagram />,
                label: "Instagram",
                url: "https://www.instagram.com/global_infoventures/",
              },
              {
                icon: <FaYoutube />,
                label: "YouTube",
                url: "https://www.youtube.com/channel/UCMaOjTQeyBNt0wKycTVcrjg/",
              },
              {
                icon: <FaGlobe />,
                label: "Website",
                url: "https://www.giindia.com/",
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                aria-label={social.label}
              >
                <span className="text-xl">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
