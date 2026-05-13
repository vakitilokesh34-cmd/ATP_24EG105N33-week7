import { Link } from "react-router";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm m-0">
          &copy; {year} MyBlog. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">Terms</Link>
          <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">Privacy</Link>
          <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;