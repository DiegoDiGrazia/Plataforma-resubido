import React from 'react';

// Campos de "distribucion_generaciones" (META, X, Youtube, Search).
// valores: { fecha_vencimiento, comentarios, meta_titulo, meta_engagement, x_descripcion,
//            youtube_titulo, youtube_descripcion, youtube_link_video, search_titulo, search_descripcion }
// onChange(campo, valor)
const DistribucionGeneracionFields = ({ valores, onChange }) => {
    const dispacharCampo = (campo) => (e) => onChange(campo, e.target.value);

    return (
        <div className="datosDistribucion">
            <span className="datosDistribucionTitulo">Datos distribución</span>

            <div className="datosDistribucionCampo">
                <label>Fecha vencimiento</label>
                <input
                    type="date"
                    className="form-control"
                    value={valores.fecha_vencimiento || ''}
                    onChange={dispacharCampo('fecha_vencimiento')}
                />
            </div>

            <div className="datosDistribucionCampo">
                <label>Comentarios</label>
                <textarea
                    className="form-control"
                    value={valores.comentarios || ''}
                    onChange={dispacharCampo('comentarios')}
                />
            </div>

            <div className="datosDistribucionPlataforma">META</div>

            <div className="datosDistribucionCampo">
                <label>Titulo</label>
                <input
                    type="text"
                    className="form-control"
                    maxLength={130}
                    value={valores.meta_titulo || ''}
                    onChange={dispacharCampo('meta_titulo')}
                />
                <p className="caracteresRestantes">Carácteres restantes: {130 - (valores.meta_titulo?.length || 0)}</p>
            </div>

            <div className="datosDistribucionCampo">
                <label>Engagement</label>
                <input
                    type="text"
                    className="form-control"
                    maxLength={130}
                    value={valores.meta_engagement || ''}
                    onChange={dispacharCampo('meta_engagement')}
                />
                <p className="caracteresRestantes">Carácteres restantes: {130 - (valores.meta_engagement?.length || 0)}</p>
            </div>

            <div className="datosDistribucionPlataforma">X</div>

            <div className="datosDistribucionCampo">
                <label>Descripción</label>
                <textarea
                    className="form-control"
                    maxLength={280}
                    value={valores.x_descripcion || ''}
                    onChange={dispacharCampo('x_descripcion')}
                />
                <p className="caracteresRestantes">Carácteres restantes: {280 - (valores.x_descripcion?.length || 0)}</p>
            </div>

            <div className="datosDistribucionPlataforma">Youtube</div>

            <div className="datosDistribucionCampo">
                <label>Titulo</label>
                <input
                    type="text"
                    className="form-control"
                    maxLength={40}
                    value={valores.youtube_titulo || ''}
                    onChange={dispacharCampo('youtube_titulo')}
                />
                <p className="caracteresRestantes">Carácteres restantes: {40 - (valores.youtube_titulo?.length || 0)}</p>
            </div>

            <div className="datosDistribucionCampo">
                <label>Descripción</label>
                <textarea
                    className="form-control"
                    maxLength={90}
                    value={valores.youtube_descripcion || ''}
                    onChange={dispacharCampo('youtube_descripcion')}
                />
                <p className="caracteresRestantes">Carácteres restantes: {90 - (valores.youtube_descripcion?.length || 0)}</p>
            </div>

            <div className="datosDistribucionCampo">
                <label>Link al video</label>
                <input
                    type="text"
                    className="form-control"
                    value={valores.youtube_link_video || ''}
                    onChange={dispacharCampo('youtube_link_video')}
                />
            </div>

            <div className="datosDistribucionPlataforma">Search</div>

            <div className="datosDistribucionCampo">
                <label>Titulo</label>
                <textarea
                    className="form-control"
                    value={valores.search_titulo || ''}
                    onChange={dispacharCampo('search_titulo')}
                />
            </div>

            <div className="datosDistribucionCampo">
                <label>Descripción</label>
                <textarea
                    className="form-control"
                    value={valores.search_descripcion || ''}
                    onChange={dispacharCampo('search_descripcion')}
                />
            </div>
        </div>
    );
};

export default DistribucionGeneracionFields;
