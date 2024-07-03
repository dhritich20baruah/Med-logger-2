import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Share,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import call from "react-native-phone-call";
import * as SQLite from "expo-sqlite/legacy";

const db = SQLite.openDatabase("medlogger.db");

export default function Doctors({ navigation, route }) {
  const { userID } = route.params;
  const [doctorList, setDoctorList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [doctorsDetails, setDoctorsDetails] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
    }, [])
  );

  const fetchDoctors = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM doctors_Info WHERE user_id = ?",
        [userID],
        (txObj, resultSet) => {
          setDoctorList(resultSet.rows._array);
          // console.log(resultSet.rows._array)
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  // MODAL FUNCTION
  const doctorInfo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM doctors_Info WHERE id = ? AND user_id = ?",
        [id, userID],
        (txObj, resultSet) => {
          setDoctorsDetails(resultSet.rows._array);
          setModalVisible(true);
        },
        (txObj, error) => console.log("Error fetching doctor's details:", error)
      );
    });
  };

  //SHARE DETAILS
  const shareDoctorDetails = (name, specialty, contactNumber, address) => {
    const message = `
    Doctor's Name: ${name}
    Specialty: ${specialty}
    Contact Number: ${contactNumber}
    Address: ${address}`;

    Share.share({
      message,
    }).catch((error) => console.log(error));
  };

  //CALL
  const triggerCall = (phoneNo) => {
    const args = {
      number: phoneNo, // String value with the number to call
      prompt: true, // Boolean value to prompt the user or not, default: true
    };

    call(args).catch(console.error);
  };

  //DELETE DOCTOR'S INFORMATION
  const deleteInfo = (doctorId) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM doctors_Info WHERE id = ?",
        [doctorId],
        (txObj, resultSet) => {
          Alert.alert("Success", "Doctor's information deleted successfully!");
          fetchDoctors(); // Refresh the doctor list
          setModalVisible(false); // Close the modal
        },
        (txObj, error) => {
          console.log(error);
          Alert.alert(
            "Error",
            "An error occurred while deleting the doctor's information."
          );
        }
      );
    });
  };

  //EDIT DOCTOR'S INFORMATION
  const editInfo = () => {
    setModalVisible(false);
    navigation.navigate("Edit Doctor Information", {
      userID,
      doctorsDetails,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {doctorList.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.doctorCard}
              onPress={() => doctorInfo(item.id)}
            >
              <FontAwesome
                name="user-doctor"
                size={60}
                color="#3b3b3b"
                style={{ marginHorizontal: 10 }}
              />
              <View style={{ marginHorizontal: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "300" }}>
                  {item.specialty}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <View>
            {doctorsDetails.map((item) => {
              return (
                <View key={item.id} style={{}}>
                  <View style={styles.modalBtns}>
                    <TouchableOpacity
                      style={{ margin: 10 }}
                      onPress={() => deleteInfo(item.id)}
                    >
                      <FontAwesome name="trash-can" size={25} color="#800000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ margin: 10 }} onPress={editInfo}>
                      <FontAwesome
                        name="pen-to-square"
                        size={25}
                        color="#800000"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: "600",
                      color: "#800000",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "400",
                      color: "#800000",
                    }}
                  >
                    {item.specialty}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "400",
                      color: "#800000",
                    }}
                  >
                    {item.contactNumber}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "400",
                      color: "#800000",
                    }}
                  >
                    {item.address}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "400",
                      color: "#800000",
                    }}
                  >
                    {item.prescription}
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginVertical: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => triggerCall(item.contactNumber)}
                    >
                      <FontAwesome
                        name="square-phone"
                        size={40}
                        color="#800000"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        shareDoctorDetails(
                          item.name,
                          item.specialty,
                          item.contactNumber,
                          item.address
                        )
                      }
                    >
                      <FontAwesome
                        name="share-nodes"
                        size={40}
                        color="#800000"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <FontAwesome name="xmark" size={40} color="#800000" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Add Doctor Information", { userID })
        }
        style={styles.floatBtn}
      >
        <Text style={styles.btnText}>Add Doctor</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
  },
  doctorCard: {
    display: "flex",
    flexDirection: "row",
    margin: 10,
    borderWidth: 1,
    borderColor: "#800000",
    padding: 10,
    borderRadius: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    width: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBtns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#800000",
  },
  modalTitle: {
    margin: 5,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#800000",
  },
  modalText: {
    margin: 5,
    textAlign: "center",
    fontSize: 15,
    color: "#800000",
  },
  floatBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#800000",
    position: "absolute",
    borderRadius: 10,
    top: 400,
    right: 30,
    padding: 3,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    padding: 3,
  },
});
