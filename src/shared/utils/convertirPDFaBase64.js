export async function comprimirPDFaBase64(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      console.log("PDF leído");
      console.log("Tamaño base64:", reader.result.length);

      resolve(reader.result);
    };

    reader.onerror = (error) => {
      console.error(error);
      reject(error);
    };

    reader.readAsDataURL(archivo);
  });
}