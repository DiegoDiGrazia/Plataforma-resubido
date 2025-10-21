import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './modal.css'
import GoogleStyleSlider from './GoogleStyleSlider';
import SliderVertical from './SliderVertical';

const BotonModalIframes = () => {

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [posicion, setPosicion] = useState(50);
    useEffect(() => {
        document.querySelectorAll(".banner-iframe").forEach( 
        (i) => i.contentWindow.postMessage({vp: posicion + '%'}, "https://builder.ntcias.de"))
    }, [posicion]);

    return (
        <>
            <Button
                onClick={() => setShowConfirmModal(true)}
                id="botonPublicar"
                variant="none"
            >
                Ajustar tamaño de imagenes
            </Button>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered >
                <Modal.Header closeButton>
                    <Modal.Title>Tamaños banner creativos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-12 mb-3'>
                            <iframe className="banner-iframe" style={{width: '728px', height: '90px'}}  src="https://builder.ntcias.de/preview.php?id_noti=1272766" >
                            </iframe>
                        </div>
                        <div className='col-6'>
                            <iframe className="banner-iframe" style={{width: '300px', height: '600px'}}  src="https://builder.ntcias.de/preview.php?id_noti=1272766" >
                            </iframe>
                        </div>
                        <div className='col-6 p-0'>
                            <div className='row p-0'> 
                                <div className='col-12 mb-3 d-flex align-items-center'>
                                    <iframe className="banner-iframe" style={{width: '320px', height: '50px'}}  src="https://builder.ntcias.de/preview.php?id_noti=1272766" >
                                    </iframe>
                                </div>
                                <div className='col-12 mb-3'>
                                    <iframe className="banner-iframe" style={{width: '300px', height: '250px'}}  src="https://builder.ntcias.de/preview.php?id_noti=1272766" >
                                    </iframe>
                                </div>
                                <SliderVertical setPosicion= {setPosicion} valor={posicion}></SliderVertical>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setShowConfirmModal(false);
                    }}>
                        Confirmar ajustado de imagenes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BotonModalIframes
;