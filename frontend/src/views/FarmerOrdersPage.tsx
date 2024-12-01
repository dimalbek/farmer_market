'use client'
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  TypographyH4,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface Purchase {
  product: Product;
  quantity: number;
  purchase_time: string;
}

const FarmerOrdersPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const router = useRouter();

  const allref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");

        if (!token?.access_token) {
          throw new Error("Token is missing or invalid.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, "")}/orders/farmer/orders`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch purchases: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const fetchedPurchases: Purchase[] = data.purchases || [];

        if (!Array.isArray(fetchedPurchases)) {
          throw new Error("Unexpected response format. Expected an array of purchases.");
        }

        const sortedPurchases = fetchedPurchases.sort(
          (a, b) =>
            new Date(b.purchase_time).getTime() - new Date(a.purchase_time).getTime()
        );
        setPurchases(sortedPurchases);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchase_time);
        return (
          purchaseDate >= startDate &&
          purchaseDate <= new Date(endDate.getTime() + 86400000 - 1)
        ); // Include the end date
      });
      setFilteredPurchases(filtered);
    } else {
      setFilteredPurchases(purchases);
    }
  }, [startDate, endDate, purchases]);

  // Define categories and colors
  const categories = ["Seeds", "Meat", "Equipment", "Dairy", "Vegetables", "Fruits"];
  const categoryColors = {
    "Seeds": "#7E57C2",
    "Meat": "#FF7043",
    "Equipment": "#66BB6A",
    "Dairy": "#26A69A",
    "Vegetables": "#FFA726",
    "Fruits": "#42A5F5",
  };

  // Prepare data for analytics
  const totalRevenue = filteredPurchases.reduce(
    (sum, purchase) => sum + purchase.product.price * purchase.quantity,
    0
  );

  const revenueByDateAndCategory = {};

  filteredPurchases.forEach((purchase) => {
    const dateObj = new Date(purchase.purchase_time);
    const dateStr = format(dateObj, "MMM dd");
    const category = purchase.product.category;
    const revenue = purchase.product.price * purchase.quantity;
    // @ts-ignore
    if (!revenueByDateAndCategory[dateStr]) {
      // @ts-ignore
      revenueByDateAndCategory[dateStr] = { dateObj };
    }
    // @ts-ignore
    if (!revenueByDateAndCategory[dateStr][category]) {
      // @ts-ignore
      revenueByDateAndCategory[dateStr][category] = 0;
    }
    // @ts-ignore
    revenueByDateAndCategory[dateStr][category] += revenue;
  });

  // Get sorted labels (dates)
  const labels = Object.keys(revenueByDateAndCategory).sort(
    (a, b) =>
      // @ts-ignore
      revenueByDateAndCategory[a].dateObj.getTime() -
      // @ts-ignore
      revenueByDateAndCategory[b].dateObj.getTime()
  );

  // Prepare datasets
  const datasets = categories.map((category) => {
    const data = labels.map(
      // @ts-ignore
      (date) => revenueByDateAndCategory[date][category] || 0
    );

    return {
      label: category,
      data: data,
      // @ts-ignore
      borderColor: categoryColors[category],
      // @ts-ignore
      backgroundColor: categoryColors[category] + "20", 
      tension: 0.4,
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Revenue (₸)',
        },
      },
    },
  };

  const handleExport = () => {
    if (allref.current) {
      const element = allref.current;
      const opt = {
        margin: 0,
        filename: 'farmer_orders_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      };
      // New Promise-based usage:
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <section className="w-full flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-center">Farmer Orders</h1>

      <Button variant="default" size="sm" className="w-full" onClick={handleExport}>
        Export report
      </Button>

      <div className="w-full flex flex-col items-center gap-4" ref={allref}>
        <div className="w-full max-w-3xl flex flex-row md:flex-row items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>From:</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>To:</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Analytics */}
        <div className="w-full max-w-3xl bg-background p-6 rounded-md mt-4">
          <h2 className="text-xl font-medium mb-4">Analytics</h2>
          {filteredPurchases.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
                  <TypographySmall className="text-gray-600">
                    Total Purchases
                  </TypographySmall>
                  <TypographyH4>{filteredPurchases.length}</TypographyH4>
                </div>
                <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
                  <TypographySmall className="text-gray-600">
                    Total Revenue
                  </TypographySmall>
                  <TypographyH4>{totalRevenue} ₸</TypographyH4>
                </div>
              </div>
               {/* @ts-ignore */}
              <Line data={chartData} options={chartOptions} />
            </>
          ) : (
            <TypographyP>No purchases in the selected period.</TypographyP>
          )}
        </div>

        {loading ? (
          <Skeleton className="w-full max-w-md h-64 rounded-md" />
        ) : error ? (
          <TypographyP className="text-red-500">{error}</TypographyP>
        ) : filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase, index) => (
            <div
              key={index}
              className="w-full max-w-3xl p-4 border border-gray-200 shadow-sm rounded-lg flex flex-col mt-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <TypographySmall className="text-gray-500">
                    Purchase Time: {new Date(purchase.purchase_time).toLocaleString()}
                  </TypographySmall>
                  <TypographyP>
                    Total Price: {purchase.product.price * purchase.quantity} ₸
                  </TypographyP>
                  <TypographyP>
                    Quantity: {purchase.quantity}
                  </TypographyP>
                </div>
              </div>
              <div className="mt-4">
                <TypographyH4 className="mb-2">Product Details</TypographyH4>
                <div className="border-t border-gray-200 pt-2">
                  <TypographyP>
                    <strong>Name:</strong> {purchase.product.name}
                  </TypographyP>
                  <TypographyP>
                    <strong>Description:</strong> {purchase.product.description}
                  </TypographyP>
                  <TypographyP>
                    <strong>Category:</strong> {purchase.product.category}
                  </TypographyP>
                  <TypographyP>
                    <strong>Price:</strong> {purchase.product.price} ₸
                  </TypographyP>
                </div>
              </div>
            </div>
          ))
        ) : (
          <TypographyP>No purchases available.</TypographyP>
        )}
      </div>
    </section>
  );
};

export default FarmerOrdersPage;
