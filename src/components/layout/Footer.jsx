import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">UniShare</h3>
            <p className="text-gray-300">
              A platform for university students to share educational resources and collaborate.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-300 hover:text-white">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/study-groups" className="text-gray-300 hover:text-white">
                  Study Groups
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=notes" className="text-gray-300 hover:text-white">
                  Notes
                </Link>
              </li>
              <li>
                <Link to="/?category=past-papers" className="text-gray-300 hover:text-white">
                  Past Papers
                </Link>
              </li>
              <li>
                <Link to="/?category=assignments" className="text-gray-300 hover:text-white">
                  Assignments
                </Link>
              </li>
              <li>
                <Link to="/?category=presentations" className="text-gray-300 hover:text-white">
                  Presentations
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Team</h4>
            <p className="text-gray-300">
              MayanK Singh & Rahul Choudhary <br />
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} UniShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;

