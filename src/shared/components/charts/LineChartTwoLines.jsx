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
import { seriesColors, breakpoints, space } from "@/styles/tokens";

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

  // Celular: más aire entre la leyenda y el gráfico; en los chicos (≤420),
  // leyenda alineada a la izquierda para que los ítems arranquen en el mismo margen.
  const ancho = typeof window !== "undefined" ? window.innerWidth : Infinity;
  const enCelular = ancho <= breakpoints.md;
  const enCelularChico = ancho <= breakpoints.sm;

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 👈 clave
    plugins: {
      legend: {
        position: "top",
        align: enCelularChico ? "start" : "center",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Chart.js no tiene margen bajo la leyenda: se agranda su alto al medirla
  const espacioBajoLeyenda = {
    id: "espacioBajoLeyenda",
    beforeInit(chart) {
      if (!enCelular || !chart.legend) return;
      const fitOriginal = chart.legend.fit;
      chart.legend.fit = function fit() {
        fitOriginal.call(this);
        this.height += space[4];
      };
    },
    // Celular chico: ítems alineados a la izquierda entre sí, pero el bloque
    // centrado. Se achica la caja de la leyenda al ancho del renglón más largo.
    afterLayout(chart) {
      const leyenda = chart.legend;
      if (!enCelularChico || !leyenda?.lineWidths?.length) return;
      const anchoBloque = Math.max(...leyenda.lineWidths);
      const sobrante = leyenda.right - leyenda.left - anchoBloque;
      if (sobrante <= 0) return;
      leyenda.left += sobrante / 2;
      leyenda.right = leyenda.left + anchoBloque;
      leyenda.adjustHitBoxes(); // que el click para ocultar una serie siga cayendo sobre el ítem
    },
  };

  return <Line data={chartData} options={options} plugins={[espacioBajoLeyenda]} />;
};

export default LineChartTwoLines;