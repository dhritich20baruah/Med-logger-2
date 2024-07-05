import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  ScrollView,
  Alert
} from "react-native";
// import Chart from "./Chart";
import * as SQLite from 'expo-sqlite/legacy'

export default function BloodPressure({ navigation, route }) {
    const { userID } = route.params;
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");
    const [pulse, setPulse] = useState("");
    const [prevReadings, setPrevReadings] = useState([
      {
        date: "01-01-2024",
        systolic: "120",
        diastolic: "70",
        pulse: "60",
      },
    ]);
  
    //DATABASE
    const db = SQLite.openDatabase("medlogger.db");
  
    useEffect(() => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM blood_pressure WHERE user_id = ?",
          [userID],
          (txObj, resultSet) => {
            const readings = resultSet.rows._array.map((item) => ({
              date: item.date,
              systolic: item.systolic,
              diastolic: item.diastolic,
              pulse: item.pulse,
            }));
            // Update the state with the fetched readings
            setPrevReadings(readings);
          },
          (txObj, error) => console.log(error)
        );
      });
    }, []);
  
    const validateForm = () => {
      if (!systolic.trim() || !diastolic.trim() || !pulse.trim()) {
        Alert.alert("Validation Error", "Pressure reading is required.");
        return false;
      }
  
      return true;
    };
  
    const submitPressure = () => {
      if (validateForm()) {
      let dateString = new Date().toISOString();
      let date = dateString
        .slice(0, dateString.indexOf("T"))
        .split("-")
        .reverse()
        .join("-");
  
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO blood_pressure (systolic, diastolic, pulse, user_id, date) values (?, ?, ?, ?, ?)",
          [systolic, diastolic, pulse, userID, date],
          (txObj, resultSet) => {
            let lastReading = [...prevReadings];
            lastReading.push({
              id: resultSet.insertId,
              systolic: systolic,
              diastolic: diastolic,
              pulse: pulse,
              date: date,
            });
            setPrevReadings(lastReading);
            setSystolic("");
            setDiastolic("");
            setPulse("");
          },
          (txObj, error) => console.log(error)
        );
      });
    };
    };
  
    const pressureData = {
      labels: prevReadings.map((item) => item.date).slice(-7),
      datasets: [
        {
          data:
            prevReadings.length >= 7
              ? prevReadings.map((item) => item.systolic).slice(-7)
              : prevReadings.map((item) => item.systolic),
          color: (opacity = 1) => `rgba(255, 200, 0, ${opacity})`, // optional
          strokeWidth: 4, // optional
        },
        {
          data:
            prevReadings.length >= 7
              ? prevReadings.map((item) => item.diastolic).slice(-7)
              : prevReadings.map((item) => item.diastolic),
          color: (opacity = 1) => `rgba(255, 50, 0, ${opacity})`, // optional
          strokeWidth: 4, // optional
        },
      ],
    };
  
    return (
      <ScrollView>
        <RecordCard prevReadings={prevReadings} />
        <AddRecordForm
          systolic={systolic}
          setSystolic={setSystolic}
          diastolic={diastolic}
          setDiastolic={setDiastolic}
          pulse={pulse}
          setPulse={setPulse}
          submitPressure={submitPressure}
        />
        <Text style={{ textAlign: "center", margin: 10, color: "#800000" }}>
          Last Seven Blood Pressure Readings
        </Text>
        {/* <Chart data={pressureData} /> */}
        {/* Blood Pressure Insights */}
        <View style={{marginVertical: 10, backgroundColor: 'white', borderRadius: 10, padding: 10}}>
          <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 21, color: "#800000"}}>Stages of High Blood Pressure</Text>
          <View style={{margin: 10}}>
            <Text style={{fontWeight: '700', fontSize: 18, color: 'green'}}>1. Normal Blood Pressure:</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Systolic: Less than 120 mm Hg</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Diastolic: Less than 80 mm Hg</Text>
          </View>
          <View style={{margin: 10}}>
            <Text style={{fontWeight: '700', fontSize: 18, color: 'blue'}}>2. Elevated Blood Pressure:</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Systolic: 120-129 mm Hg</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Diastolic: Less than 80 mm Hg</Text>
          </View>
          <View style={{margin: 10}}> 
            <Text style={{fontWeight: '700', fontSize: 18, color: '#d5b60a'}}>3. Hypertension Stage 1:</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Systolic: 130-139 mm Hg</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Diastolic: 80-89 mm Hg</Text>
          </View>
          <View style={{margin: 10}}>
            <Text style={{fontWeight: '700', fontSize: 18, color: 'orange'}}>4. Hypertension Stage 2:</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Systolic: 140 mm Hg or higher</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Diastolic: 90 mm Hg or higher</Text>
          </View>
          <View style={{margin: 10}}>
            <Text style={{fontWeight: '700', fontSize: 18, color: 'red'}}>5. Hypertensive Crisis &#91;requires immediate medical attention&#93;:</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Systolic: Higher than 180 mm Hg</Text>
            <Text style={{fontSize: 18, marginHorizontal: 15}}>Diastolic:Higher than 120 mm Hg</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
  
  const RecordCard = ({ prevReadings }) => {
    const [modalVisible, setModalVisible] = useState(false);
  
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Previous Record</Text>
        <View style={styles.recordContainer}>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>Systolic</Text>
            <Text style={styles.recordValue}>
              {prevReadings[prevReadings.length - 1]?.systolic}
            </Text>
            <Text style={styles.recordValue}>mmHg</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>Diastolic</Text>
            <Text style={styles.recordValue}>
              {prevReadings[prevReadings.length - 1]?.diastolic}
            </Text>
            <Text style={styles.recordValue}>mmHg</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordLabel}>Pulse</Text>
            <Text style={styles.recordValue}>
              {prevReadings[prevReadings.length - 1]?.pulse}
            </Text>
            <Text style={styles.recordValue}>BPM</Text>
          </View>
        </View>
        <Button
          title="VIEW HISTORY"
          color="#FFA500"
          onPress={() => setModalVisible(true)}
        />
        <View style={styles.container}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <ScrollView>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Your historical data</Text>
                  <View style={styles.table}>
                    <View style={{ display: "flex", flexDirection: "row" }}>
                      <Text style={styles.tableHeader}>Date</Text>
                      <Text style={styles.tableHeader}>Systolic</Text>
                      <Text style={styles.tableHeader}>Diastolic</Text>
                      <Text style={styles.tableHeader}>Pulse</Text>
                    </View>
                    {prevReadings.map((item, index) => {
                      return (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCell}>{item.date}</Text>
                          <Text style={styles.tableCell}>{item.systolic}</Text>
                          <Text style={styles.tableCell}>{item.diastolic}</Text>
                          <Text style={styles.tableCell}>{item.pulse}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Button
                    onPress={() => setModalVisible(false)}
                    title="Close"
                    color={"orange"}
                  />
                </View>
              </View>
            </ScrollView>
          </Modal>
        </View>
      </View>
    );
  };
  
  const AddRecordForm = ({
    systolic,
    setSystolic,
    diastolic,
    setDiastolic,
    pulse,
    setPulse,
    submitPressure,
  }) => {
    return (
      <View style={styles.form}>
        <Text style={styles.formTitle}>ADD NEW RECORD</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Systolic (mmHg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={systolic}
              onChangeText={setSystolic}
              placeholder="0"
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Diastolic (mmHg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={diastolic}
              onChangeText={setDiastolic}
              placeholder="0"
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Pulse (BPM)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={pulse}
              onChangeText={setPulse}
              placeholder="0"
            />
          </View>
        </View>
        <Button title="ADD" color="#FFA500" onPress={submitPressure} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      margin: 10,
      padding: 10,
      backgroundColor: "#800000",
      borderRadius: 10,
    },
    cardTitle: {
      fontSize: 20,
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: 10,
    },
    recordContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    recordItem: {
      flex: 1,
      alignItems: "center",
    },
    recordLabel: {
      color: "#FFFFFF",
      marginBottom: 5,
    },
    recordValue: {
      color: "#FFFFFF",
      fontSize: 18,
    },
    form: {
      margin: 10,
      padding: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: 10,
    },
    formTitle: {
      fontSize: 20,
      color: "#800000",
      textAlign: "center",
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    inputItem: {
      flex: 1,
      alignItems: "center",
    },
    inputLabel: {
      color: "#800000",
      marginBottom: 5,
    },
    container: {
      flex: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: "#800000",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      width: "80%",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 5,
      width: 350,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 20,
    },
    table: {
      width: 320,
      marginVertical: 10,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableHeader: {
      flex: 1,
      padding: 5,
      fontWeight: "bold",
      textAlign: "center",
    },
    tableCell: {
      flex: 1,
      padding: 3,
      textAlign: "center",
    },
  });
  