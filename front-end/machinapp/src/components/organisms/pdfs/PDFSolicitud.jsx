import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { axiosCliente } from "../../../index.js";
import { useTranslation } from "react-i18next";


const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subTitle: {
    fontSize: 10,
    textAlign: 'right',
    color: '#4a4a4a',
  },
  applicantInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a1b9a',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
  },
  infoInput: {
    flex: 1,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 2,
  },
  prioritySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 5,
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 5,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4a4a4a',
  },
  textBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 5,
    marginTop: 5,
    fontSize: 10,
    minHeight: 40,
  },
  costSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  costLabel: {
    fontSize: 10,
    marginRight: 5,
  },
  costInput: {
    borderWidth: 1,
    borderColor: '#000000',
    width: 100,
    padding: 2,
    fontSize: 10,
  },
  sectionContainer: {
    marginBottom: 15,
  },

  sectionUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    width: '100%',
    marginBottom: 10,
  },
  inputBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    minHeight: 60,
  },
  inputText: {
    fontSize: 10,
    color: '#4a4a4a',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderColor: '#4CAF50',
    borderWidth: 1,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    height: 30,
    textAlign: 'center',
    fontStyle: 'bold',
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    fontStyle: 'normal',
    color: '#000',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    padding: 5,
    borderRightColor: '#e0e0e0',
    borderRightWidth: 1,
  },
  tableCellHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    padding: 5,
    color: 'white',
    borderRightColor: 'white',
    borderRightWidth: 1,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  oddRow: {
    backgroundColor: '#f2f2f2',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
});

const TableHeader = () => (
  <View style={styles.tableHeader} fixed>
    <Text style={styles.tableCellHeader}>Equipo</Text>
    <Text style={styles.tableCellHeader}>Descripción de la Actividad</Text>
    <Text style={[styles.tableCellHeader, styles.lastCell]}>Nombre de la actividad</Text>
  </View>
);

// eslint-disable-next-line react/prop-types
const TableRow = ({ item, index }) => (
  <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]} wrap={false}>
    {/* eslint-disable-next-line react/prop-types */}
    <Text style={styles.tableCell}>{item.equipo}</Text>
    {/* eslint-disable-next-line react/prop-types */}
    <Text style={styles.tableCell}>{item.descripcion}</Text>
    {/* eslint-disable-next-line react/prop-types */}
    <Text style={[styles.tableCell, styles.lastCell]}>{item.actividad}</Text>
  </View>
);


// eslint-disable-next-line react/prop-types
export const PDFSolicitud = ({idSolicitud}) => {
  const [data, setData] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosCliente.get('solicitud/PDF');
        const filteredData = response.data.find(item => item.idSolicitud === idSolicitud);
        setData(filteredData || {});
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, [idSolicitud]);

  if (!data) {
    return null;
  }

  const actividades = data.acti_nombres ? data.acti_nombres.split(', ') : [];
  const descripciones = data.acti_descripciones ? data.acti_descripciones.split(', ') : [];
  const tableData = actividades.map((actividad, index) => ({
    equipo: data.fi_placa_sena || '',
    actividad,
    descripcion: descripciones[index] || '',
  }));
  const renderSection = (title, content) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionUnderline} />
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>{content}</Text>
      </View>
    </View>
  );

  return(
<Document>
      <Page size="A4" style={styles.page}>
      <View style={styles.header}>
          <Image style={styles.logo} src="/logoSenaNaranja.png" />
          <Text style={styles.title}>SOLICITUD Y SERVICIO DE MANTENIMIENTO</Text>
          <Text style={styles.subTitle}>Centro de gestión y desarrollo {'\n'}sostenible surColombiano</Text>
        </View>

        <View style={styles.applicantInfo}>
          <Text style={styles.infoTitle}>{t("applicant_information")}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("name_of_applicant")}:</Text>
            <Text style={styles.infoInput}>{data.nombre_solicitante}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("applicants_email")}:</Text>
            <Text style={styles.infoInput}>{data.correo_solicitante}</Text>
          </View>
        </View>

        <View style={styles.prioritySection}>
        <Text style={styles.sectionTitle}>{t("Priority")}</Text>
          <View style={styles.priorityItem}>
            <View style={[styles.checkbox, data.soli_prioridad === 'inmediata' && { backgroundColor: 'black' }]} />
            <Text style={styles.priorityText}>Immediate</Text>
          </View>
          <View style={styles.priorityItem}>
            <View style={[styles.checkbox, data.soli_prioridad === 'urgente' && { backgroundColor: 'black' }]} />
            <Text style={styles.priorityText}>Urgent</Text>
          </View>
          <View style={styles.priorityItem}>
            <View style={[styles.checkbox, data.soli_prioridad === 'normal' && { backgroundColor: 'black' }]} />
            <Text style={styles.priorityText}>Normal</Text>
          </View>
        </View>

        {renderSection(t("Description_of_the_Request"), data.soli_descripcion_problemas)}
        {renderSection(t("Legal_Part"), data.temas_legal)}
        {renderSection(t("Observations"), data.soli_observaciones)}

        <View style={styles.costSection}>
          <Text style={styles.costLabel}>{t("cost")} $</Text>
          <View style={styles.costInput}>
            <Text>{data.soli_costo_estimado || ''}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <TableHeader />
          {tableData.map((item, index) => (
            <TableRow key={index} item={item} index={index} />
          ))}
        </View>
      </Page>
    </Document>
  );
};
