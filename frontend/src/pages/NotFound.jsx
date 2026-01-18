import { Link } from 'react-router-dom';
import QuoteBox from '../components/QuoteBox';
import Card from '../components/Card';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <QuoteBox />
      
      <Card>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Go Home
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
