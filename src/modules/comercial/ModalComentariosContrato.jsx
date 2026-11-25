import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { obtenerComentariosDeContrato, agregarComentario } from '@/api/facturasApi.js';
import { toastExito, toastError } from '@/shared/utils/toastify/toastify.jsx';

const ModalComentariosContrato = ({ contrato, onHide, token, idUsuario, puedeAgregar = false }) => {
    const [comentarios, setComentarios] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nuevo, setNuevo] = useState('');
    const [guardando, setGuardando] = useState(false);

    const cargar = async () => {
        if (!contrato) return;
        setCargando(true);
        try {
            const datos = await obtenerComentariosDeContrato(token, contrato.id);
            setComentarios(Array.isArray(datos) ? datos : []);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        setNuevo('');
        setComentarios([]);
        cargar();
    }, [contrato?.id]);

    const guardar = async () => {
        const texto = nuevo.trim();
        if (!texto) return;
        setGuardando(true);
        try {
            await agregarComentario(token, idUsuario, texto, contrato.id);
            setNuevo('');
            toastExito('Comentario agregado');
            await cargar();
        } catch (error) {
            console.error(error);
            toastError('No se pudo guardar el comentario');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={!!contrato} onHide={onHide} centered scrollable className="modalContrato">
            <Modal.Header closeButton>
                <Modal.Title className="modalContrato__titulo">
                    Comentarios
                    {contrato && <span className="modalContrato__subtitulo">Contrato #{contrato.id}</span>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cargando ? (
                    <div className="modalContrato__vacio"><Spinner animation="border" size="sm" /> Cargando…</div>
                ) : comentarios.length === 0 ? (
                    <div className="modalContrato__vacio">Este contrato todavía no tiene comentarios.</div>
                ) : (
                    <ul className="modalContrato__lista">
                        {comentarios.map((c, i) => (
                            <li key={c.id ?? i} className="modalContrato__item">
                                <p className="modalContrato__texto">{c.comentario}</p>
                                <span className="modalContrato__meta">
                                    <i className="bi bi-person" aria-hidden="true" /> {c.usuario || 'Sin usuario'}
                                    <i className="bi bi-clock" aria-hidden="true" /> {c.fecha}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal.Body>
            {puedeAgregar && (
                <Modal.Footer className="modalContrato__pie">
                    <label className="form-label modalContrato__label" htmlFor="nuevo-comentario-contrato">
                        Agregar comentario
                    </label>
                    <textarea
                        id="nuevo-comentario-contrato"
                        className="form-control"
                        rows={3}
                        placeholder="Escribí un comentario…"
                        value={nuevo}
                        onChange={(e) => setNuevo(e.target.value)}
                    />
                    <Button variant="primary" onClick={guardar} disabled={guardando || !nuevo.trim()}>
                        {guardando ? 'Guardando…' : 'Agregar comentario'}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default ModalComentariosContrato;
