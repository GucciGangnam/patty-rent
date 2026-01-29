// Currency utilities for formatting prices with the correct currency symbol
// ISO 4217 currency codes with symbols and display names

export interface Currency {
  code: string
  symbol: string
  name: string
  symbolPosition: 'before' | 'after'
  decimalPlaces: number
}

// Comprehensive list of world currencies
// Ordered by common usage, with VND prominently included for Vietnam launch
export const CURRENCIES: Currency[] = [
  // Major currencies
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', symbolPosition: 'after', decimalPlaces: 0 },

  // Asia-Pacific
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', symbolPosition: 'before', decimalPlaces: 2 },

  // Americas
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', symbolPosition: 'before', decimalPlaces: 0 },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', symbolPosition: 'before', decimalPlaces: 2 },

  // Europe
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', symbolPosition: 'after', decimalPlaces: 0 },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', symbolPosition: 'after', decimalPlaces: 2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', symbolPosition: 'before', decimalPlaces: 2 },

  // Middle East & Africa
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', symbolPosition: 'before', decimalPlaces: 3 },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', symbolPosition: 'before', decimalPlaces: 3 },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', symbolPosition: 'before', decimalPlaces: 3 },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', symbolPosition: 'before', decimalPlaces: 2 },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', symbolPosition: 'after', decimalPlaces: 2 },
]

// Map for quick lookups by currency code
const currencyMap = new Map<string, Currency>(
  CURRENCIES.map(c => [c.code, c])
)

/**
 * Get currency details by ISO 4217 code
 */
export function getCurrency(code: string): Currency | undefined {
  return currencyMap.get(code)
}

/**
 * Get the symbol for a currency code
 * Returns the code itself if not found
 */
export function getCurrencySymbol(code: string): string {
  return currencyMap.get(code)?.symbol ?? code
}

/**
 * Format a numeric value with the appropriate currency symbol
 * Handles symbol position and decimal places based on currency
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string = 'AUD'
): string | null {
  if (value === null || value === undefined || value === '') return null

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return null

  const currency = getCurrency(currencyCode)

  if (!currency) {
    // Fallback formatting if currency not found
    return `${currencyCode} ${numValue.toLocaleString()}`
  }

  // Format the number with appropriate decimal places
  const formattedNumber = numValue.toLocaleString(undefined, {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  })

  // Position the symbol correctly
  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedNumber}`
  } else {
    return `${formattedNumber}${currency.symbol}`
  }
}

/**
 * Get a list of currencies formatted for a dropdown/select
 */
export function getCurrencyOptions(): { value: string; label: string }[] {
  return CURRENCIES.map(c => ({
    value: c.code,
    label: `${c.code} - ${c.name} (${c.symbol})`,
  }))
}
