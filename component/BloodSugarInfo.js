import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const BloodSugarInfo = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Basic Information on Blood Sugar Tests</Text>
      
      <Text style={styles.subtitle}>1. Fasting Blood Sugar Test (FBS)</Text>
      <Text style={styles.text}>
        Description: Measures blood glucose levels after an overnight fast (8-12 hours without eating).
      </Text>
      <Text style={styles.text}>
        Normal Values:
        {"\n"}- Normal: Less than 100 mg/dL (5.6 mmol/L)
        {"\n"}- Prediabetes: 100-125 mg/dL (5.6-6.9 mmol/L)
        {"\n"}- Diabetes: 126 mg/dL (7.0 mmol/L) or higher on two separate tests
      </Text>

      <Text style={styles.subtitle}>2. Postprandial Blood Sugar Test (PPBS)</Text>
      <Text style={styles.text}>
        Description: Measures blood glucose levels exactly two hours after eating a meal.
      </Text>
      <Text style={styles.text}>
        Normal Values:
        {"\n"}- Normal: Less than 140 mg/dL (7.8 mmol/L)
        {"\n"}- Prediabetes: 140-199 mg/dL (7.8-11.0 mmol/L)
        {"\n"}- Diabetes: 200 mg/dL (11.1 mmol/L) or higher
      </Text>

      <Text style={styles.subtitle}>3. Random Blood Sugar Test (RBS)</Text>
      <Text style={styles.text}>
        Description: Measures blood glucose levels at any time of the day, regardless of when the person last ate.
      </Text>
      <Text style={styles.text}>
        Normal Values:
        {"\n"}- Normal: Less than 200 mg/dL (11.1 mmol/L)
        {"\n"}- Diabetes: 200 mg/dL (11.1 mmol/L) or higher, especially if accompanied by symptoms of diabetes (such as increased thirst, urination, and fatigue)
      </Text>

      <Text style={styles.subtitle}>Detailed Insights</Text>
      
      <Text style={styles.text2}>Fasting Blood Sugar Test</Text>
      <Text style={styles.text}>
        Importance: This test is particularly useful for diagnosing diabetes and prediabetes. It provides a baseline glucose level without the influence of recent food intake.
      </Text>

      <Text style={styles.text2}>Postprandial Blood Sugar Test</Text>
      <Text style={styles.text}>
        Importance: Helps to understand how the body responds to food and how well the body is managing post-meal glucose levels. It is particularly useful for diagnosing and managing diabetes.
      </Text>

      <Text style={styles.text2}>Random Blood Sugar Test</Text>
      <Text style={styles.text}>
        Importance: Provides a snapshot of blood glucose levels at a random time, making it useful for quickly assessing glucose levels without the need for fasting or scheduling around meals.
      </Text>

      <Text style={styles.subtitle}>Interpretation of Results</Text>
      <Text style={styles.text}>
        Normal Levels: Indicate that the body is effectively regulating blood glucose levels.
      </Text>
      <Text style={styles.text}>
        Prediabetes: Suggests that the blood glucose levels are higher than normal but not yet high enough to be classified as diabetes. This is a critical stage for intervention to prevent the progression to diabetes through lifestyle changes and possibly medication.
      </Text>
      <Text style={styles.text}>
        Diabetes: Indicates that blood glucose levels are consistently high, and a diagnosis of diabetes is likely. Requires management through lifestyle changes, medication, and regular monitoring to prevent complications.
      </Text>

      <Text style={styles.subtitle}>Management</Text>
      <Text style={styles.text}>
        Lifestyle Changes: Include adopting a healthy diet, regular physical activity, weight management, and quitting smoking.
      </Text>
      <Text style={styles.text}>
        Medications: May include insulin, oral hypoglycemic agents, or other medications as prescribed by a healthcare provider.
      </Text>
      <Text style={styles.text}>
        Regular Monitoring: Essential for managing diabetes, adjusting treatment plans, and preventing complications.
      </Text>

      <Text style={styles.footer}>
        Consulting with a healthcare provider for proper interpretation and management based on individual health conditions is essential.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: "#800000"
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  text2: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
    fontWeight: 'bold',
    color: "orange"
  },
  footer: {
    fontSize: 14,
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default BloodSugarInfo;
