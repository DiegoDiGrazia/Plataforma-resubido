import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TextareaWithCounter = () => {
    const maxCharacters = 130;

    const [engagementText, setEngagementText] = useState("");
    const [bajadaText, setBajadaText] = useState("");

    return (
        <div className='p-0'>
            <p>Engagement</p>
            <textarea
                placeholder='Escribe aqui el engagement'
                className='textAreaComentarios col-auto ms-auto'
                maxLength={maxCharacters}
                value={engagementText}
                onChange={(e) => setEngagementText(e.target.value)}
            ></textarea>
            <p>Carácteres restantes: {maxCharacters - engagementText.length}</p>

            <p>Bajada</p>
            <textarea
                placeholder='Escribe aqui la bajada'
                className='textAreaComentarios col-auto ms-auto'
                maxLength={maxCharacters}
                value={bajadaText}
                onChange={(e) => setBajadaText(e.target.value)}
            ></textarea>
            <p>Carácteres restantes: {maxCharacters - bajadaText.length}</p>
        </div>
    );
};

export default TextareaWithCounter;