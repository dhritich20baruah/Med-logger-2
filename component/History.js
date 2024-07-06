import React, { useState, useMemo } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Calendar } from "react-native-calendars";
import * as SQLite from "expo-sqlite/legacy";

export default function History({ navigation, route }) {
  const { userID } = route.params;
  const [selected, setSelected] = useState("");
  const [data, setData] = useState({
    diagnosticArr: [],
    pillsArr: [],
    sugarArr: [],
    pressureArr: [],
    visitArr: [],
  });

  const db = SQLite.openDatabase("medlogger.db");

  const marked = useMemo(
    () => ({
      [selected]: {
        selected: true,
        selectedColor: "#800000",
        selectedTextColor: "yellow",
      },
    }),
    [selected]
  );

  const handleDate = (day) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diagnosticReports WHERE user_id = ? AND date = ?",
        [userID, day.split("-").reverse().join("-")],
        (txObj, resultSet) => {
          setData((prevData) => ({
            ...prevData,
            diagnosticArr: resultSet.rows._array,
          }));
        },
        (txObj, error) => console.log(error)
      );

      tx.executeSql(
        "SELECT * FROM medicine_list WHERE user_id = ? AND startDate <= ? AND endDate >= ?",
        [userID, day, day],
        (txObj, resultSet) => {
          setData((prevData) => ({
            ...prevData,
            pillsArr: resultSet.rows._array,
          }));
        },
        (txObj, error) => console.log(error)
      );

      tx.executeSql(
        "SELECT * FROM blood_sugar WHERE user_id = ? AND date = ?",
        [userID, day.split("-").reverse().join("-")],
        (txObj, resultSet) => {
          setData((prevData) => ({
            ...prevData,
            sugarArr: resultSet.rows._array,
          }));
        },
        (txObj, error) => console.log(error)
      );

      tx.executeSql(
        "SELECT * FROM blood_pressure WHERE user_id = ? AND date = ?",
        [userID, day.split("-").reverse().join("-")],
        (txObj, resultSet) => {
          setData((prevData) => ({
            ...prevData,
            pressureArr: resultSet.rows._array,
          }));
        },
        (txObj, error) => console.log(error)
      );

      tx.executeSql(
        "SELECT * FROM doctors_Info WHERE user_id = ? AND nextVisit = ?",
        [userID, day],
        (txObj, resultSet) => {
          setData((prevData) => ({
            ...prevData,
            visitArr: resultSet.rows._array,
          }));
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Select a date</Text>
      <Calendar
        initialDate={new Date().toISOString().split("T")[0]}
        maxDate={new Date().toISOString().split("T")[0]}
        disableAllTouchEventsForDisabledDays={true}
        onDayPress={(day) => {
          setSelected(day.dateString);
          handleDate(day.dateString);
        }}
        markedDates={marked}
      />
      {/* Add more UI components to display the fetched data */}
      <Text style={styles.headerText2}>
        Selected date:{" "}
        <Text style={{ color: "#800000", fontWeight: "bold" }}>
          {selected.split("-").reverse().join("-")}
        </Text>
      </Text>
      <Button
        title="View History"
        onPress={() => {
          navigation.navigate("Day's Activity", { selected, data });
        }}
        color={"#800000"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  headerText: {
    textAlign: "center",
    fontSize: 20,
    margin: 15,
    fontWeight: "bold",
  },
  headerText2: {
    textAlign: "center",
    fontSize: 15,
    margin: 15,
  },
});
