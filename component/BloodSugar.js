import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert
} from "react-native";
import Chart from "./Chart";
import * as SQLite from "expo-sqlite/legacy";
import { useNavigation } from "@react-navigation/native";
import BloodSugarInfo from "./BloodSugarInfo";

export default function BloodSugar({ route }) {
  const { userID } = route.params;
  const [fasting, setFasting] = useState([
    { date: "01-01-2024", testType: "Fasting", sugarValue: 90 },
  ]);
  const [postprandial, setPostprandial] = useState([
    { date: "01-01-2024", testType: "Postprandial", sugarValue: 100 },
  ]);
  const [random, setRandom] = useState([
    { date: "01-01-2024", testType: "Random", sugarValue: 100 },
  ]);
  const [prevReadings, setPrevReadings] = useState([
    { date: "01-01-2024", testType: "Fasting", sugarValue: 90 },
  ]);
  const [mgDL, setMgDL] = useState(true);
  const [testType, settestType] = useState("");
  const [sugarValue, setSugarValue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
 
  //DATABASE
  const db = SQLite.openDatabase("medlogger.db");

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM blood_sugar WHERE user_id = ?",
        [userID],
        (txObj, resultSet) => {
          const readings = resultSet.rows._array.map((item) => ({
            id: item.id,
            date: item.date,
            testType: item.test_type,
            sugarValue: item.sugar_value,
          }));
          // Update the state with the fetched readings
          if (readings.length !== 0) {
            const fastingSugar = readings.filter(
              (item) => item.testType == "Fasting"
            );
            setFasting(fastingSugar);

            const ppSugar = readings.filter(
              (item) => item.testType == "Postprandial"
            );
            setPostprandial(ppSugar);

            const RandomSugar = readings.filter(
              (item) => item.testType == "Random"
            );
            setRandom(RandomSugar);

            setPrevReadings(readings);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
  }, []);

  const toggleMgDL = () => {
    setMgDL((mgDL) => !mgDL);
  };

  const handleSelect = (option) => {
    settestType(option);
  };

  const validateForm = () => {
    if (sugarValue == 0) {
      Alert.alert("Validation Error", "Please enter valid blood sugar value");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
    // Handle form submission here
    let dateString = new Date().toISOString();
    let date = dateString
      .slice(0, dateString.indexOf("T"))
      .split("-")
      .reverse()
      .join("-");
    let sugar = mgDL ? sugarValue : sugarValue * 18;

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO blood_sugar (date, test_type, sugar_value, user_id) values (?, ?, ?, ?)",
        [date, testType, sugar, userID],
        (txObj, resultSet) => {
          if (testType == "Fasting") {
            let lastReading = [...fasting];
            lastReading.push({
              id: resultSet.insertId,
              testType: testType,
              sugarValue: sugarValue,
              date: date,
            });
            setFasting(lastReading);
          }
          if (testType == "Postprandial") {
            let lastReading = [...postprandial];
            lastReading.push({
              id: resultSet.insertId,
              testType: testType,
              sugarValue: sugarValue,
              date: date,
            });
            setPostprandial(lastReading);
          }
          if (testType == "Random") {
            let lastReading = [...random];
            lastReading.push({
              id: resultSet.insertId,
              testType: testType,
              sugarValue: sugarValue,
              date: date,
            });
            setRandom(lastReading);
          }
          setSugarValue("");
        },
        (txObj, error) => console.log(error)
      );
    });
  };
  };

   // CHART DATA
  
  const fbsData = {
    labels: fasting.map((item) => item.date).slice(-7),
    datasets: [
      {
        data:
          fasting.length >= 7
            ? fasting.map((item) => item.sugarValue).slice(-7)
            : fasting.map((item) => item.sugarValue),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  const pbsData = {
    labels: postprandial.map((item) => item.date).slice(-7),
    datasets: [
      {
        data:
          postprandial.length >= 7
            ? postprandial.map((item) => item.sugarValue).slice(-7)
            : postprandial.map((item) => item.sugarValue),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  const rbsData = {
    labels: random.map((item) => item.date).slice(-7),
    datasets: [
      {
        data:
          random.length >= 7
            ? random.map((item) => item.sugarValue).slice(-7)
            : random.map((item) => item.sugarValue),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };

  const [graphType, setGraphType] = useState("Fasting");
  const [graphData, setGraphData] = useState(fbsData)

  const handleGraph = (option, option2) => {
    setGraphType(option);
    setGraphData(option2)
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Previous record */}
        <View style={styles.recordContainer}>
          <Text style={styles.heading}>Previous Records</Text>
          <View style={styles.lastRecord}>
            <View style={styles.recordItem}>
              <Text style={styles.label}>Fasting</Text>
              <Text style={styles.value}>
                {mgDL && fasting.length > 0
                  ? fasting[fasting.length - 1].sugarValue
                  : fasting.length > 0
                  ? (fasting[fasting.length - 1].sugarValue * 0.05).toFixed(2)
                  : "N/A"}
              </Text>
              <Text style={styles.unit}>{!mgDL ? "(mmol/L)" : "(mg/dL)"}</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.label}>Postprandial (PP)</Text>
              <Text style={styles.value}>
                {mgDL && postprandial.length > 0
                  ? postprandial[postprandial.length - 1].sugarValue
                  : postprandial.length > 0
                  ? (
                      postprandial[postprandial.length - 1].sugarValue * 0.05
                    ).toFixed(2)
                  : "N/A"}
              </Text>
              <Text style={styles.unit}>{!mgDL ? "(mmol/L)" : "(mg/dL)"}</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={styles.label}>Random</Text>
              <Text style={styles.value}>
                {mgDL && random.length > 0
                  ? random[random.length - 1].sugarValue
                  : random.length > 0
                  ? (random[random.length - 1].sugarValue * 0.05).toFixed(2)
                  : "N/A"}
              </Text>
              <Text style={styles.unit}>{!mgDL ? "(mmol/L)" : "(mg/dL)"}</Text>
            </View>
          </View>
          <Button
            title="VIEW HISTORY"
            onPress={() => setModalVisible(true)}
            color="#FFA500"
          />

          {/* Modal */}
          <View style={{ flex: 1 }}>
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
                        <Text style={styles.tableHeader}>Test Type</Text>
                        <Text style={styles.tableHeader}>Sugar</Text>
                      </View>
                      {prevReadings.map((item, index) => {
                        return (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.date}</Text>
                            <Text style={styles.tableCell}>
                              {item.testType}
                            </Text>
                            <Text style={styles.tableCell}>
                              {item.sugarValue}
                            </Text>
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
        {/* New Record Form */}
        <View
          style={{
            paddingVertical: 10,
            backgroundColor: "white",
            elevation: 5,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: "#800000",
              fontSize: 20,
              margin: 10,
            }}
          >
            ADD NEW RECORD
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginBottom: 10,
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={toggleMgDL}
              style={{
                marginRight: 10,
                padding: 10,
                backgroundColor: mgDL ? "orange" : "lightgray",
                borderRadius: 5,
              }}
            >
              <Text style={{ color: mgDL ? "white" : "black" }}>mg/dL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleMgDL}
              style={{
                padding: 10,
                backgroundColor: !mgDL ? "orange" : "lightgray",
                borderRadius: 5,
              }}
            >
              <Text style={{ color: !mgDL ? "white" : "black" }}>mmol/l</Text>
            </TouchableOpacity>
          </View>

          {/* Radio buttons */}
          <View style={styles.container}>
            <Text
              style={{
                fontSize: 18,
                color: "#800000",
                margin: 15,
                textAlign: "center",
              }}
            >
              Select test type:
            </Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  testType === "Fasting" && styles.selectedButton,
                ]}
                onPress={() => handleSelect("Fasting")}
              >
                <Text style={styles.radioText}>Fasting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  testType === "Postprandial" && styles.selectedButton,
                ]}
                onPress={() => handleSelect("Postprandial")}
              >
                <Text style={styles.radioText}>Postprandial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  testType === "Random" && styles.selectedButton,
                ]}
                onPress={() => handleSelect("Random")}
              >
                <Text style={styles.radioText}>Random</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.testTypeText}>Selected option: {testType}</Text>
            {testType && (
              <View style={styles.addView}>
                <TextInput
                  style={styles.addInput}
                  keyboardType="numeric"
                  value={sugarValue.toString()}
                  onChangeText={setSugarValue}
                />
                <Text style={styles.unit2}>
                  {!mgDL ? "(mmol/L)" : "(mg/dL)"}
                </Text>
                <Button title="ADD" onPress={handleSubmit} color="orange" />
              </View>
            )}
          </View>
        </View>

        {/* CHARTS */}
        {/* Radio buttons */}
        <View style={styles.container}>
            <Text style={{ fontSize: 18, color: "#800000", margin: 15, textAlign: 'center' }}>
              Select which graph you want to view:
            </Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  graphType === "Fasting" && styles.selectedButton,
                ]}
                onPress={() => handleGraph("Fasting", fbsData)}
              >
                <Text style={styles.radioText}>Fasting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  graphType === "Postprandial" && styles.selectedButton,
                ]}
                onPress={() => handleGraph("Postprandial", pbsData)}
              >
                <Text style={styles.radioText}>Postprandial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  graphType === "Random" && styles.selectedButton,
                ]}
                onPress={() => handleGraph("Random", rbsData)}
              >
                <Text style={styles.radioText}>Random</Text>
              </TouchableOpacity>
            </View>
          </View>
        <View style={{ marginVertical: 10 }}>
          <Text style={{ textAlign: "center", color: "#800000", fontSize: 15 }}>
            Last Seven <Text style={{fontWeight: 'bold'}}>{graphType}</Text> Blood Sugar Readings
          </Text>
          <Chart data={graphData}/>
        </View>
        <BloodSugarInfo/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  recordContainer: {
    backgroundColor: "#800000",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 10,
  },
  lastRecord: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    color: "white",
  },
  recordItem: {
    alignItems: "center",
  },
  label: {
    color: "white",
    marginBottom: 5,
    fontSize: 18,
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    color: "white",
    marginBottom: 5,
  },
  unit: {
    color: "white",
  },
  unit2: {
    color: "#800000",
    margin: 10,
  },
  radioContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  radioButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#80000",
  },
  selectedButton: {
    backgroundColor: "orange",
    color: "white",
  },
  radioText: {
    fontSize: 16,
    color: "#000",
  },
  testTypeText: {
    margin: 20,
    fontSize: 18,
    color: "#800000",
    fontWeight: "600",
    textAlign: "center",
  },
  addInput: {
    height: 50,
    width: 50,
    borderBottomWidth: 2,
    borderBottomColor: "#800000",
    fontSize: 20,
  },
  addView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    margin: 10,
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
  floatBtn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "absolute",
    borderRadius: 10,
    top: 650,
    right: 30,
    padding: 3,
 
  },
  btnText: {
    color: "#800000",
    fontSize: 12,
    padding: 3,
  },
});

