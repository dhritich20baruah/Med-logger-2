import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import * as SQLite from "expo-sqlite/legacy";


//DATABASE
const db = SQLite.openDatabase("medlogger.db");

const Dashboard = ({ navigation, route }) => {
  const [users, setUsers] = useState([
    { id: "", name: "", weight: "", height: "" },
  ]);
  const { userID } = route.params;

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM userData WHERE id = ?",
        [userID],
        (txObj, resultSet) => setUsers(resultSet.rows._array),
        (txObj, error) => console.log(error)
      );
    });
  });

  return (
    <SafeAreaView>
      <Text
        style={{
          color: "#800000",
          fontSize: 15,
          textAlign: "center",
          fontWeight: "bold",
          marginTop: 10,
        }}
      >
        Hello, {users[0].name}
      </Text>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Diagnostic Reports", { userID })
            }
            style={styles.cell}
          >
            <FontAwesome name="x-ray" size={50} color="#800000" />
            <Text style={styles.tileText}>Diagnostic Reports</Text>
            <Text style={styles.tileButton}>RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Pill Tracker", { userID })}
            style={styles.cell}
          >
            <FontAwesome name="pills" size={50} color="#800000" />
            <Text style={styles.tileText}>Pill Tracker</Text>

            <Text style={styles.tileButton}>TRACK</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Blood Pressure", { userID })}
            style={styles.cell}
          >
            <FontAwesome name="heart-pulse" size={50} color="#800000" />
            <Text style={styles.tileText}>Blood Pressure</Text>
            <Text style={styles.tileButton}>RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Blood Sugar", { userID })}
            style={styles.cell}
          >
            <FontAwesome name="droplet" size={50} color="#800000" />
            <Text style={styles.tileText}>Blood Sugar</Text>
            <Text style={styles.tileButton}>RECORD</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Your Doctors", { userID })}
            style={styles.cell}
          >
            <FontAwesome name="user-doctor" size={50} color="#800000" />
            <Text style={styles.tileText}>Your Doctors</Text>
            <Text style={styles.tileButton}>SAVE & VIEW</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("History", { userID })}
            style={styles.cell}
          >
            <FontAwesome name="calendar-days" size={50} color="#800000" />
            <Text style={styles.tileText}>History</Text>
            <Text style={styles.tileButton}>VIEW</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("Med Logger")}
        >
          <FontAwesome
            name="house"
            size={35}
            color="#800000"
            style={styles.footerText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("Settings", { userID })}
        >
          <FontAwesome
            name="gear"
            size={35}
            color="#800000"
            style={styles.footerText}
          />
        </TouchableOpacity>
      </View>
      {/* <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: '50%',
    height: 'auto',
    backgroundColor: "white",
    margin: 5,
    padding: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  tileText: {
    margin: 5,
    color: "#800000",
  },
  tileButton: {
    backgroundColor: "#800000",
    color: "white",
    padding: 5,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 100,
    paddingVertical: 10,
    position: "absolute",
    top: "95%",
    width: "100%",
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    color: "#800000",
    fontSize: 25,
  },
});

export default Dashboard;
