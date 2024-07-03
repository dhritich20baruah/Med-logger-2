import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite/legacy";

const db = SQLite.openDatabase("medlogger.db");

export default function EditDoctor({ route }) {
  const navigation = useNavigation();
  const { userID, doctorsDetails } = route.params;
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState(doctorsDetails[0].name);
  const [specialty, setSpecialty] = useState(doctorsDetails[0].specialty);
  const [address, setAddress] = useState(doctorsDetails[0].address);
  const [contactNumber, setContactNumber] = useState(
    doctorsDetails[0].contactNumber
  );
  const [lastVisited, setLastVisited] = useState(doctorsDetails[0].lastVisited);
  const [nextVisit, setNextVisit] = useState(doctorsDetails[0].nextVisit);
  const [prescription, setPrescription] = useState(
    doctorsDetails[0].prescription
  );
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
          "UPDATE doctors_Info SET name = ?, specialty = ?, address = ?, contactNumber = ?, lastVisited = ?, nextVisit = ?, prescription = ? WHERE user_id = ? AND id = ?",
          [
            name,
            specialty,
            address,
            contactNumber,
            lastVisited,
            nextVisit,
            prescription,
            userID,
            doctorsDetails[0].id
          ],
          (txObj, resultSet) => {
            Alert.alert("Success", "Doctor's information updated successfully!");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Doctor's Information</Text>
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
        <Text>{lastVisited.split("-").reverse().join("-")}</Text>
      </TouchableOpacity>
      {showLastVisitedPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDate}
        />
      )}
      <Text style={styles.textStyle}>Your next visit should be on &#40; You will be reminded a day before this date &#41;:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowNextVisitPicker(true)}
      >
        <Text>{nextVisit.split("-").reverse().join("-")}</Text>
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
    fontWeight: '500'
  }
});
