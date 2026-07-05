import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import './modal.css'
import GoogleStyleSlider from './GoogleStyleSlider';
import SliderVertical from './SliderVertical';
import { guardar_dato_en_banner_data } from '../../administrador/gestores/apisUsuarios';
import IframeNotaEscalable from '../IframeNotaEscalable';
import SelectorNumerosEnteros from './SelectorNumerosEnteros';
import { obtenerFeedsPorCliente, agregarNotaAFeed, crearFeed } from '@/components/Apis/apis';

    const BotonModalIframes = ({id_nota, token}) => {

        const [showConfirmModal, setShowConfirmModal] = useState(false);
        const [posicion, setPosicion] = useState(50);
        const [tipo, setTipo] = useState(1);

        // Feed
        const id_cliente = useSelector((state) => state.formulario.id_cliente);
        const [showFeedModal, setShowFeedModal] = useState(false);
        const [feeds, setFeeds] = useState([]);
        const [cargandoFeeds, setCargandoFeeds] = useState(false);
        const [feedSeleccionado, setFeedSeleccionado] = useState('');
        const [guardando, setGuardando] = useState(false);
        const [mensajeFeed, setMensajeFeed] = useState('');
        const [nuevoNombreFeed, setNuevoNombreFeed] = useState('');
        const [creandoFeed, setCreandoFeed] = useState(false);

        const URLIFRAME = `https://builder.ntcias.de/preview.php?id=${id_nota}`;
        useEffect(() => {
            document.querySelectorAll(".banner-iframe").forEach(
            (i) => i.contentWindow.postMessage({vp: posicion + '%'}, "https://builder.ntcias.de"))
        }, [posicion]);

        const guardarPosicion = async (token, id_nota, posicion) => {
            await guardar_dato_en_banner_data(token, id_nota, `{vp:${posicion}, historiaTipo:${tipo}}`);
        }

        const handleAbrirFeedModal = () => {
            setMensajeFeed('');
            setFeedSeleccionado('');
            setCargandoFeeds(true);
            setShowFeedModal(true);
            obtenerFeedsPorCliente(token, id_cliente)
                .then(setFeeds)
                .finally(() => setCargandoFeeds(false));
        };

        const handleCrearFeed = () => {
            if (!nuevoNombreFeed.trim()) return;
            setCreandoFeed(true);
            crearFeed(token, id_cliente, nuevoNombreFeed.trim())
                .then((feedCreado) => {
                    setFeeds((prev) => [...prev, feedCreado]);
                    setFeedSeleccionado(String(feedCreado.feed_id));
                    setNuevoNombreFeed('');
                    setMensajeFeed('');
                })
                .catch(() => setMensajeFeed('Error al crear el feed.'))
                .finally(() => setCreandoFeed(false));
        };

        const handleGuardarEnFeed = () => {
            if (!feedSeleccionado) return;
            setGuardando(true);
            agregarNotaAFeed(token, feedSeleccionado, parseInt(id_nota), false, null)
                .then(() => {
                    setMensajeFeed('¡Nota guardada en el feed correctamente!');
                    setFeedSeleccionado('');
                })
                .catch(() => {
                    setMensajeFeed('Error al guardar (la nota puede que ya esté en ese feed).');
                })
                .finally(() => setGuardando(false));
        };

    return (
        <>
            <Button
                onClick={() => setShowConfirmModal(true)}
                variant="none"
                className='btn btn-secondary m-2'
            >
                Ajustar Creativos
            </Button>

            <Button
                onClick={handleAbrirFeedModal}
                variant="none"
                className='btn btn-outline-primary m-2'
                disabled={!id_cliente}
            >
                Guardar en feed
            </Button>

            {/* Modal Ajustar Creativos */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered >
                <Modal.Header closeButton>
                    <Modal.Title>Tamaños banner creativos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-12 mb-3'>
                            <iframe className="banner-iframe" style={{width: '728px', height: '90px'}}  src={URLIFRAME} >
                            </iframe>
                        </div>
                        <div className='col-6'>
                            <iframe className="banner-iframe" style={{width: '300px', height: '600px'}}  src={URLIFRAME} >
                            </iframe>
                        </div>
                        <div className='col-6 p-0'>
                            <div className='row p-0'>
                                <div className='col-12 mb-3 d-flex align-items-center'>
                                    <iframe className="banner-iframe" style={{width: '320px', height: '50px'}}  src={URLIFRAME} >
                                    </iframe>
                                </div>
                                <div className='col-12 mb-3'>
                                    <iframe className="banner-iframe" style={{width: '300px', height: '250px'}}  src={URLIFRAME} >
                                    </iframe>
                                </div>
                                <SliderVertical setPosicion= {setPosicion} valor={posicion}></SliderVertical>
                            </div>

                        </div>
                        <div className='row g-1'>
                        <h2 className='tituloCreativo'>Creativos Historias</h2>
                        <p className='ps-5 pe-5'>
                        <SelectorNumerosEnteros title= 'tipo de historia' start={1} end={2} selectedValue={tipo}
                        onSelect={setTipo} onClear={() => setTipo(1)}/>
                        </p>

                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            tipo 1
                            <IframeNotaEscalable
                            url={`https://reporte.noticiasd.com/creativo/${id_nota}?tipo=1`}
                            width={180}
                            height={320}
                            baseWidth={720}
                            baseHeight={1280}
                            />
                        </div>
                        <div className='col-lg-12 col-xl col-6 m-2 back-white ms-5'>
                            tipo 2
                            <IframeNotaEscalable
                            url={`https://reporte.noticiasd.com/creativo/${id_nota}?tipo=2`}
                            width={180}
                            height={320}
                            baseWidth={720}
                            baseHeight={1280}
                            />
                        </div>

                    </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => {
                        setShowConfirmModal(false);
                        guardarPosicion(token, id_nota, posicion);
                    }}>
                        Ajustar creativo
                    </Button>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Guardar en Feed */}
            <Modal show={showFeedModal} onHide={() => setShowFeedModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Guardar nota en un feed</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cargandoFeeds ? (
                        <p className="text-muted">Cargando feeds...</p>
                    ) : (
                        <>
                            {feeds.length > 0 && (
                                <div className="mb-3">
                                    <label className="form-label">¿En qué feed querés guardar esta nota?</label>
                                    <select
                                        className="form-select"
                                        value={feedSeleccionado}
                                        onChange={(e) => { setFeedSeleccionado(e.target.value); setMensajeFeed(''); }}
                                    >
                                        <option value="">— Seleccioná un feed —</option>
                                        {feeds.map((f) => (
                                            <option key={f.feed_id} value={f.feed_id}>
                                                {f.name} ({f.notes.length} nota{f.notes.length !== 1 ? 's' : ''})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={feeds.length > 0 ? 'border-top pt-3 mt-1' : ''}>
                                <label className="form-label">
                                    {feeds.length === 0 ? 'Este cliente no tiene feeds. Creá uno:' : 'O creá un feed nuevo:'}
                                </label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Nombre del feed"
                                        value={nuevoNombreFeed}
                                        onChange={(e) => setNuevoNombreFeed(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-outline-secondary btn-sm flex-shrink-0"
                                        onClick={handleCrearFeed}
                                        disabled={!nuevoNombreFeed.trim() || creandoFeed}
                                    >
                                        {creandoFeed ? 'Creando...' : 'Crear'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {mensajeFeed && (
                        <p className={`mt-3 small ${mensajeFeed.startsWith('¡') ? 'text-success' : 'text-danger'}`}>
                            {mensajeFeed}
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFeedModal(false)}>
                        Cerrar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleGuardarEnFeed}
                        disabled={!feedSeleccionado || guardando}
                    >
                        {guardando ? 'Guardando...' : 'Guardar en feed'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BotonModalIframes;
