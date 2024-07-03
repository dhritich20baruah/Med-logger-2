import React, { useState } from "react";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";

export default function DailyActivity({ navigation, route }) {
  const { data, selected } = route.params;
  const [diagnosticArr, setDiagnosticArr] = useState(data.diagnosticArr);
  const [pillsArr, setPillsArr] = useState(data.pillsArr);
  const [sugarArr, setSugarArr] = useState(data.sugarArr);
  const [pressureArr, setPressureArr] = useState(data.pressureArr);


  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>
          Your activities on {selected.split("-").reverse().join("-")}
        </Text>
        {/* Medicines */}
        {pillsArr.length == 0 ? (
          <View style={styles.card}>
            <Text style={styles.title2}>
              There is no record of you taking any medicine that day.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title2}>You took the following medicines:</Text>
            {pillsArr.map((pill) => {
              return (
                <View key={pill.id} style={styles.pillContainer}>
                  <Text style={styles.medName}>{pill.medicineName}</Text>
                  <View style={styles.timings}>
                    <View>
                      {pill.BeforeBreakfast ? (
                        <Text style={styles.modalText}>
                          Before Breakfast: {pill.BeforeBreakfast}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                    <View>
                      {pill.AfterBreakfast ? (
                        <Text style={styles.modalText}>
                          After Breakfast: {pill.AfterBreakfast}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                    <View>
                      {pill.BeforeLunch ? (
                        <Text style={styles.modalText}>
                          Before Lunch: {pill.BeforeLunch}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                    <View>
                      {pill.AfterLunch ? (
                        <Text style={styles.modalText}>
                          After Lunch: {pill.AfterLunch}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                    <View>
                      {pill.BeforeDinner ? (
                        <Text style={styles.modalText}>
                          Before Dinner: {pill.BeforeDinner}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                    <View>
                      {pill.AfterDinner ? (
                        <Text style={styles.modalText}>
                          After Dinner: {pill.AfterDinner}
                        </Text>
                      ) : (
                        <View></View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {/* Blood Pressure */}
        {pressureArr.length == 0 ? (
          <View style={styles.card}>
            <Text style={styles.title2}>
              You did not record your blood pressure values.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title2}>
              Your recorded blood pressure readings are:
            </Text>
            {pressureArr.map((values) => {
              return (
                <View key={values.id} style={styles.recordContainer}>
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Systolic</Text>
                  <Text style={styles.recordValue}>
                  {values.systolic}
                  </Text>
                  <Text style={styles.recordValue}>mmHg</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Diastolic</Text>
                  <Text style={styles.recordValue}>
                    {values.diastolic}
                  </Text>
                  <Text style={styles.recordValue}>mmHg</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Pulse</Text>
                  <Text style={styles.recordValue}>
                    {values.pulse}
                  </Text>
                  <Text style={styles.recordValue}>BPM</Text>
                </View>
              </View>
              );
            })}
          </View>
        )}
        {/* Blood Sugar */}
        {sugarArr.length == 0 ? (
          <View style={styles.card}>
            <Text style={styles.title2}>
              You did not record your blood sugar values.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title2}>
              Your recorded blood sugar values are:
            </Text>
            {sugarArr.map((values) => {
              return (
                <View key={values.id} style={styles.sugarContainer}>
                  <Text style={styles.sugartestText}>{values.test_type} :</Text>
                  <Text style={styles.sugarValueText}>
                    {values.sugar_value} mg/dL
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        {/* Diagnostics */}
        {diagnosticArr.length == 0 ? (
          <View></View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title2}>
              Diagnostic reports and prescriptions snapped on that day are:
            </Text>
            {diagnosticArr.map((item) => {
              return (
                <View key={item.id}>
                  <Image source={{ uri: item.uri }} style={styles.image} />
                  <Text style={styles.reportsText}>
                    Advised by:{" "}
                    <Text style={styles.modalText}>{item.doctor}</Text>
                  </Text>
                  <Text style={styles.reportsText}>
                    Notes: <Text style={styles.modalText}>{item.notes}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    margin: 10,
  },
  title2: {
    fontWeight: "600",
    fontSize: 17,
    marginVertical: 10,
    color: "yellow"
  },
  pillContainer: {
    display: "flex",
    flexDirection: "row",
  },
  medName: {
    fontSize: 17,
    width: "30%",
    color: 'white',
    margin: 3
  },
  timings: {
    width: "70%",
    marginHorizontal: 10,
    margin: 3
  },
  modalText: {
    fontSize: 17,
    color: "white",
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#800000",
    borderRadius: 10,
    elevation: 15
  },
  recordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recordItem: {
    flex: 1,
    alignItems: "center",
  },
  recordLabel: {
    color: "#FFFFFF",
    marginBottom: 5,
    fontSize: 17
  },
  recordValue: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  readingsText: {
    fontWeight: "bold",
    color: "#800000",
  },
  sugarContainer: {
    display: "flex",
    flexDirection: "row",
  },
  sugartestText: {
    fontSize: 17,
    marginHorizontal: 10,
    marginVertical: 5,
    width: '50%',
    color: 'white'
  },
  sugarValueText: {
    fontSize: 17,
    marginHorizontal: 10,
    marginVertical: 5,
    color: "white",
    fontWeight: "700",
    width: '50%'
  },
  image: {
    width: "90%",
    height: 400,
    margin: 10,
    objectFit: "contain",
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10
  },
  reportsText: {
    fontSize: 15,
    color: 'yellow',
    marginHorizontal: 5
  }
});
