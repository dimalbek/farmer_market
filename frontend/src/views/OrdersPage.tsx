"use client";

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

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  buyer_id: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const router = useRouter();

  const allref = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");

        if (!token?.access_token) {
          throw new Error("Token is missing or invalid.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, "")}/orders/`,
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
            `Failed to fetch orders: ${response.status} ${response.statusText}`
          );
        }

        const fetchedOrders: Order[] = await response.json();

        if (!Array.isArray(fetchedOrders)) {
          throw new Error("Unexpected response format. Expected an array.");
        }

<<<<<<< HEAD
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
=======
        const sortedOrders = fetchedOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setOrders(sortedOrders);
>>>>>>> 6458e5f9a4f25553e133d922d8c0677e35bd2eba
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on date range
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [startDate, endDate, orders]);

  const handleOrderDetails = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  // Prepare data for analytics
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.total_price,
    0
  );

  const chartData = {
    labels: filteredOrders.map((order) =>
      format(new Date(order.created_at), "MMM dd")
    ),
    datasets: [
      {
        label: "Total Price",
        data: filteredOrders.map((order) => order.total_price),
        borderColor: "#7E57C2",
        backgroundColor: "#7E57C220",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

const handleExport = () => {
  if (allref.current) {
    const element = allref.current;
    const opt = {
      margin:       0,
      filename:     'orders_report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
  }
};



  return (
    <section className="w-full flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-center">Your Orders</h1>
      
      <Button variant="default" size="sm" className="w-full" onClick={handleExport}>Export report</Button>
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
                <CalendarIcon className="mr-2 h-4 w-" />
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
        {filteredOrders.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
                <TypographySmall className="text-gray-600">
                  Total Orders
                </TypographySmall>
                <TypographyH4>{filteredOrders.length}</TypographyH4>
              </div>
              <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
                <TypographySmall className="text-gray-600">
                  Total Revenue
                </TypographySmall>
                <TypographyH4>{totalRevenue} ₸</TypographyH4>
              </div>
            </div>
            <Line data={chartData} options={chartOptions} />
          </>
        ) : (
          <TypographyP>No orders in the selected period.</TypographyP>
        )}
      </div>

      {loading ? (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      ) : error ? (
        <TypographyP className="text-red-500">{error}</TypographyP>
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="w-full max-w-3xl p-4 border border-gray-200 shadow-sm rounded-lg flex justify-between items-start mt-4"
          >
            <div className="flex flex-col">
              <TypographySmall className="text-gray-500">
                Order ID: {order.id}
              </TypographySmall>
              <TypographyP>Total Price: {order.total_price} ₸</TypographyP>
              <TypographyP>Status: {order.status}</TypographyP>
              <TypographySmall>
                Created At: {new Date(order.created_at).toLocaleString()}
              </TypographySmall>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOrderDetails(order.id)}
            >
              View Details
            </Button>
          </div>
        ))
      ) : (
        <TypographyP>No orders available.</TypographyP>
      )}
      </div>
      
    </section>
  );
};

export default OrdersPage;
