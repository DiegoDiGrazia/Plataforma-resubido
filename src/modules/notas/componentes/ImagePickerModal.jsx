import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Spinner } from "react-bootstrap";
import { setContenidoNota } from "@/store/crearNotaSlice";
import SelectorConBuscador from "@/shared/components/form/SelectorConBuscador";
import { obtenerClientes } from "@/api/apisUsuarios";

const BASE_PATH = 'https://noticiasd.com/img/';

/**
 * Galería de imágenes ya subidas por el cliente, para agregar una al cuerpo de la nota.
 * @param onAgregar (item) => void  — recibe el bloque ['parrafo', '<img …>'] para insertarlo donde
 *   corresponda (Crear nota lo inserta debajo del bloque seleccionado). Sin esta prop, lo agrega al final.
 */
export default function ImagePickerModal({ isOpen, onClose, fetchUrl, onAgregar }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [clientes, setClientes] = useState([]);
    const [cliente, setCliente] = useState("");
    const clienteDelusuario = useSelector((state) => state.formulario.cliente);
    const TOKEN = useSelector((state) => state.formulario.token);
    const dispatch = useDispatch();

    useEffect(() => {
        obtenerClientes(TOKEN).then(setClientes);
    }, [TOKEN]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchImages = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.post(
                    fetchUrl,
                    { token: TOKEN, cliente: clienteDelusuario || cliente.name },
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setImages(res.data.item || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [isOpen, fetchUrl, cliente]);

    const handleSelect = (url) => {
        const item = ['parrafo', `<img src=${url}>`];
        if (onAgregar) onAgregar(item);
        else dispatch(setContenidoNota(item));
        onClose();
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg" dialogClassName="imagePickerModal">
            <Modal.Header closeButton>
                <Modal.Title>Seleccione una imagen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!clienteDelusuario && (
                    <div className="mb-3">
                        <SelectorConBuscador
                            title={'Seleccione un cliente'}
                            options={clientes}
                            selectedOption={cliente}
                            onSelect={(c) => setCliente(c)}
                            onClear={() => setCliente('')}
                        />
                    </div>
                )}

                {loading && (
                    <div className="d-flex justify-content-center my-4">
                        <Spinner animation="border" />
                    </div>
                )}
                {error && <p className="nd-text-danger">{error}</p>}

                <div className="imagePickerModal__grilla">
                    {images.map((imagen) => (
                        <button
                            key={imagen.id}
                            type="button"
                            className="imagePickerModal__opcion"
                            onClick={() => handleSelect(BASE_PATH + imagen.img_path)}
                            aria-label={`Agregar imagen ${imagen.id}`}
                        >
                            <img src={BASE_PATH + imagen.img_path} alt="" />
                        </button>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}
