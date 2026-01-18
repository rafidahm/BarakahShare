import { Link } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import QuoteBox from '../components/QuoteBox';
import { BookOpenIcon, HeartIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="container mx-auto px-4 py-12">
      <QuoteBox />
      
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          IIUCShare
        </h1>
        <p className="text-2xl text-primary mb-2">Share Knowledge, Share Barakah</p>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          A charity-driven platform where IIUC students can donate, lend, and request academic items. 
          Together, we build a stronger community through sharing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card text-center">
          <BookOpenIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Donate Items</h2>
          <p className="text-gray-600 mb-6">
            Share your academic resources with fellow students. Books, notes, calculators, and more can help others succeed.
          </p>
          {authenticated ? (
            <Link to="/donate" className="btn-primary inline-block">
              Donate Now
            </Link>
          ) : (
            <Link to="/login" className="btn-primary inline-block">
              Login to Donate
            </Link>
          )}
        </div>

        <div className="card text-center">
          <HeartIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Request Items</h2>
          <p className="text-gray-600 mb-6">
            Browse available items from generous donors. Find what you need for your studies and request it.
          </p>
          <Link to="/browse" className="btn-primary inline-block">
            Browse Items
          </Link>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold mb-2">Sign In</h3>
            <p className="text-sm text-gray-600">Login with your IIUC email (@ugrad.iiuc.ac.bd)</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold mb-2">Share or Request</h3>
            <p className="text-sm text-gray-600">Donate items you no longer need or request items you need</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-gray-600">Item owners approve requests and you coordinate the exchange</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
