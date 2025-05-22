export async function traerDatosLocalmente(nombreCliente) {
    try {
        const res = await fetch('/mocksData/datosPorCliente.json');
        const data = await res.json();
        const encontrado = data.clientes.find(c => c.nombre === nombreCliente);
        return encontrado || null;
    } catch (err) {
        console.error('Error al leer clientes.json:', err);
        return null;
    }
}