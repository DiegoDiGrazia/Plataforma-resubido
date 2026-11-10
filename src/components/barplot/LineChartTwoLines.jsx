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
import { seriesColors } from "../../styles/tokens";

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
        borderColor: seriesColors.medios,
        backgroundColor: seriesColors.medios,
      },
      {
        label: data.line2.label,
        data: data.line2.values,
        tension: 0.3,
        borderWidth: 2,
        borderColor: seriesColors.redes,
        backgroundColor: seriesColors.redes,

      },
      {
        label: data.line3.label,
        data: data.line3.values,
        tension: 0.3,
        borderWidth: 2,
        borderColor: seriesColors.videos,
        backgroundColor: seriesColors.videos,

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