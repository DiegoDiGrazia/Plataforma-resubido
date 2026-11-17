import * as React from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState } from 'react';

const  SliderVertical = ({setPosicion, valor}) => {
  // const [valor, setValor] = useState(50);

  const handleChange = (event, nuevoValor) => {
    setPosicion(nuevoValor);
  };

  return (
    <Box sx={{ width: 300, margin: '50px auto', textAlign: 'center' }}>
      <Typography gutterBottom>Selecciona un número (1 a 100)</Typography>
      <Slider
        value={valor}
        onChange={handleChange}
        min={1}
        max={100}
        step={1}
        valueLabelDisplay="auto"
        color="primary"
      />
      <Typography variant="h6">Valor: {valor}</Typography>
    </Box>
  );
}

export default SliderVertical;