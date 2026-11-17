import axios from 'axios';

export const handleFiltroClick_todasLasNotas = (
    id,
    verMas,
    CLIENTE,
    TOKEN,
    navigate,
    categorias,
    verMasCantidadPaginacion,
    verMasUltimo,
    setFiltroSeleccionado,
    setCargandoNotas,
    setTodasLasNotas2,
    setVerMasUltimo,
    fechaDeMañana
) => {
    setFiltroSeleccionado(id);
    setCargandoNotas(true);

    const categoria = categorias[id] || "";
    let desdeLimite = 0;
    let limite = verMasCantidadPaginacion;

    if (verMas) {
        desdeLimite = verMasUltimo * verMasCantidadPaginacion;
        setVerMasUltimo((prev) => prev + 1);
    } else {
        setTodasLasNotas2([]);
        setVerMasUltimo(1);
    }

    axios
        .post(
            "https://panel.serviciosd.com/app_obtener_noticias",
            {
                cliente: CLIENTE,
                desde: "2020-01-01",
                hasta: fechaDeMañana,
                token: TOKEN,
                categoria: categoria,
                limite: limite,
                desde_limite: desdeLimite,
                titulo: "",
                id: "",
            },
            { headers: { "Content-Type": "multipart/form-data" } }
        )
        .then((response) => {
            if (response.data.message === "Token Invalido") {
                navigate("/");
                return;
            }

            if (response.data.status === "true") {
                setTodasLasNotas2((prev) => [...prev, ...response.data.item]);
            } else {
                console.error("Error en la respuesta de la API:", response.data.message);
            }
        })
        .catch((error) => {
            console.error("Error al hacer la solicitud:", error);
        })
        .finally(() => {
            setCargandoNotas(false);
        });
};