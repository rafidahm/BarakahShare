import { useState, useEffect } from 'react';
import { getRandomQuote } from '../utils/quotes';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const QuoteBox = () => {
  const [quote, setQuote] = useState(getRandomQuote());

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-lg p-6 shadow-lg mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-lg italic mb-2">"{quote.text}"</p>
          <p className="text-sm opacity-90">— {quote.source}</p>
        </div>
        <button
          onClick={refreshQuote}
          className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Refresh quote"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default QuoteBox;
