import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  View,
  Alert,
  Modal,
  Button
} from "react-native";
import { Agenda } from "react-native-calendars";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite/legacy";

//DATABASE
const db = SQLite.openDatabase("medlogger.db");

const Pills = ({ navigation, route }) => {
  const { userID, users } = route.params;
  const [timings, setTimings] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [medicineDetails, setMedicineDetails] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchPills();
    }, [])
  );

  const fetchPills = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM medicine_list WHERE user_id = ?",
        [userID],
        (txObj, resultSet) => {
          setMedicineData(resultSet.rows._array);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT breakfast, lunch, dinner FROM userData WHERE id = ?",
        [userID],
        (txObj, resultSet) => {
          setTimings(resultSet.rows._array);
        },
        (txObj, error) => console.log(error)
      );
    });
  }, []);

  // Memoized Item Component
  const MemoizedItem = React.memo(({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => modalInfo(item.id)}>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  ));

  // Function to transform the data
  const transformData = (data) => {
    const items = {};

    data.forEach((entry) => {
      const startDate = new Date(entry.startDate);
      const endDate = new Date(entry.endDate);
      const medicineName = entry.medicineName;
      const medId = entry.id;

      // Loop through each day from startDate to endDate
      for (
        let date = startDate;
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dayOfWeek = date.getDay();
        const dateString = date.toISOString().split("T")[0];

        // Check if the medicine is taken on this day
        if (
          (dayOfWeek === 0 && entry.sunday) ||
          (dayOfWeek === 1 && entry.monday) ||
          (dayOfWeek === 2 && entry.tuesday) ||
          (dayOfWeek === 3 && entry.wednesday) ||
          (dayOfWeek === 4 && entry.thursday) ||
          (dayOfWeek === 5 && entry.friday) ||
          (dayOfWeek === 6 && entry.saturday)
        ) {
          if (!items[dateString]) {
            items[dateString] = [];
          }

          items[dateString].push({ name: medicineName, id: medId });
        }
      }
    });

    return items;
  };

  // Transformed data
  const agendaItems = transformData(medicineData);

  const renderItem = useCallback(
    (item, isFirst) => <MemoizedItem item={item} />,
    []
  );

  const renderEmptyDate = useCallback(
    () => (
      <View style={styles.emptyDate}>
        <Text>No medication for today</Text>
      </View>
    ),
    []
  );

  // MODAL FUNCTION
  const modalInfo = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM medicine_list WHERE id = ? AND user_id = ?",
        [id, userID],
        (txObj, resultSet) => {
          if (resultSet.rows._array.length > 0) {
            const selectedMedicine = resultSet.rows._array[0];
            setMedicineDetails(selectedMedicine);
            setModalVisible(true);
          } else {
            console.log("No medicine found with the given id");
          }
        },
        (txObj, error) => console.log("Error fetching medicine details:", error)
      );
    });
  };

  // DELETE MEDICINE
  const deleteMed = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM medicine_list WHERE id=?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            Alert.alert("Medicine is removed");
            // Update the state by filtering out the deleted medicine
            setMedicineData((prevMedicineData) =>
              prevMedicineData.filter((medicine) => medicine.id !== id)
            );
            // Close the modal
            setModalVisible(false);
          }
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  //EDIT MEDICATION
  const EditMedicine = () => {
    setModalVisible(false);
    navigation.navigate("Edit Medication", {
      userID,
      medicineDetails,
      timings,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        selected={selectedDate}
        items={
          agendaItems[selectedDate]
            ? { [selectedDate]: agendaItems[selectedDate] }
            : {}
        }
        onDayPress={(day) => setSelectedDate(day.dateString)}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        markingType={"dot"}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={{ margin: 10 }}>
              <FontAwesome
                name="trash-can"
                size={25}
                color="#800000"
                onPress={() => deleteMed(medicineDetails.id)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ margin: 10 }} onPress={EditMedicine}>
              <FontAwesome name="pen-to-square" size={25} color="#800000" />
            </TouchableOpacity>
          </View>
          <View>
            {medicineDetails && (
              <View>
                <Text style={styles.modalTitle}>
                  {medicineDetails.medicineName}
                </Text>
                <Text style={styles.modalText}>
                  You need to take this medicine-
                </Text>
                <View>
                  {medicineDetails.BeforeBreakfast ? (
                    <Text style={styles.modalText}>
                      Before Breakfast: {medicineDetails.BeforeBreakfast}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View>
                  {medicineDetails.AfterBreakfast ? (
                    <Text style={styles.modalText}>
                      After Breakfast: {medicineDetails.AfterBreakfast}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View>
                  {medicineDetails.BeforeLunch ? (
                    <Text style={styles.modalText}>
                      Before Lunch: {medicineDetails.BeforeLunch}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View>
                  {medicineDetails.AfterLunch ? (
                    <Text style={styles.modalText}>
                      After Lunch: {medicineDetails.AfterLunch}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View>
                  {medicineDetails.BeforeDinner ? (
                    <Text style={styles.modalText}>
                      Before Dinner: {medicineDetails.BeforeDinner}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
                <View>
                  {medicineDetails.AfterDinner ? (
                    <Text style={styles.modalText}>
                      After Dinner: {medicineDetails.AfterDinner}
                    </Text>
                  ) : (
                    <View></View>
                  )}
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.saveBtnContainer}
          >
            <Text style={styles.saveBtn}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => navigation.navigate("Add Medicine", { userID, timings, users })}
        style={styles.floatBtn}
      >
        <Text style={styles.btnText}>Add Medicine +</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    color: "#888",
    fontSize: 16,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  floatBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#800000",
    position: "absolute",
    borderRadius: 10,
    top: '80%',
    right: 30,
    padding: 3,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    padding: 3,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  title: {
    fontSize: 18,
    margin: 15,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  input: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 18,
    color: "#333",
  },
  inputTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800000",
  },
  saveBtnContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "orange",
  },
  saveBtn: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
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

export default Pills;