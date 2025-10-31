import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './modal.css'
import GoogleStyleSlider from './GoogleStyleSlider';
import SliderVertical from './SliderVertical';
import { guardar_posicion_iframes } from '../../administrador/gestores/apisUsuarios';

    const BotonModalIframes = ({id_nota, token}) => {

        const [showConfirmModal, setShowConfirmModal] = useState(false);
        const [posicion, setPosicion] = useState(50);
        const URLIFRAME = `https://builder.ntcias.de/preview.php?id=${id_nota}`;
        useEffect(() => {
            document.querySelectorAll(".banner-iframe").forEach( 
            (i) => i.contentWindow.postMessage({vp: posicion + '%'}, "https://builder.ntcias.de"))
        }, [posicion]);

        const guardarPosicion = async (token, id_nota, posicion) => {
            await guardar_posicion_iframes(token, id_nota, `{vp:${posicion}}`);
        }

    return (
        <>
            <Button
                onClick={() => setShowConfirmModal(true)}
                variant="none"
                className='btn btn-secondary m-2'
            >
                Ajustar Creativos
            </Button>

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
        </>
    );
};

export default BotonModalIframes
;