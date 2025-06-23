import images from '../../public/images'; 
// import logo from '../../public/logo';

const Footer = () => {
  return (
    <footer className="bg-DGXblue text-DGXwhite py-10">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row justify-between">
        {/* Left Section - Logo and Description */}
        <div className="lg:w-1/4 mb-6 lg:mb-0">
          <a href="/" className="flex items-center space-x-3">
            <img src={images.gilogowhite} className="h-10" alt="GiVenture Logo" />
          </a>
         
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-DGXwhite hover:text-DGXgray transition duration-300">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-DGXwhite hover:text-DGXgray transition duration-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-DGXwhite hover:text-DGXgray transition duration-300">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" className="text-DGXwhite hover:text-DGXgray transition duration-300">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Middle Sections */}
        <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">About Company</a></li>
              <li><a href="#" className="hover:underline">Company Services</a></li>
              <li><a href="#" className="hover:underline">Job Opportunities</a></li>
              <li><a href="#" className="hover:underline">Creative People</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Customer</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Client Support</a></li>
              <li><a href="#" className="hover:underline">Latest News</a></li>
              <li><a href="#" className="hover:underline">Company Story</a></li>
              <li><a href="#" className="hover:underline">Pricing Packages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Additional</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Our Story</a></li>
              <li><a href="#" className="hover:underline">Who We Are</a></li>
              <li><a href="#" className="hover:underline">Our Process</a></li>
              <li><a href="#" className="hover:underline">Latest News</a></li>
            </ul>
          </div>

          {/* Latest Blog Section */}
          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Latest Blog</h4>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <img src={images.blg1} className="h-10 w-10 object-cover rounded-md" alt="Blog 1" />
                <a href="#" className="text-sm hover:underline">I think really important to design...</a>
              </div>
              <div className="flex space-x-3">
                <img src={images.blg2} className="h-10 w-10 object-cover rounded-md" alt="Blog 2" />
                <a href="#" className="text-sm hover:underline">Recognizing the need is the primary...</a>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm">
        <p>
          <a href="#" className="hover:underline"> Community Guideline </a> | 
          <a href="#" className="hover:underline"> Manage My Privacy </a> | 
          <a href="#" className="hover:underline"> Do Not Sell or Share Our Data </a> | 
          <a href="#" className="hover:underline"> Legal </a> | 
          <a href="#" className="hover:underline"> Accessibility </a> | 
          <a href="#" className="hover:underline"> Corporate Policies </a> | 
          <a href="#" className="hover:underline"> Product Security </a> | 
          <a href="#" className="hover:underline"> Contact </a>
        </p>
        <p className="mt-2">Copyright © 2024 Global Infoventures Pvt. Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;