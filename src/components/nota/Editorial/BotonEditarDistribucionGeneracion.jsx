import React, { useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { editarDistribucionGeneracion, obtenerDistribucionGeneracion } from '../../Apis/apis';
import DistribucionGeneracionFields from './DistribucionGeneracionFields';

const valoresIniciales = {
    fecha_vencimiento: '',
    comentarios: '',
    meta_titulo: '',
    meta_engagement: '',
    x_descripcion: '',
    youtube_titulo: '',
    youtube_descripcion: '',
    youtube_link_video: '',
    search_titulo: '',
    search_descripcion: '',
};

const BotonEditarDistribucionGeneracion = ({ id_generacion, token }) => {
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [valores, setValores] = useState(valoresIniciales);

    const abrirModal = () => {
        setShowModal(true);
        setError('');
        setCargando(true);
        obtenerDistribucionGeneracion(token, id_generacion)
            .then((datos) => {
                const dato = datos?.[0];
                setValores({
                    fecha_vencimiento: dato?.fecha_vencimiento?.slice(0, 10) || '',
                    comentarios: dato?.comentarios || '',
                    meta_titulo: dato?.meta_titulo || '',
                    meta_engagement: dato?.meta_engagement || '',
                    x_descripcion: dato?.x_descripcion || '',
                    youtube_titulo: dato?.youtube_titulo || '',
                    youtube_descripcion: dato?.youtube_descripcion || '',
                    youtube_link_video: dato?.youtube_link_video || '',
                    search_titulo: dato?.search_titulo || '',
                    search_descripcion: dato?.search_descripcion || '',
                });
            })
            .catch(() => setError('No se pudo cargar la distribución de esta nota.'))
            .finally(() => setCargando(false));
    };

    const handleChange = (campo, valor) => {
        setValores((prev) => ({ ...prev, [campo]: valor }));
    };

    const guardar = async () => {
        setGuardando(true);
        setError('');
        try {
            await editarDistribucionGeneracion(token, id_generacion, valores);
            setShowModal(false);
        } catch {
            setError('No se pudieron guardar los cambios.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <button
                onClick={abrirModal}
                className="p-0 m-2 border-0 bg-transparent"
                title="Editar distribución"
            >
                <i className="bi bi-pencil-square m-2 fs-2"></i>
            </button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Editar distribución</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cargando ? (
                        <div className="text-center">
                            <Spinner animation="border" size="sm" /> Cargando...
                        </div>
                    ) : (
                        <DistribucionGeneracionFields valores={valores} onChange={handleChange} />
                    )}
                    {error && <p className="text-danger mt-2">{error}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={guardar} disabled={guardando || cargando}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BotonEditarDistribucionGeneracion;
