import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrar
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const LineChartTwoLines = ({ data }) => {
  const chartData = {
    labels: data.labels, // eje X
    datasets: [
      {
        label: data.line1.label,
        data: data.line1.values,
        tension: 0.3,
        borderWidth: 2,
        borderColor: "#34A853", // Instagram
      },
      {
        label: data.line2.label,
        data: data.line2.values,
        tension: 0.3,
        borderWidth: 2,
        borderColor: "#1877F2", // Facebook

      },

    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 👈 clave
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChartTwoLines;