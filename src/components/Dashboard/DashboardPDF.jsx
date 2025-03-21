import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 10,
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    text: {
        fontSize: 12,
    },
    image: {
        width: 600, // Ajusta el tamaño según sea necesario
        height: 300,
        marginTop: 10,
    }
});

const DashboardPDF = ({ nombreCliente, FiltroActual, periodosActuales, FechaDesde, FechaHasta, BarplotIMG }) => {
    // ✅ Usa useSelector correctamente dentro del cuerpo del componente


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.text}>Cliente: {nombreCliente}</Text>
                    <Text style={styles.text}>Filtro Actual: {FiltroActual}</Text>
                    <Text style={styles.text}>Periodos Actuales: {periodosActuales.join(', ')}</Text>
                    <Text style={styles.text}>Fecha Desde: {FechaDesde}</Text>
                    {BarplotIMG && <Image style={styles.image} src={BarplotIMG} />}
                </View>
            </Page>
        </Document>
    );
};

export default DashboardPDF;
