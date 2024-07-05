import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Button
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import * as SQLite from "expo-sqlite/legacy";

//DATABASE
const db = SQLite.openDatabase("medlogger.db");

export default function AddMedicine({ navigation, route }) {
  const { userID, timings, users } = route.params;
  const [medicineName, setMedicineName] = useState("");

  let dateString = new Date().toISOString();
  let formattedDate = dateString.slice(0, dateString.indexOf("T"));

  const [date, setDate] = useState(new Date());
  const [durationUnit, setDurationUnit] = useState("Days");
  const [startDate, setStartDate] = useState(formattedDate);
  const [endDate, setEndDate] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [days, setDays] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [timing, setTiming] = useState({
    BeforeBreakfast: false,
    AfterBreakfast: false,
    BeforeLunch: false,
    AfterLunch: false,
    BeforeDinner: false,
    AfterDinner: false,
  });
  const [allSelected, setAllSelected] = useState(false);

  const fetchUser = () => {
    console.log('user data')

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM userData WHERE id = ?",
        [userID],
        (txObj, resultSet) => {
          console.log("users", resultSet.rows._array)
        },
        (txObj, error) => console.log(error)
      );
    });
  }

   // Scroll picker
   const daysWeeksMonths = ["Days", "Weeks", "Months"];
   const NumsArray = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
   const [selectedValue, setSelectedValue] = useState(NumsArray[0]);

   const handleDays = (key) => {
    setDays((prevSelections) => ({
      ...prevSelections,
      [key]: !prevSelections[key],
    }));
  };

  const handleSelectEveryday = () => {
    const newSelections = Object.keys(days).reduce((acc, key) => {
      acc[key] = !allSelected;
      return acc;
    }, {});
    setDays(newSelections);
    setAllSelected(!allSelected);
  };

  const handleTiming = (key) => {
    setTiming((prevSelections) => ({
      ...prevSelections,
      [key]: !prevSelections[key],
    }));
  };

  const toggleShowDate = () => {
    setShowDate(!showDate);
  };

  const handleDate = (e, selectedDate) => {
    const currentDate = selectedDate || date;
    let dateString = selectedDate.toISOString();
    let formattedDate = dateString.slice(0, dateString.indexOf("T"));

    setDate(currentDate);
    setStartDate(formattedDate);
    toggleShowDate();
  };

  const calculateEndDate = (date, duration) => {
    const start = new Date(date);
    let end;

    if (duration.includes("Days")) {
      const days = parseInt(duration.replace("Days", "").trim(), 10);
      end = new Date(start.setDate(start.getDate() + days));
    } else if (duration.includes("Weeks")) {
      const weeks = parseInt(duration.replace("weeks", "").trim(), 10);
      end = new Date(start.setDate(start.getDate() + weeks * 7));
    } else if (duration.includes("Months")) {
      const months = parseInt(duration.replace("month", "").trim(), 10);
      end = new Date(start.setMonth(start.getMonth() + months));
    }
    return formatDate(end);
  };

  const formatDate = (date) => {
    if (!date) {
      console.error("Invalid date passed to formatDate:", date);
      return "";
    }
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const subtractMinutes = (timeStr) => {
    let minutesToSubtract = 30;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setMinutes(date.getMinutes() - minutesToSubtract);
    const newHours = ("0" + date.getHours()).slice(-2);
    const newMinutes = ("0" + date.getMinutes()).slice(-2);
    return `${newHours}:${newMinutes}`;
  };

  const validateForm = () => {
    if (!medicineName.trim()) {
      Alert.alert("Validation Error", "Medicine name is required.");
      return false;
    }

    const isDaySelected = Object.values(days).some((day) => day);
    if (!isDaySelected) {
      Alert.alert("Validation Error", "Please select at least one day.");
      return false;
    }

    const isTimingSelected = Object.values(timing).some((time) => time);
    if (!isTimingSelected) {
      Alert.alert("Validation Error", "Please select at least one timing.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const calculatedEndDate = calculateEndDate(
        date,
        `${selectedValue} ${durationUnit}`
      );
      setEndDate(calculatedEndDate);

      // Adding a small delay to ensure state is updated
      setTimeout(() => {
        console.log(medicineName, startDate, calculatedEndDate);
        db.transaction((tx) => {
          tx.executeSql(
            `INSERT INTO medicine_list (medicineName, startDate, endDate, sunday, monday, tuesday, wednesday, thursday, friday, saturday, BeforeBreakfast, AfterBreakfast, BeforeLunch, AfterLunch, BeforeDinner, AfterDinner, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              medicineName,
              startDate,
              calculatedEndDate,
              days.sunday ? 1 : 0,
              days.monday ? 1 : 0,
              days.tuesday ? 1 : 0,
              days.wednesday ? 1 : 0,
              days.thursday ? 1 : 0,
              days.friday ? 1 : 0,
              days.saturday ? 1 : 0,
              timing.BeforeBreakfast
                ? subtractMinutes(users[0].breakfast)
                : "",
              timing.AfterBreakfast ? users[0].breakfast : "",
              timing.BeforeLunch ? subtractMinutes(users[0].lunch) : "",
              timing.AfterLunch ? users[0].lunch : "",
              timing.BeforeDinner ? subtractMinutes(users[0].dinner) : "",
              timing.AfterDinner ? users[0].dinner : "",
              userID,
            ],
            (txObj, resultSet) => {
              Alert.alert("Medicine Added");
              navigation.goBack();
            },
            (txObj, error) => console.log(error)
          );
        });
      }, 100); // Adding a small delay to ensure state is updated
    }
  };



  return (
    <ScrollView>
      <View style={styles.container}>
        {/* MEDICINE NAME */}
        <Text style={styles.textStyle}>Medication Name:</Text>
        <View>
          <TextInput
            onChangeText={setMedicineName}
            value={medicineName}
            placeholder="Name of the medicine"
            style={styles.inputField}
          />
        </View>

        {/* START DATE */}
        <View>
          <Text style={styles.textStyle}>
            When will you start taking the medicine?
          </Text>
          <TouchableOpacity onPress={toggleShowDate}>
            <Text style={styles.textStyleSecondary}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode={"date"}
              is24Hour={true}
              display="spinner"
              onChange={handleDate}
            />
          )}
        </View>

        {/* DURATION OF MEDICATION */}
        <View>
          <Text style={styles.textStyle}>
            How long will you be taking this medicine?
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <ScrollPicker
              dataSource={NumsArray}
              selectedIndex={0}
              onValueChange={(data, selectedIndex) => {
                setSelectedValue(data);
              }}
              wrapperHeight={180}
              wrapperBackground="#FFFFFF"
              itemHeight={60}
              highlightColor="#d8d8d8"
              highlightBorderWidth={3}
              style={{ width: 100 }}
            />
            <ScrollPicker
              dataSource={daysWeeksMonths}
              selectedIndex={0}
              onValueChange={(data, selectedIndex) => {
                setDurationUnit(data);
              }}
              wrapperHeight={180}
              wrapperBackground="#FFFFFF"
              itemHeight={60}
              highlightColor="#d8d8d8"
              highlightBorderWidth={3}
              style={{ width: 100 }}
            />
          </View>
        </View>

        {/* MEDICATION SCHEDULE */}
        <Text style={styles.textStyle}>How often do you need to take it?</Text>
        <View style={styles.radioAllBtnContainer}>
          <TouchableOpacity
            style={[
              allSelected ? styles.radioAllBtnSelected : styles.radioAllBtn,
            ]}
            onPress={handleSelectEveryday}
          ></TouchableOpacity>
          <Text style={styles.radioAllBtnText}>Every Day</Text>
        </View>
        <Text style={styles.radioText}>Or on certain days.</Text>
        <View style={styles.radioBtnContainer}>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.sunday && styles.selectedDayBtn]}
            onPress={() => handleDays("sunday")}
          >
            <Text style={styles.radioText}>S</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.monday && styles.selectedDayBtn]}
            onPress={() => handleDays("monday")}
          >
            <Text style={styles.radioText}>M</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.tuesday && styles.selectedDayBtn]}
            onPress={() => handleDays("tuesday")}
          >
            <Text style={styles.radioText}>T</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioDayBtn,
              days.wednesday && styles.selectedDayBtn,
            ]}
            onPress={() => handleDays("wednesday")}
          >
            <Text style={styles.radioText}>W</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.thursday && styles.selectedDayBtn]}
            onPress={() => handleDays("thursday")}
          >
            <Text style={styles.radioText}>T</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.friday && styles.selectedDayBtn]}
            onPress={() => handleDays("friday")}
          >
            <Text style={styles.radioText}>F</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioDayBtn, days.saturday && styles.selectedDayBtn]}
            onPress={() => handleDays("saturday")}
          >
            <Text style={styles.radioText}>S</Text>
          </TouchableOpacity>
        </View>

        {/* MEDICATION TIMINGS */}
        <Text style={styles.textStyle}>
          At what time should you be taking the medicines?
        </Text>
        <View>
          {/* Breakfast */}
          <View style={styles.radioBtnContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.BeforeBreakfast && styles.selectedButton,
              ]}
              onPress={() => handleTiming("BeforeBreakfast")}
            >
              <Text style={styles.radioText}>Before Breakfast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.AfterBreakfast && styles.selectedButton,
              ]}
              onPress={() => handleTiming("AfterBreakfast")}
            >
              <Text style={styles.radioText}>After Breakfast</Text>
            </TouchableOpacity>
          </View>
          {/* Lunch */}
          <View style={styles.radioBtnContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.BeforeLunch && styles.selectedButton,
              ]}
              onPress={() => handleTiming("BeforeLunch")}
            >
              <Text style={styles.radioText}>Before Lunch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.AfterLunch && styles.selectedButton,
              ]}
              onPress={() => handleTiming("AfterLunch")}
            >
              <Text style={styles.radioText}>After Lunch</Text>
            </TouchableOpacity>
          </View>
          {/* Dinner */}
          <View style={styles.radioBtnContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.BeforeDinner && styles.selectedButton,
              ]}
              onPress={() => handleTiming("BeforeDinner")}
            >
              <Text style={styles.radioText}>Before Dinner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                timing.AfterDinner && styles.selectedButton,
              ]}
              onPress={() => handleTiming("AfterDinner")}
            >
              <Text style={styles.radioText}>After Dinner</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtnContainer}>
          <Text style={styles.saveBtn}>ADD MEDICINE +</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    justifyContent: "center",
    width: '100%'
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 10,
    margin: 5,
    paddingHorizontal: 20,
    paddingVertical: 5,
    fontSize: 18,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#800000",
    margin: 10,
    textAlign: "center",
  },
  textStyleSecondary: {
    textAlign: "center",
    margin: 5,
    fontSize: 18,
    fontFamily: "sans-serif",
    color: "white",
    backgroundColor: "orange",
    padding: 3,
  },
  radioAllBtnContainer: {
    display: "flex",
    flexDirection: "row",
    margin: 10,
    justifyContent: 'center'
  },
  radioAllBtn: {
    width: 25,
    height: 25,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#800000",
    marginHorizontal: 15,
  },
  radioAllBtnSelected: {
    width: 20,
    height: 20,
    borderRadius: 50,
    marginHorizontal: 15,
    backgroundColor: "orange",
    padding: 1,
    elevation: 20,
  },
  radioAllBtnText: {
    fontSize: 15,
    color: "#800000",
  },
  radioBtnContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  radioButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: "#80000",
    width: '48%',
    marginHorizontal: 3,
    marginVertical: 10,
    elevation: 10,
  },
  selectedButton: {
    backgroundColor: "orange",
    color: "white",
  },
  radioDayBtn: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    color: "#80000",
    marginHorizontal: 3,
    marginVertical: 10,
    elevation: 10,
    height: 45,
  },
  selectedDayBtn: {
    backgroundColor: "orange",
    color: "white",
  },
  radioText: {
    fontSize: 15,
    color: "#800000",
    textAlign: "center",
  },
  saveBtnContainer: {
    margin: 20,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#800000",
    elevation: 25,
  },
  saveBtn: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});