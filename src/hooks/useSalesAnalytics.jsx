// src/hooks/useSalesAnalytics.js
import { useEffect, useState } from 'react';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function useSalesAnalytics() {
  const [totalSales, setTotalSales] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState(null);
  const [mostProfitableProduct, setMostProfitableProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sales'), async (snapshot) => {
      let salesMap = {}; // productId -> quantity + profit
      let total = 0;

      for (let docSnap of snapshot.docs) {
        const sale = docSnap.data();
        total += sale.total;

        if (!salesMap[sale.productId]) {
          salesMap[sale.productId] = { quantity: 0, profit: 0 };
        }

        salesMap[sale.productId].quantity += sale.quantity;

        // Fetch product info to compute profit
        const productRef = doc(db, 'products', sale.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const product = productSnap.data();
          const profitPerUnit = product.price - product.costPrice;
          salesMap[sale.productId].profit += profitPerUnit * sale.quantity;
        }
      }

      setTotalSales(total);

      // Get most sold product
      let topSold = Object.entries(salesMap).sort((a, b) => b[1].quantity - a[1].quantity)[0];
      let topProfit = Object.entries(salesMap).sort((a, b) => b[1].profit - a[1].profit)[0];

      if (topSold) {
        const prodSnap = await getDoc(doc(db, 'products', topSold[0]));
        if (prodSnap.exists()) {
          setMostSoldProduct({ id: topSold[0], ...prodSnap.data(), soldQty: topSold[1].quantity });
        }
      }

      if (topProfit) {
        const prodSnap = await getDoc(doc(db, 'products', topProfit[0]));
        if (prodSnap.exists()) {
          setMostProfitableProduct({ id: topProfit[0], ...prodSnap.data(), totalProfit: topProfit[1].profit });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { totalSales, mostSoldProduct, mostProfitableProduct };
}
