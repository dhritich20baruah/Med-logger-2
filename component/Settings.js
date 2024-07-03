import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite/legacy";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { Linking } from "react-native";

//DATABASE
const db = SQLite.openDatabase("medlogger.db");

export default function Settings({ navigation, route }) {
  const { userID } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [users, setUsers] = useState([
    {
      age: "",
      breakfast: "",
      dinner: "",
      height: "",
      id: "",
      lunch: "",
      name: "",
      weight: "",
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM userData WHERE id = ?",
          [userID],
          (txObj, resultSet) => {
            setUsers(resultSet.rows._array);
          },
          (txObj, error) => console.log(error)
        );
      });
    }, [])
  );

  const deleteProfile = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM medicine_list WHERE user_id=?",
        [userID],
        (txObj, resultSet) => {
          console.log("medicine table removed");
        },
        (txObj, error) => console.log(error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM diagnosticReports WHERE user_id=?",
        [userID],
        (txObj, resultSet) => {
          console.log("diagnosticReports table removed");
        },
        (txObj, error) => console.log(error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM blood_pressure WHERE user_id=?",
        [userID],
        (txObj, resultSet) => {
          console.log("blood_pressure table removed");
        },
        (txObj, error) => console.log(error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM blood_sugar WHERE user_id=?",
        [userID],
        (txObj, resultSet) => {
          console.log("blood_sugar table removed");
        },
        (txObj, error) => console.log(error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM doctors_Info WHERE user_id=?",
        [userID],
        (txObj, resultSet) => {
          console.log("doctors_Info table removed");
        },
        (txObj, error) => console.log(error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM userData WHERE id=?",
        [userID],
        (txObj, resultSet) => {
          setDeleteVisible(false);
          navigation.navigate("Med Logger");
          console.log("userData table removed");
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  //Helper function to convert JSON array to CSV
  const convertJSONToCSV = (jsonArray) => {
    if (jsonArray.length === 0) return "";

    const keys = Object.keys(jsonArray[0]);
    const csvRows = [];

    //Add header row
    csvRows.push(keys.join(","));

    //Add data rows
    for (const row of jsonArray) {
      const values = keys.map((key) => {
        const escaped = ("" + row[key]).replace(/"g/, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  const fetchDataAndExport = async (tableName) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${tableName}`,
        [],
        async (txObj, resultSet) => {
          const rows = resultSet.rows._array;

          // Convert rows to CSV
          const csv = convertJSONToCSV(rows);
          // Define the file path
          const fileUri = FileSystem.documentDirectory + `${tableName}.csv`;

          // Write the CSV to the file
          await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
          });

          // Share the file
          await Sharing.shareAsync(fileUri);
          Alert.alert("Success", "Data exported successfully!");
        },
        (txObj, error) => {
          console.error("Error exporting data:", error);
          Alert.alert("Error", "Failed to export data.");
        }
      );
    });
  };

  
  const openExternalURL = () => {
    const url = `https://www.dhritibaruah.in/Medlogger`
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnText}>My Profile</Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => {
            navigation.navigate("Edit Profile", { userID, users });
          }}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => setDeleteVisible(true)}
        >
          <Text style={styles.btnText}>Delete Profile</Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => setExportModalVisible(true)}
        >
          <Text style={styles.btnText}>
            Export Data
          </Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touch}
          onPress={() => {navigation.navigate("Privacy Policy")}}
        >
          <Text style={styles.btnText}>
            Privacy Policy
          </Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.touch}
          onPress={openExternalURL}
        >
          <Text style={styles.btnText}>
            User Manual
          </Text>
          <FontAwesome name="circle-arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={{textAlign: "center", color: 'gray', fontWeight: '600', fontSize: 20, marginTop: 50}}>Version 1.1.0</Text>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {users.map((item) => {
              return (
                <View key={item.id}>
                  <Text style={styles.modalText}>{item.name}</Text>
                  <Text style={styles.modalText}>
                    {item.age} Years | {item.weight} Kgs | {item.height} cms
                  </Text>
                  <Text style={styles.modalText}>
                    Breakfast time: {item.breakfast} hrs
                  </Text>
                  <Text style={styles.modalText}>
                    Lunch time: {item.lunch} hrs
                  </Text>
                  <Text style={styles.modalText}>
                    Dinner time: {item.dinner} hrs
                  </Text>
                </View>
              );
            })}
            <Button
              onPress={() => setModalVisible(false)}
              title="Close"
              color="#800000"
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteVisible}
        onRequestClose={() => {
          setDeleteVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to delete your profile?
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity>
                <Text
                  onPress={deleteProfile}
                  style={{
                    color: "white",
                    backgroundColor: "#800000",
                    margin: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 20,
                  }}
                >
                  YES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text
                  onPress={() => setDeleteVisible(false)}
                  style={{
                    color: "white",
                    backgroundColor: "green",
                    margin: 10,
                    paddingVertical: 5,
                    paddingHorizontal: 20,
                  }}
                >
                  NO
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{borderBottomWidth: 1, borderColor: "#800000", width: '100%', margin: 10}}
              onPress={() => fetchDataAndExport('blood_sugar')}
            >
              <Text style={{color: "#800000", textAlign: 'center', fontSize: 18, padding: 5}}>
                Export Blood Sugar Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{borderBottomWidth: 1, borderColor: "#800000", width: '100%', margin: 10}}
              onPress={() => fetchDataAndExport('blood_pressure')}
            >
              <Text style={{color: "#800000", textAlign: 'center', fontSize: 18, padding: 5}}>
                Export Blood Pressure Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{borderBottomWidth: 1, borderColor: "#800000", width: '100%', margin: 10}}
              onPress={() => fetchDataAndExport('medicine_list')}
            >
              <Text style={{color: "#800000", textAlign: 'center', fontSize: 18, padding: 5}}>
                Export Medicine Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{borderBottomWidth: 1, borderColor: "#800000", width: '100%', margin: 10}}
              onPress={() => fetchDataAndExport('doctors_Info')}
            >
              <Text style={{color: "#800000", textAlign: 'center', fontSize: 18, padding: 5}}>
                Export Doctor's Information
              </Text>
            </TouchableOpacity>
            <Button
              onPress={() => setExportModalVisible(false)}
              title="Close"
              color={"orange"}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  touch: {
    backgroundColor: "#800000",
    margin: 10,
    padding: 10,
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  btnText: {
    fontSize: 20,
    margin: 2,
    color: "white",
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
    padding: 15,
    width: 350,
    alignItems: "center",
    shadowColor: "#800000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    elevation: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
  },
});
