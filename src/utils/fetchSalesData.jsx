import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed

const fetchSalesData = async (
  setSalesData,
  setTotalSales,
  setMostSold,
  setMostProfitable
) => {
  try {
    const querySnapshot = await getDocs(collection(db, "sales"));
    const sales = [];
    const salesCountMap = {};
    const totalSalesMap = {};

    let total = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const date = data.createdAt?.toDate?.() || new Date();
      const dateLabel = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      const productName = data.productName || "N/A";
      const quantity = Number(data.quantity || 0);
      const amount = Number(data.amount || 0);

      // Add to main sales list
      sales.push({
        name: productName,
        amount,
        date: dateLabel,
      });

      // Accumulate total
      total += amount;

      // Count product quantities
      salesCountMap[productName] =
        (salesCountMap[productName] || 0) + quantity;

      // Accumulate total amount per product
      totalSalesMap[productName] =
        (totalSalesMap[productName] || 0) + amount;
    });

    // Set chart data
    setSalesData(sales);
    setTotalSales(total.toFixed(2));

    // Find most sold product
    const mostSoldEntry = Object.entries(salesCountMap).sort(
      (a, b) => b[1] - a[1]
    )[0];
    setMostSold(mostSoldEntry ? mostSoldEntry[0] : "N/A");

    // Find most profitable product
    const mostProfitableEntry = Object.entries(totalSalesMap).sort(
      (a, b) => b[1] - a[1]
    )[0];
    setMostProfitable(mostProfitableEntry ? mostProfitableEntry[0] : "N/A");
  } catch (error) {
    console.error("Error fetching sales data:", error);
  }
};

export default fetchSalesData;
