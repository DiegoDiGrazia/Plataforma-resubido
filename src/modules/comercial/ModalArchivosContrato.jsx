import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { obtenerArchivosDeContrato } from '@/api/facturasApi.js';
import { cargarArchivo } from '@/api/apisUsuarios';
import { toastExito, toastError } from '@/shared/utils/toastify/toastify.jsx';

const URL_ARCHIVOS = 'https://panel.serviciosd.com/contratos/';

const ModalArchivosContrato = ({ contrato, onHide, token, idUsuario }) => {
    const [archivos, setArchivos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [archivo, setArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const inputRef = useRef(null);

    const cargar = async () => {
        if (!contrato) return;
        setCargando(true);
        try {
            const datos = await obtenerArchivosDeContrato(token, contrato.id);
            setArchivos(Array.isArray(datos) ? datos : []);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        setArchivo(null);
        setArchivos([]);
        cargar();
    }, [contrato?.id]);

    const subir = async () => {
        if (!archivo) return;
        setSubiendo(true);
        try {
            await cargarArchivo(token, idUsuario, archivo, contrato.id);
            setArchivo(null);
            if (inputRef.current) inputRef.current.value = '';
            toastExito('Archivo cargado');
            await cargar();
        } catch (error) {
            console.error(error);
            toastError('No se pudo cargar el archivo');
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <Modal show={!!contrato} onHide={onHide} centered scrollable className="modalContrato">
            <Modal.Header closeButton>
                <Modal.Title className="modalContrato__titulo">
                    Archivos
                    {contrato && <span className="modalContrato__subtitulo">Contrato #{contrato.id}</span>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cargando ? (
                    <div className="modalContrato__vacio"><Spinner animation="border" size="sm" /> Cargando…</div>
                ) : archivos.length === 0 ? (
                    <div className="modalContrato__vacio">Este contrato todavía no tiene archivos.</div>
                ) : (
                    <ul className="modalContrato__lista">
                        {archivos.map((a, i) => (
                            <li key={a.id ?? i} className="modalContrato__item modalContrato__item--archivo">
                                <i className="bi bi-file-earmark-text modalContrato__icono" aria-hidden="true" />
                                <span className="modalContrato__texto">{a.nombre_file || a.archivo}</span>
                                <a
                                    className="btn btn-outline-secondary btn-sm"
                                    href={URL_ARCHIVOS + a.archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="bi bi-box-arrow-up-right" aria-hidden="true" /> Abrir
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal.Body>
            <Modal.Footer className="modalContrato__pie">
                <label className="form-label modalContrato__label" htmlFor="nuevo-archivo-contrato">
                    Cargar archivo
                </label>
                <input
                    ref={inputRef}
                    id="nuevo-archivo-contrato"
                    type="file"
                    className="form-control"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                />
                <Button variant="primary" onClick={subir} disabled={subiendo || !archivo}>
                    <i className="bi bi-upload" aria-hidden="true" /> {subiendo ? 'Cargando…' : 'Cargar archivo'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalArchivosContrato;
