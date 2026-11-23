import React from 'react';
import { toast } from 'react-toastify';
import './toastify.css'; 

export const toastExito = (mensaje) => {
    toast.success(mensaje, {
        icon: <img src='/images/fabicon2.png' className="logo-nd-toastify"></img>,
        className: 'toast-custom-exito',
        progressClassName: 'toast-progress-brand',
    });
};

export const toastError = (mensaje) => {
    toast.error(mensaje, {
        icon: <img src='/images/fabicon2.png' className="logo-nd-toastify"></img>,
        className: 'toast-custom-error',
    });
};

