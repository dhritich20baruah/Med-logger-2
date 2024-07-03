import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite/legacy";
import { useNavigation } from "@react-navigation/native";

const db = SQLite.openDatabase("medlogger.db");

export default function AddDoctor({ route }) {
  const navigation = useNavigation();
  const { userID } = route.params;
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [lastVisited, setLastVisited] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [prescription, setPrescription] = useState("");
  const [showLastVisitedPicker, setShowLastVisitedPicker] = useState(false);
  const [showNextVisitPicker, setShowNextVisitPicker] = useState(false);

  const handleDate = (e, selectedDate) => {
    if (selectedDate) {
      const currentDate = selectedDate || date;
      let dateString = selectedDate.toISOString();
      let formattedDate = dateString.slice(0, dateString.indexOf("T"));
      setDate(currentDate);
      setLastVisited(formattedDate);
      setShowLastVisitedPicker(false);
    }
  };

  const handleNextDate = (e, selectedDate) => {
    if (selectedDate) {
      const currentDate = selectedDate || date;
      let dateString = selectedDate.toISOString();
      let formattedDate = dateString.slice(0, dateString.indexOf("T"));
      setDate(currentDate);
      setNextVisit(formattedDate);
      setShowNextVisitPicker(false);
    }
  };

  const validateForm = () => {
    if (!name.trim() || !specialty.trim()) {
      Alert.alert("Validation Error", "Name and Specialty are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO doctors_Info (name, specialty, address, contactNumber, lastVisited, nextVisit, prescription, user_id) values (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            name,
            specialty,
            address,
            contactNumber,
            lastVisited,
            nextVisit,
            prescription,
            userID,
          ],
          (txObj, resultSet) => {
            Alert.alert("Success", "Doctor's information saved successfully!");
            clearForm();
            navigation.goBack(); // Navigate back to the previous screen
          },
          (txObj, error) => {
            console.log("Insert Error:", error);
            Alert.alert(
              "Error",
              "An error occurred while saving the doctor's information."
            );
          }
        );
      });
    }
  };

  const clearForm = () => {
    setName("");
    setSpecialty("");
    setAddress("");
    setContactNumber("");
    setLastVisited("");
    setNextVisit("");
    setPrescription("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Doctor's Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Specialty"
        value={specialty}
        onChangeText={setSpecialty}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />
      <Text style={styles.textStyle}>You last visited on:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowLastVisitedPicker(true)}
      >
        <Text>{lastVisited || "Select Date"}</Text>
      </TouchableOpacity>
      {showLastVisitedPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDate}
        />
      )}
      <Text style={styles.textStyle}>
        Your next visit should be on &#40; You will be reminded a day before
        this date &#41;:
      </Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowNextVisitPicker(true)}
      >
        <Text>{nextVisit || "Select Date"}</Text>
      </TouchableOpacity>
      {showNextVisitPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleNextDate}
        />
      )}
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Notes"
        value={prescription}
        onChangeText={setPrescription}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#800000",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  textStyle: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: "500",
  },
});
