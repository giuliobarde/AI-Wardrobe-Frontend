import Link from "next/link";

interface CallToActionProps {
  user: any; // Consider defining a more specific user type
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ user, onLoginClick, onSignupClick }) => (
  <div className="flex flex-col items-center gap-4 mb-12">
    <p className="text-lg text-gray-400 max-w-2xl text-center">
      Join thousands of users who have revolutionized their daily style choices with Attirely.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      {!user && (
        <>
          <button
            onClick={onLoginClick}
            className="px-6 py-3 bg-blue-600 rounded-full font-medium shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
          >
            Log In
          </button>
          <button
            onClick={onSignupClick}
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-600 hover:text-white transition transform hover:scale-105"
          >
            Sign Up
          </button>
        </>
      )}
      <Link
        href="/Wardrobe"
        className="px-6 py-3 border border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-600 hover:text-white transition transform hover:scale-105"
      >
        Explore Wardrobe
      </Link>
    </div>
  </div>
);

export default CallToAction; 