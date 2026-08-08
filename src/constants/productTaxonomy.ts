export const PRODUCT_TAXONOMY = {
  Beverages: [
    "Water",
    "Soft Drinks",
    "Juice",
    "Energy Drinks",
    "Sports Drinks",
    "Coffee",
    "Tea",
  ],

  "Snacks & Confectionery": [
    "Chips",
    "Chocolate",
    "Candy",
    "Gum",
    "Cookies",
    "Crackers",
    "Nuts & Seeds",
  ],

  Bakery: [
    "Bread",
    "Bagels",
    "Muffins",
    "Donuts",
    "Cakes",
    "Pastries",
  ],

  "Dairy & Eggs": [
    "Milk",
    "Cheese",
    "Yogurt",
    "Butter",
    "Cream",
    "Eggs",
  ],

  Produce: [
    "Fruit",
    "Vegetables",
    "Herbs",
  ],

  "Pantry & Grocery": [
    "Rice",
    "Flour",
    "Sugar",
    "Salt",
    "Pasta",
    "Canned Food",
    "Spices",
    "Sauces",
    "Breakfast Foods",
  ],

  "Frozen Foods": [
    "Ice Cream",
    "Frozen Meals",
    "Frozen Pizza",
    "Frozen Vegetables",
    "Frozen Desserts",
  ],

  "Ready-to-Eat": [
    "Sandwiches",
    "Prepared Meals",
    "Hot Food",
    "Salads",
    "Microwave Meals",
  ],

  Alcohol: [
    "Beer - Single",
    "Beer - 4 Pack",
    "Beer - 6 Pack",
    "Beer - 8 Pack",
    "Beer - 12 Pack",
    "Beer - 15 Pack",
    "Beer - 24 Pack",

    "RTD - Single",
    "RTD - 4 Pack",
    "RTD - 6 Pack",
    "RTD - 8 Pack",
    "RTD - 12 Pack",

    "Wine - Bottle",
    "Wine - Multi Pack",

    "Other Alcohol",
  ],

  "Smoke & Vape": [
    "Cigarettes",
    "Cigars",
    "Vape",
    "Other Tobacco",
  ],

  "Smoke Accessories": [
    "Lighters",
    "Rolling Papers",
    "Filters",
    "Rolling Machines",
    "Ashtrays",
    "Other Smoke Accessories",
  ],

  Stationery: [
    "Pens",
    "Pencils",
    "Markers",
    "Notebooks",
    "Paper",
    "Envelopes",
    "Tape",
    "Glue",
    "Scissors",
    "Other Stationery",
  ],

  "Health & Beauty": [
    "Soap",
    "Shampoo",
    "Toothpaste",
    "Skin Care",
    "Hair Care",
    "Cosmetics",
    "Personal Hygiene",
  ],

  Household: [
    "Cleaning Supplies",
    "Laundry",
    "Paper Products",
    "Garbage Bags",
    "Kitchen Supplies",
    "Storage Products",
  ],

  "Pet Supplies": [
    "Pet Food",
    "Pet Treats",
    "Pet Care",
    "Pet Accessories",
  ],

  "Electronics & Accessories": [
    "Batteries",
    "Chargers",
    "Earphones",
    "Phone Accessories",
    "Small Electronics",
  ],

  Seasonal: [
    "Christmas",
    "Halloween",
    "Valentine's Day",
    "Summer",
    "Back to School",
  ],

  Other: [
    "General Merchandise",
    "Uncategorized",
  ],
} as const;

export type ProductDepartment =
  keyof typeof PRODUCT_TAXONOMY;

export type ProductCategory =
  (typeof PRODUCT_TAXONOMY)[ProductDepartment][number];

export const PRODUCT_DEPARTMENTS =
  Object.keys(
    PRODUCT_TAXONOMY,
  ) as ProductDepartment[];

export function getCategoriesForDepartment(
  department: ProductDepartment,
): readonly ProductCategory[] {
  return PRODUCT_TAXONOMY[department];
}