/**
 * Islamic quotes and motivational messages for IIUCShare
 */
export const quotes = [
  {
    text: "The best charity is that given when one is in need.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "Knowledge is not what is memorized. Knowledge is what benefits.",
    source: "Imam Shafi'i"
  },
  {
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "Seek knowledge from the cradle to the grave.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "Whoever guides someone to goodness will have a reward like one who did it.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "The best among you are those who learn the Quran and teach it.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "A person's true wealth is the good he or she does in this world.",
    source: "Prophet Muhammad (PBUH)"
  },
  {
    text: "The best of people are those who are most beneficial to others.",
    source: "Prophet Muhammad (PBUH)"
  }
];

/**
 * Get a random quote
 */
export const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};
