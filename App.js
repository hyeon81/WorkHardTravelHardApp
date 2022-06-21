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
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos"; //key는 또 쓸거임!

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    //(key,value) value는 string이어야 함
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    //받아온 string 다시 객체로 만들어줌
    setToDos(JSON.parse(s));
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
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    //(목표객체, 출처객체, 추가하려는객체)
    setToDos(newToDos); //newToDos는 기존과 새로운게 합쳐진 객체
    await saveToDos(newToDos); //add되는 순간 save됨
    setText("");
  };
  const deleteToDo = async (key) => {
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
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
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
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              {/* deleteToDo는 id 보내줘야하는데 여기서 아이디는 key야! */}
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>
                  <FontAwesome name="trash" size={20} color={theme.grey} />
                </Text>
              </TouchableOpacity>
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
  btnText: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
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
    paddingVertical: 20,
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
});
