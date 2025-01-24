"use client"
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useSession } from 'next-auth/react';


ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const Page = () => {
  const [data, setData] = useState([]);
  const [completionStats, setCompletionStats] = useState({ completed: 0, notCompleted: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('pie');
  const { data: session } = useSession();
  const authToken = session?.user?.token;

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://todos-api-aeaf.onrender.com/api/v1/todo/getAll', {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        setData(response.data);
        processStats(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, authToken]);

  const processStats = (tasks) => {
    const completed = tasks.filter(task => task.status === true).length;
    const notCompleted = tasks.filter(task => task.status === false).length;
    setCompletionStats({ completed, notCompleted });
  };

  const barChartData = useMemo(() => {
    const statusCounts = data.reduce((acc, task) => {
      const status = task.status ? 'Completed' : 'Not Completed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Number of Tasks',
          data: Object.values(statusCounts),
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  const lineChartData = useMemo(() => ({
    labels: data.map((task) => task.name),
    datasets: [
      {
        label: 'Task Completion Status',
        data: data.map((task) => (task.status === true ? 1 : 0)),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  }), [data]);

  const pieChartData = useMemo(() => ({
    labels: ['Completed', 'Not Completed'],
    datasets: [
      {
        data: [completionStats.completed, completionStats.notCompleted],
        backgroundColor: ['#36A2EB', '#FF5733'],
        hoverBackgroundColor: ['#4A90E2', '#FF7043'],
      },
    ],
  }), [completionStats]);

  if (isLoading) return <div className="text-white text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="bg-[#0A0A0A] min-h-screen p-4 sm:p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Task Statistics</h1>
        
        {/* Mobile Chart Navigation */}
        <div className="block sm:hidden mb-4">
          <div className="flex justify-between space-x-2">
            {['pie', 'bar', 'line'].map((chart) => (
              <button
                key={chart}
                onClick={() => setActiveChart(chart)}
                className={`flex-1 p-2 rounded ${
                  activeChart === chart 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {chart.charAt(0).toUpperCase() + chart.slice(1)} Chart
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Pie Chart */}
          <div className={`
            bg-white shadow-md rounded-lg p-4 
            ${activeChart === 'pie' || 'hidden sm:block'}
          `}>
            <h2 className="text-xl font-semibold mb-4">Task Completion Status</h2>
            <Pie data={pieChartData} />
          </div>
          
          {/* Bar Chart */}
          <div className={`
            bg-white shadow-md rounded-lg p-4 
            ${activeChart === 'bar' || 'hidden sm:block'}
          `}>
            <h2 className="text-xl font-semibold mb-4">Task Count by Status</h2>
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false },
                },
              }} 
            />
          </div>
          
          {/* Line Chart */}
          <div className={`
            sm:col-span-2 bg-white shadow-md rounded-lg p-4 
            ${activeChart === 'line' || 'hidden sm:block'}
          `}>
            <h2 className="text-xl font-semibold mb-4">Task Completion Over Time</h2>
            <Line data={lineChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;