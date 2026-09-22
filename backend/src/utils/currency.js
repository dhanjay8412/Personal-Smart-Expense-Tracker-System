const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const getCurrencySymbol = (code = 'INR') => {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return found ? found.symbol : '₹';
};

module.exports = {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
};
