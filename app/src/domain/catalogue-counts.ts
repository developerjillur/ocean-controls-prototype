import summary from "../data/catalogue-counts.json";

export const catalogueSummary = summary;
export const categoryProductCount = (category: string) =>
  (summary.categoryProducts as Record<string, number>)[category] ?? 0;
export const catalogueCategoryOrder = Object.keys(summary.categoryProducts)
  .filter((category) => !category.includes(" >>> "))
  .sort(
    (a, b) =>
      categoryProductCount(b) - categoryProductCount(a) || a.localeCompare(b),
  );
export const formatCount = (count: number) => count.toLocaleString("en-AU");
export const categoryLabel = (category: string) =>
  ({
    "Modbus-Bacnet-MBus Products": "Modbus, BACnet & M-Bus",
    "Electrical Terminals-Wiring": "Electrical Terminals & Wiring",
  })[category] || category;
