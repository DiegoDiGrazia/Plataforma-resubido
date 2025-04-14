import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCategorias } from '../redux/crearNotaSlice';

const useCategorias = (TOKEN) => {
    const dispatch = useDispatch();
    const categorias = useSelector((state) => state.crearNota.categorias) || [];
    const categoriasPorNombre = useSelector((state) => state.crearNota.categoriasNombres) || [];
    const [categoriasActivas, setCategoriasActivas] = useState([]);

    // Obtener categorías desde la API
    useEffect(() => {
        axios.post(
            "https://panel.serviciosd.com/app_obtener_listado_categorias",
            {
                token: TOKEN,
                dimension: "categorias",
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        .then((response) => {
            if (response.data.status === "true") {
                dispatch(setCategorias(response.data.item));
            } else {
                console.error('Error en la respuesta de la API:', response.data.message);
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud:', error);
        });
    }, [TOKEN, dispatch]);

    // Actualizar categorías activas basadas en nombres
    useEffect(() => {
        if (categoriasPorNombre.length > 0) {
            const cat_activas = categorias.filter((categoria) => categoriasPorNombre.includes(categoria.unidad))
                .map((categoria) => categoria.id);
            setCategoriasActivas(cat_activas);
        }
    }, [categorias, categoriasPorNombre]);

    return { categorias, categoriasActivas, setCategoriasActivas };
};

export default useCategorias;