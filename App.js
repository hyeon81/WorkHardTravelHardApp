import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos"; //key는 또 쓸거임!
const CURRENT_BTN = "@cureentBtn"; //key는 또 쓸거임!

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editMode, setEditMode] = useState(false);
  const travel = () => {
    setWorking(false);
    AsyncStorage.setItem(CURRENT_BTN, JSON.stringify({ workbtn: false }));
  };
  const work = () => {
    setWorking(true);
    AsyncStorage.setItem(CURRENT_BTN, JSON.stringify({ workbtn: true }));
  };
  const onChangeText = (payload) => setText(payload);
  const onEditText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    //(key,value) value는 string이어야 함
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s1 = await AsyncStorage.getItem(STORAGE_KEY);
    const s2 = await AsyncStorage.getItem(CURRENT_BTN);
    //받아온 string 다시 객체로 만들어줌
    if (s1) {
      setToDos(JSON.parse(s1));
    }
    if (s2) {
      setWorking(JSON.parse(s2).workbtn);
    }
  };

  useEffect(() => {
    //데이터 로드
    loadToDos();
  }, []);

  const addTodo = async () => {
    if (text === "") {
      //비어있으면 그냥 return;
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false, edit: false },
    };
    //(목표객체, 출처객체, 추가하려는객체)
    setToDos(newToDos); //newToDos는 기존과 새로운게 합쳐진 객체
    await saveToDos(newToDos); //add되는 순간 save됨
    setText("");
  };

  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive", //스타일도 줄수있음! ios기준이래.
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const editToDo = async (key) => {
    //text 세팅해줄예정
    const newToDos = { ...toDos };
    if (editText === "" || editText === newToDos[key].text) {
      newToDos[key].edit = false;
      setToDos(newToDos);
      return;
    }
    newToDos[key].text = editText;
    newToDos[key].edit = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const setEditToDo = async (key) => {
    setEditMode(!editMode);

    if (editMode) {
      const newToDos = { ...toDos };
      newToDos[key].edit = true;
      setToDos(newToDos);
    } else {
      const newToDos = { ...toDos };
      newToDos[key].edit = false;
    }
    setToDos(newToDos);
  };

  const workDone = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: "white",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "600",
              color: "white",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addTodo}
          onChangeText={onChangeText}
          value={text}
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        ></TextInput>
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => workDone(key)}>
                  <FontAwesome5
                    name={toDos[key].done ? "check-square" : "square"}
                    size={24}
                    style={styles.workDone}
                  />
                </TouchableOpacity>
                {toDos[key].edit ? (
                  <TextInput
                    onSubmitEditing={() => {
                      editToDo(key);
                    }}
                    onChangeText={onEditText}
                    defaultValue={toDos[key].text}
                    returnKeyType="done"
                    style={styles.editInput}
                  ></TextInput>
                ) : (
                  <Text
                    style={
                      toDos[key].done ? styles.workDoneText : styles.toDoText
                    }
                  >
                    {toDos[key].text}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => setEditToDo(key)}>
                  <MaterialIcons
                    style={{ marginRight: 14 }}
                    name="edit"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <FontAwesome name="trash" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 30,
    //컨테이너 가로 방향으로 padding을 20px줌
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15, //인풋 창 크기
    paddingHorizontal: 20, //글자 위치
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  workDone: {
    marginRight: 10,
    color: "white",
  },
  workDoneText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  editInput: {
    width: 180,
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    borderBottomColor: "white",
    borderBottomWidth: 2,
  },
});
