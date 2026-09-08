import React from 'react';
import { toast } from 'react-toastify';
import './toastify.css'; 

export const toastExito = (mensaje) => {
    toast.success(mensaje, {
        icon: <img src='/images/fabicon2.png' className="logo-nd-toastify" style={{ color: '#FF653B', fontSize: '0.9rem' }}></img>,
        className: 'toast-custom-exito',
        progressClassName: 'toast-progress-brand',
    });
};

export const toastError = (mensaje) => {
    toast.error(mensaje, {
        icon: <img src='/images/fabicon2.png' className="logo-nd-toastify" style={{ fontSize: '0.9rem' }}></img>,
        className: 'toast-custom-error',
    });
};

export const toastInfo = (mensaje) => {
    toast.info(mensaje, {
        icon: <img src='/images/fabicon2.png' className="logo-nd-toastify" style={{ fontSize: '0.9rem' }}></img>,
        className: 'toast-custom-info',
    });
};