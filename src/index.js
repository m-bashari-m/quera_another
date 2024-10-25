function filterAndSortProducts(products, criteria) {
  
  let filteredProducts = products.filter(product => {
    if (criteria.categories && criteria.categories.length > 0) {
      if (!criteria.categories.includes(product.category)) return false;
    }
    
    if (criteria.priceRange) {
      const { min, max } = criteria.priceRange;
      if (product.price < min || product.price > max) return false;
    }

    if (criteria.nameLength) {
      const { min, max } = criteria.nameLength;
      if (product.name.length < min || product.name.length > max) return false;
    }

    if (criteria.keywords && criteria.keywords.length > 0) {
      const nameLower = product.name.toLowerCase();
      if (!criteria.keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
        return false;
      }
    }

    return true; 
  });

  if (criteria.sortBy && criteria.sortBy.length > 0) {
    filteredProducts.sort((a, b) => {
      for (let sortCriteria of criteria.sortBy) {
        const { field, order } = sortCriteria;
        const direction = order === 'ascending' ? 1 : -1;

        if (a[field] > b[field]) return direction;
        if (a[field] < b[field]) return -direction;
      }
      return 0;
    });
  }

  return filteredProducts;
}
module.exports = { filterAndSortProducts };