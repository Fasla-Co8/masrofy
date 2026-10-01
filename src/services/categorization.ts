export interface CategorizationRule {
  category: string;
  subcategory?: string;
  keywords: string[];
  type?: 'expense' | 'income' | 'transfer';
}

export const CATEGORY_DEFINITIONS: Record<string, { icon: string; color: string; defaultBudget: number }> = {
  Food: { icon: 'Utensils', color: '#F97316', defaultBudget: 450 },
  Shopping: { icon: 'ShoppingBag', color: '#EC4899', defaultBudget: 300 },
  Transportation: { icon: 'Car', color: '#3B82F6', defaultBudget: 200 },
  Bills: { icon: 'Receipt', color: '#EAB308', defaultBudget: 600 },
  Entertainment: { icon: 'Film', color: '#8B5CF6', defaultBudget: 150 },
  Health: { icon: 'HeartPulse', color: '#10B981', defaultBudget: 120 },
  Education: { icon: 'GraduationCap', color: '#06B6D4', defaultBudget: 80 },
  Travel: { icon: 'Plane', color: '#F43F5E', defaultBudget: 250 },
  Subscriptions: { icon: 'Repeat', color: '#6366F1', defaultBudget: 65 },
  Income: { icon: 'TrendingUp', color: '#22C55E', defaultBudget: 0 },
  Other: { icon: 'MoreHorizontal', color: '#64748B', defaultBudget: 100 },
};

const CATEGORIZATION_RULES: CategorizationRule[] = [
  // Income
  {
    category: 'Income',
    subcategory: 'Salary',
    type: 'income',
    keywords: ['salary', 'payroll', 'wages', 'employer', 'direct dep', 'stipend', 'bonus'],
  },
  {
    category: 'Income',
    subcategory: 'Investments',
    type: 'income',
    keywords: ['dividend', 'interest payment', 'capital gains', 'trading 212', 'vanguard'],
  },
  // Subscriptions
  {
    category: 'Subscriptions',
    subcategory: 'Digital Services',
    type: 'expense',
    keywords: ['netflix', 'spotify', 'disney+', 'disney plus', 'youtube premium', 'apple music', 'prime video', 'audible', 'patreon', 'github', 'chatgpt', 'openai', 'notion'],
  },
  {
    category: 'Subscriptions',
    subcategory: 'Fitness',
    type: 'expense',
    keywords: ['puregym', 'david lloyd', 'the gym group', 'gym membership', 'nuffield health', 'fitness first', 'strava'],
  },
  // Food & Dining
  {
    category: 'Food',
    subcategory: 'Groceries',
    type: 'expense',
    keywords: ['tesco', 'sainsbury', 'asda', 'waitrose', 'aldi', 'lidl', 'morrisons', 'm&s food', 'whole foods', 'trader joe', 'grocery', 'supermarket', 'co-op'],
  },
  {
    category: 'Food',
    subcategory: 'Restaurants & Takeaway',
    type: 'expense',
    keywords: ['mcdonald', 'starbucks', 'costa', 'pret a manger', 'deliveroo', 'uber eats', 'just eat', 'nando', 'wagamama', 'domino', 'kfc', 'greggs', 'burger king', 'pizza', 'cafe', 'restaurant', 'coffee', 'bakery'],
  },
  // Transportation
  {
    category: 'Transportation',
    subcategory: 'Public Transit & Rides',
    type: 'expense',
    keywords: ['uber', 'tfl', 'transport for london', 'underground', 'trainline', 'national rail', 'bolt', 'lyft', 'metro', 'bus', 'eurostar', 'cab'],
  },
  {
    category: 'Transportation',
    subcategory: 'Fuel & Parking',
    type: 'expense',
    keywords: ['shell', 'bp', 'esso', 'texaco', 'petrol', 'fuel', 'parking', 'ncp parking', 'ringgo'],
  },
  // Shopping
  {
    category: 'Shopping',
    subcategory: 'General Merchandise',
    type: 'expense',
    keywords: ['amazon', 'ebay', 'argos', 'ikea', 'currys', 'john lewis', 'target', 'walmart'],
  },
  {
    category: 'Shopping',
    subcategory: 'Clothing & Apparel',
    type: 'expense',
    keywords: ['zara', 'asos', 'nike', 'adidas', 'h&m', 'uniqlo', 'next', 'marks & spencer', 'primark', 'clothing'],
  },
  // Bills & Utilities
  {
    category: 'Bills',
    subcategory: 'Utilities',
    type: 'expense',
    keywords: ['british gas', 'octopus energy', 'edf', 'eon', 'thames water', 'water', 'electricity', 'gas', 'council tax'],
  },
  {
    category: 'Bills',
    subcategory: 'Telecom & Internet',
    type: 'expense',
    keywords: ['ee limited', 'vodafone', 'o2', 'three', 'bt broadband', 'virgin media', 'sky uk', 'broadband', 'phone bill'],
  },
  // Health
  {
    category: 'Health',
    subcategory: 'Medical & Pharmacy',
    type: 'expense',
    keywords: ['boots', 'superdrug', 'pharmacy', 'chemist', 'nhs', 'bupa', 'dental', 'optician', 'specsavers', 'doctor', 'clinic', 'hospital'],
  },
  // Entertainment
  {
    category: 'Entertainment',
    subcategory: 'Leisure',
    type: 'expense',
    keywords: ['odeon', 'vue', 'cineworld', 'cinema', 'theatre', 'ticketmaster', 'eventim', 'steam', 'playstation', 'xbox', 'nintendo', 'pub', 'bar', 'brewery'],
  },
  // Travel
  {
    category: 'Travel',
    subcategory: 'Airlines & Lodging',
    type: 'expense',
    keywords: ['british airways', 'ryanair', 'easyjet', 'airbnb', 'booking.com', 'hotels.com', 'expedia', 'flight', 'hotel', 'resort'],
  },
  // Education
  {
    category: 'Education',
    subcategory: 'Learning',
    type: 'expense',
    keywords: ['udemy', 'coursera', 'edx', 'university', 'college', 'tuition', 'waterstones', 'books', 'kindle'],
  },
];

export function categorizeTransaction(
  merchantName: string,
  description: string,
  providerCategory?: string,
  amount?: number
): { category: string; subcategory?: string; transactionType: 'expense' | 'income' | 'transfer' } {
  const textToScan = `${merchantName || ''} ${description || ''} ${providerCategory || ''}`.toLowerCase();

  // If amount is negative and typical for income
  if (amount !== undefined && amount < 0) {
    for (const rule of CATEGORIZATION_RULES) {
      if (rule.type === 'income' && rule.keywords.some((k) => textToScan.includes(k))) {
        return {
          category: rule.category,
          subcategory: rule.subcategory,
          transactionType: 'income',
        };
      }
    }
  }

  // Check keyword rules
  for (const rule of CATEGORIZATION_RULES) {
    if (rule.keywords.some((keyword) => textToScan.includes(keyword))) {
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        transactionType: rule.type || (amount && amount < 0 ? 'income' : 'expense'),
      };
    }
  }

  // Fallback to provider category hint if available
  if (providerCategory) {
    const norm = providerCategory.toLowerCase();
    if (norm.includes('food') || norm.includes('dining') || norm.includes('groceries')) {
      return { category: 'Food', transactionType: 'expense' };
    }
    if (norm.includes('travel') || norm.includes('airline')) {
      return { category: 'Travel', transactionType: 'expense' };
    }
    if (norm.includes('service') || norm.includes('utility') || norm.includes('bill')) {
      return { category: 'Bills', transactionType: 'expense' };
    }
    if (norm.includes('shop') || norm.includes('retail')) {
      return { category: 'Shopping', transactionType: 'expense' };
    }
  }

  return {
    category: 'Other',
    transactionType: amount && amount < 0 ? 'income' : 'expense',
  };
}
