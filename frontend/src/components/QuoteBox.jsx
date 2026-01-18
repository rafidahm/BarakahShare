import { useState, useEffect } from 'react';
import { getRandomQuote } from '../utils/quotes';

const QuoteBox = ({ autoRefresh = false, interval = 10000 }) => {
  const [quote, setQuote] = useState(getRandomQuote());

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(() => {
        setQuote(getRandomQuote());
      }, interval);

      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval]);

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-lg p-6 shadow-lg mb-6">
      <div className="text-center">
        <p className="text-lg italic mb-2">"{quote.text}"</p>
        <p className="text-sm opacity-90">— {quote.source}</p>
      </div>
    </div>
  );
};

export default QuoteBox;
