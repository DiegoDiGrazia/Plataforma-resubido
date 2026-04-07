import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './modal.css'
import GoogleStyleSlider from './GoogleStyleSlider';
import SliderVertical from './SliderVertical';
import { guardar_dato_en_banner_data } from '../../administrador/gestores/apisUsuarios';
import IframeNotaEscalable from '../IframeNotaEscalable';
import SelectorNumerosEnteros from './SelectorNumerosEnteros';

    const BotonModalIframes = ({id_nota, token}) => {

        const [showConfirmModal, setShowConfirmModal] = useState(false);
        const [posicion, setPosicion] = useState(50);
        const [tipo, setTipo] = useState(1);

        const URLIFRAME = `https://builder.ntcias.de/preview.php?id=${id_nota}`;
        useEffect(() => {
            document.querySelectorAll(".banner-iframe").forEach( 
            (i) => i.contentWindow.postMessage({vp: posicion + '%'}, "https://builder.ntcias.de"))
        }, [posicion]);

        const guardarPosicion = async (token, id_nota, posicion) => {
            await guardar_dato_en_banner_data(token, id_nota, `{vp:${posicion}, historiaTipo:${tipo}}`);
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
        </>
    );
};

export default BotonModalIframes
;