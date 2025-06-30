export async function comprimirPDFaBase64(archivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); 
      reader.onload = () => {
        const base64 = reader.result;
        resolve(base64);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsDataURL(archivo); 
    });
  }