// Discount calculation utility
// Based on room price, calculate discount percentage

/**
 * Calculate discount percentage based on room price
 * @param {number} priceVnd - Room price in VND
 * @returns {number} Discount percentage (0-25)
 */
export const calculateDiscount = (priceVnd) => {
  if (!priceVnd || priceVnd <= 0) return 0;
  
  if (priceVnd > 5000000) return 25; // Luxury rooms → 25% discount
  if (priceVnd > 3000000) return 17; // Premium rooms → 17% discount
  if (priceVnd > 1500000) return 10; // Standard rooms → 10% discount
  return 0; // Budget rooms → no discount
};

/**
 * Calculate discounted price
 * @param {number} priceVnd - Original price
 * @returns {number} Discounted price
 */
export const getDiscountedPrice = (priceVnd) => {
  const discount = calculateDiscount(priceVnd);
  return priceVnd * (1 - discount / 100);
};

/**
 * Calculate original price before discount
 * @param {number} priceVnd - Current price
 * @returns {number} Original price before discount
 */
export const getOriginalPrice = (priceVnd) => {
  const discount = calculateDiscount(priceVnd);
  return Math.round(priceVnd / (1 - discount / 100));
};

/**
 * Get discount savings amount
 * @param {number} priceVnd - Room price
 * @returns {number} Amount saved with discount
 */
export const getDiscountAmount = (priceVnd) => {
  const discount = calculateDiscount(priceVnd);
  return Math.round(priceVnd * discount / 100);
};
