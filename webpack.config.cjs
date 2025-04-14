const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/main.jsx', // Archivo de entrada principal
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js', // Nombre único para el bundle
    publicPath: '/', // Para manejar rutas correctamente en React Router
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/, // Soporte para imágenes
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin(), // Limpia la carpeta dist en cada build
    new HtmlWebpackPlugin({
      template: './index.html', // Archivo base HTML
      inject: true,
    }),
  ],
  devServer: {
    historyApiFallback: true, // Permite manejar rutas en una SPA
    compress: true,
    hot: true,
    port: 4001, // Puerto para el servidor de desarrollo
    proxy: [
      {
        context: [
          '/api',
          '/codigo_recuperacion',
          '/cambiar_clave',
          '/app_obtener_usuarios',
          '/app_obtener_notas',
          '/app_obtener_medios',
          '/app_obtener_categorias',
          '/reporte_descargarpdfwa',
          '/app_obtener_noticias',
          '/app_obtener_noticia',
          '/app_obtener_medios_noticia',
          '/app_obtener_impresiones_plataforma_noticia',
          '/app_obtener_listado_categorias',
          '/app_subir_nota',
          '/app_obtener_noticias_abm',
          '/app_obtener_clientes',
          '/app_obtener_provincias',
          '/app_obtener_municipios',
        ],
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // No extraer comentarios en producción
      }),
    ],
  },
  mode: "development", // Cambiar entre modos
};