import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setContenidoNota } from "../../../redux/crearNotaSlice";
import SelectorConBuscador from "../Editorial/SelectorConBuscador";
import { obtenerClientes } from "../../administrador/gestores/apisUsuarios";

export default function ImagePickerModal({ isOpen, onClose, fetchUrl }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [clientes, setClientes] = useState([]);
    const [cliente, setCliente] = useState("");
    const clienteDelusuario =useSelector((state) => state.formulario.cliente);

    const TOKEN = useSelector((state) => state.formulario.token);
    const BasePath = 'https://noticiasd.com/img/';
  
    const dispatch = useDispatch();
    useEffect(() => {
        obtenerClientes(TOKEN).then(setClientes);
    }, [TOKEN]);

    useEffect(() => {
        console.log(clientes)
    }, [clientes]);


    useEffect(() => {
        if (!isOpen) return;

    const fetchImages = async () => {
        setLoading(true);
        setError("");
    try {
        const res = await axios.post(
        fetchUrl,
        {
            token: TOKEN,
            cliente: clienteDelusuario || cliente.name,
        },
        {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }
        );

        setImages(res.data.item);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };
    fetchImages();
  }, [isOpen, fetchUrl, cliente]);

  const handleSelect = (url) => {
    dispatch(setContenidoNota(['parrafo', `<img src=${url}>`]));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">           
    <div className="flex items-center justify-between m-4">
    <h2 className="text-lg font-bold m-0">
        Seleccione una imagen
    <button
        onClick={onClose}
        className="text-xs px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 ml-2 float-right"
        style={{
        padding: "3px",
        fontSize: "15px",
        margin: "auto",
        marginTop: "10px",
        }}
    >
        Cerrar
    </button>
    </h2>
    </div>

    {!clienteDelusuario &&
    <div style={{ margin: '0px 50px'}}>
        <SelectorConBuscador title={'Seleccione un cliente'} options={clientes} selectedOption={cliente} 
                onSelect={(cliente) => setCliente(cliente)} onClear={() => setCliente('')}/>
    </div>
    }

    {loading && <p>Cargando imágenes...</p>}
    {error && <p className="text-red-500">{error}</p>}

    {/* Contenedor de imágenes con altura fija de 600px y scroll */}
    <div className="grid grid-cols-3 gap-5 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {images.map((imagen) => (
        <img
            key={imagen.id}
            src={BasePath + imagen.img_path}
            alt={`img-${imagen.id}`}
            onClick={() => handleSelect(BasePath + imagen.img_path)}
            className="cursor-pointer border rounded hover:opacity-80"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
            />
        ))}
    </div>

    </div>
    </div>



  );
}
