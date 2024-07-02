import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as SQLite from "expo-sqlite/legacy";
import FontAwesome from "@expo/vector-icons/FontAwesome6";

export default function CameraFunction({ route }) {
  let { userID } = route.params;
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibPermit, setHasMediaLibPermit] = useState();
  const [photo, setPhoto] = useState();
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  //DATABASE
  const db = SQLite.openDatabase("medlogger.db");

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibPermit(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permission....</Text>;
  } else if (!hasCameraPermission) {
    return (
      <Text>
        Permission for camera not granted. Please change this in settings
      </Text>
    );
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (photo) {
    let savePhoto = async () => {
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      let dateString = new Date().toISOString();
      let date = dateString
        .slice(0, dateString.indexOf("T"))
        .split("-")
        .reverse()
        .join("-");
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO diagnosticReports (user_id, date, uri, doctor, notes) values (?, ?, ?, ?, ?)",
          [userID, date, asset.uri, doctor, notes],
          (txObj, resultSet) => {
            Alert.alert("Image Saved");
            setPhoto(undefined);
          },
          (txObj, error) => console.log(error)
        );
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image
          style={styles.preview}
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
        />
        <View>
          <TextInput
            style={styles.input}
            placeholder="Advised by"
            value={doctor}
            onChangeText={setDoctor}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        <View style={styles.btnContainer}>
          {hasMediaLibPermit ? (
            <TouchableOpacity onPress={savePhoto} style={styles.btn}>
              <FontAwesome name="floppy-disk" size={30} color="#800000" />
            </TouchableOpacity>
          ) : undefined}
          <TouchableOpacity
            onPress={() => setPhoto(undefined)}
            style={styles.btn}
          >
            <FontAwesome name="trash-can" size={30} color="#800000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}></Camera>
      <TouchableOpacity style={styles.cameraBtn}>
        <FontAwesome
          name="camera"
          size={50}
          color="gray"
          style={styles.btnText}
          onPress={takePic}
        />
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "95%",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
  },
  camera: {
    width: "100%",
    height: "90%",
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
    width: "auto",
  },
  input: {
    width: "90%",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#800000",
    marginHorizontal: 10,
  },
  btnContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  btn: {
    justifyContent: "center",
    margin: 10,
    elevation: 5,
  },
  btnText: {
    textAlign: "center",
    padding: 10,
  },
});
