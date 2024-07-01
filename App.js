import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Modal,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite/legacy";
import Dashboard from "./component/Dashboard";

//DATABASE
const db = SQLite.openDatabase("medlogger.db");

function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inch, setInch] = useState("");
  const [heightUnit, setHeightUnit] = useState(false);
  const [weightUnit, setWeightUnit] = useState(false);
  const [breakfast, setBreakfast] = useState(new Date());
  const [lunch, setLunch] = useState(new Date());
  const [dinner, setDinner] = useState(new Date());
  const [visibleBreakfast, setVisibleBreakfast] = useState(false);
  const [visibleLunch, setVisibleLunch] = useState(false);
  const [visibleDinner, setVisibleDinner] = useState(false);

  const toggleWeightUnit = () => {
    setWeightUnit((prevState) => !prevState);
  };

  const toggleHeightUnit = () => {
    setHeightUnit((prevState) => !prevState);
  };

  const onChangeBreakfast = (e, selectedDate) => {
    setBreakfast(selectedDate);
    setVisibleBreakfast(!visibleBreakfast);
  };

  const onChangeLunch = (e, selectedDate) => {
    setLunch(selectedDate);
    setVisibleLunch(!visibleLunch);
  };

  const onChangeDinner = (e, selectedDate) => {
    setDinner(selectedDate);
    setVisibleDinner(!visibleDinner);
  };

  const getFormattedTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS userData (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, weight REAL, height REAL, breakfast TEXT, lunch TEXT, dinner TEXT)"
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM userData",
        null,
        (txObj, resultSet) => {
          setUsers(resultSet.rows._array);
          console.log(resultSet.rows._array);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const image = require("./assets/background.jpg");

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Name is required");
      return;
    }
    if (isNaN(parseInt(age)) || parseInt(age) <= 0) {
      Alert.alert("Age must be a positive number");
      return;
    }
    if (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      Alert.alert("Weight must be a positive number");
      return;
    }
    if (heightUnit) {
      if (isNaN(parseInt(feet)) || parseInt(feet) <= 0) {
        Alert.alert("Feet must be a positive number");
        return;
      }
      if (isNaN(parseInt(inch)) || parseInt(inch) < 0 || parseInt(inch) >= 12) {
        Alert.alert("Inches must be a number between 0 and 11");
        return;
      }
    } else {
      if (isNaN(parseFloat(height)) || parseFloat(height) <= 0) {
        Alert.alert("Height must be a positive number");
        return;
      }
    }

    // Convert units if necessary
    let heightResult = height;
    let weightResult = weight;
    if (heightUnit) {
      const totalInches = parseInt(feet) * 12 + parseInt(inch);
      heightResult = totalInches * 2.54;
    }
    if (weightUnit) {
      weightResult = parseInt(weight) * 0.45;
    }

    //Timings
    let breakfastTime = getFormattedTime(breakfast);
    let lunchTime = getFormattedTime(lunch);
    let dinnerTime = getFormattedTime(dinner);

    console.log(
      name,
      age,
      weightResult,
      heightResult,
      breakfastTime,
      lunchTime,
      dinnerTime
    );

    // Handle form submission
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO userData (name, age, weight, height, breakfast, lunch, dinner) values (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          age,
          weightResult,
          heightResult,
          breakfastTime,
          lunchTime,
          dinnerTime,
        ],
        (txObj, resultSet) => {
          let currentUser = [...users];
          currentUser.push({ id: resultSet.insertId, name: name });
          setUsers(currentUser);
          setName("");
          setAge("");
          setHeight("");
          setFeet("");
          setInch("");
          setWeight("");
          setModalVisible(false);
          Alert.alert("New User Added");
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.content}>
          {users.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Menu", { userID: item.id })}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addButtonContainer}
          >
            <Text style={styles.addButtonText}>Add New User</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <ScrollView>
              <View style={{ flex: 1, padding: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#800000",
                    fontSize: 15,
                  }}
                >
                  ADD NEW USER
                </Text>
                <TextInput
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  style={{
                    marginBottom: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#800000",
                    borderRadius: 10,
                  }}
                />
                <TextInput
                  placeholder="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={{
                    marginBottom: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#800000",
                    borderRadius: 10,
                  }}
                />
                <Text style={{ marginBottom: 5 }}>
                  Weight ({weightUnit ? "lb" : "kg"})
                </Text>
                <TextInput
                  placeholder={`Weight (${weightUnit ? "lb." : "kg."})`}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  style={{
                    marginBottom: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#800000",
                    borderRadius: 10,
                  }}
                />
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={toggleWeightUnit}
                    style={{
                      marginRight: 10,
                      padding: 10,
                      backgroundColor: weightUnit ? "lightgray" : "orange",
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: weightUnit ? "black" : "white" }}>
                      Kg
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={toggleWeightUnit}
                    style={{
                      padding: 10,
                      backgroundColor: weightUnit ? "orange" : "lightgray",
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: weightUnit ? "white" : "black" }}>
                      lb.
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ marginBottom: 5 }}>
                    Height ({heightUnit ? "ft-in" : "cm"})
                  </Text>
                  {heightUnit ? (
                    <View style={{ flexDirection: "row" }}>
                      <TextInput
                        placeholder="Feet"
                        value={feet}
                        onChangeText={setFeet}
                        keyboardType="numeric"
                        style={{
                          marginRight: 10,
                          flex: 1,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: "#800000",
                          borderRadius: 10,
                        }}
                      />
                      <TextInput
                        placeholder="Inches"
                        value={inch}
                        onChangeText={setInch}
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: "#800000",
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  ) : (
                    <TextInput
                      placeholder="Height(cm)"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                      }}
                    />
                  )}
                </View>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={toggleHeightUnit}
                    style={{
                      marginRight: 10,
                      padding: 10,
                      backgroundColor: heightUnit ? "lightgray" : "orange",
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: heightUnit ? "black" : "white" }}>
                      cm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={toggleHeightUnit}
                    style={{
                      padding: 10,
                      backgroundColor: heightUnit ? "orange" : "lightgray",
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: heightUnit ? "white" : "black" }}>
                      ft-in
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.container}>
                  <Text style={styles.title}>
                    Please enter your approximate times for having breakfast,
                    lunch, and dinner for the medicine tracker.
                  </Text>

                  {/* Breakfast */}
                  <TouchableOpacity
                    onPress={() => setVisibleBreakfast(!visibleBreakfast)}
                    style={styles.input}
                  >
                    <Text style={styles.inputText}>Set Breakfast Time</Text>
                    <Text style={styles.inputTime}>
                      {getFormattedTime(breakfast)}
                    </Text>
                  </TouchableOpacity>
                  {visibleBreakfast && (
                    <DateTimePicker
                      value={breakfast}
                      mode={"time"}
                      is24Hour={true}
                      display="default"
                      onChange={onChangeBreakfast}
                    />
                  )}

                  {/* Lunch */}
                  <TouchableOpacity
                    onPress={() => setVisibleLunch(!visibleLunch)}
                    style={styles.input}
                  >
                    <Text style={styles.inputText}>Set Lunch Time</Text>
                    <Text style={styles.inputTime}>
                      {getFormattedTime(lunch)}
                    </Text>
                  </TouchableOpacity>
                  {visibleLunch && (
                    <DateTimePicker
                      value={lunch}
                      mode={"time"}
                      is24Hour={true}
                      display="default"
                      onChange={onChangeLunch}
                    />
                  )}

                  {/* Dinner */}
                  <TouchableOpacity
                    onPress={() => setVisibleDinner(!visibleDinner)}
                    style={styles.input}
                  >
                    <Text style={styles.inputText}>Set Dinner Time</Text>
                    <Text style={styles.inputTime}>
                      {getFormattedTime(dinner)}
                    </Text>
                  </TouchableOpacity>
                  {visibleDinner && (
                    <DateTimePicker
                      value={dinner}
                      mode={"time"}
                      is24Hour={true}
                      display="default"
                      onChange={onChangeDinner}
                    />
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: "orange",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: "800",
                    }}
                  >
                    SUBMIT
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: "red",
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 5,
                  }}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Med Logger"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Med Logger"
          component={HomeScreen}
          options={({ navigation, route }) => ({
            title: "Med Logger",
            headerStyle: {
              backgroundColor: "#800000",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          })}
        />
        <Stack.Screen
          name="Menu"
          component={Dashboard}
          options={() => ({
            headerStyle: {
              backgroundColor: "#800000",
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    width: "90%",
    padding: 20,
  },
  itemContainer: {
    marginVertical: 10,
  },
  itemText: {
    color: "#800000",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    textAlign: "center",
    backgroundColor: "white",
    fontSize: 30,
    fontWeight: "500",
    shadowColor: "black",
    shadowOffset: {
      width: 25,
      height: 25,
    },
    shadowOpacity: 0.85,
    shadowRadius: 25,
    elevation: 55,
  },
  modalView: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.55,
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
  addButtonContainer: {
    margin: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    elevation: 20,
    color: "white",
    fontWeight: "600",
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "darkgreen",
    padding: 10,
    borderRadius: 5,
    shadowColor: "white",
    shadowOffset: {
      width: 15,
      height: 15,
    },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 50,
  },
  title: {
    margin: 5,
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
    color: "#333",
  },
  inputTime: {
    fontWeight: "bold",
    color: "#800000",
  },
  cancelText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
  },
});
