export async function traerDatosLocalmente(nombreCliente) {
    try {
        const res = await fetch('/mocksData/datosPorCliente2.json');
        const data = await res.json();
        const encontrado = data.clientes.find(c => c.nombre === nombreCliente);
        return encontrado || null;
    } catch (err) {
        console.error('Error al leer clientes.json:', err);
        return null;
    }
}


export async function traerDatosDeNota(id_noti) {
    try {
        const res = await fetch('/mocksData/datosPorId.json?v=' + Date.now());
        const data = await res.json(); 
        const encontrado = data.ids.find(c => c.id_noti === id_noti);
        return encontrado || null;
    } catch (err) {
        console.error('Error al leer clientes.json:', err);
        return null;
    }
}