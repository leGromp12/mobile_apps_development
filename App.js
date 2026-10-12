import { useEffect, useRef, useState } from "react";
import {
  Button,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

export default function App() {
  const [workTime, setWorkTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);

  const [workInput, setWorkInput] = useState("25");
  const [breakInput, setBreakInput] = useState("5");

  const [isWork, setIsWork] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const finishTime = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((finishTime.current - Date.now()) / 1000);

      setSecondsLeft(Math.max(0, remaining));
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || secondsLeft !== 0) {
      return;
    }

    Vibration.vibrate();

    const timeout = setTimeout(() => {
      const nextTime = isWork ? breakTime : workTime;

      finishTime.current = Date.now() + nextTime * 1000;
      setIsWork(!isWork);
      setSecondsLeft(nextTime);
    }, 500);

    return () => {
      clearTimeout(timeout);
      Vibration.cancel();
    };
  }, [secondsLeft, isRunning, isWork, workTime, breakTime]);

  function startTimer() {
    if (isRunning) {
      return;
    }

    finishTime.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  }

  function pauseTimer() {
    if (!isRunning) {
      return;
    }

    const remaining = Math.ceil((finishTime.current - Date.now()) / 1000);

    setSecondsLeft(Math.max(0, remaining));
    setIsRunning(false);
    Vibration.cancel();
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(isWork ? workTime : breakTime);
    Vibration.cancel();
  }

  function applyTime() {
    const workMinutes = Number(workInput.trim().replace(",", "."));
    const breakMinutes = Number(breakInput.trim().replace(",", "."));

    const newWorkTime = Math.round(workMinutes * 60);
    const newBreakTime = Math.round(breakMinutes * 60);

    if (
      !Number.isFinite(workMinutes) ||
      !Number.isFinite(breakMinutes) ||
      !Number.isSafeInteger(newWorkTime) ||
      !Number.isSafeInteger(newBreakTime) ||
      newWorkTime < 1 ||
      newBreakTime < 1
    ) {
      Alert.alert(
        "Некоректний час",
        "Введи додатні числа. Тривалість кожного режиму має бути не меншою за 1 секунду.",
      );
      return;
    }

    setIsRunning(false);
    setWorkTime(newWorkTime);
    setBreakTime(newBreakTime);
    setIsWork(true);
    setSecondsLeft(newWorkTime);

    Vibration.cancel();
    Keyboard.dismiss();
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  const modeColor = isWork ? "#b83c35" : "#237a57";

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Pomodoro</Text>

      <Text style={[styles.mode, { color: modeColor }]}>
        {isWork ? "Час працювати" : "Час відпочити"}
      </Text>

      <Text style={styles.timer}>{formattedTime}</Text>

      <Text style={styles.status}>
        {isRunning ? "Таймер працює" : "Таймер зупинено"}
      </Text>

      <View style={styles.buttons}>
        <Button
          title="Старт"
          onPress={startTimer}
          disabled={isRunning}
          color="#237a57"
        />
        <Button
          title="Пауза"
          onPress={pauseTimer}
          disabled={!isRunning}
          color="#b57613"
        />
        <Button title="Скинути" onPress={resetTimer} color="#b83c35" />
      </View>

      <View style={styles.settings}>
        <Text style={styles.settingsTitle}>Налаштування часу</Text>

        <Text style={styles.label}>Робота — хвилини</Text>
        <TextInput
          style={styles.input}
          value={workInput}
          onChangeText={setWorkInput}
          keyboardType="decimal-pad"
          accessibilityLabel="Тривалість роботи у хвилинах"
        />

        <Text style={styles.label}>Перерва — хвилини</Text>
        <TextInput
          style={styles.input}
          value={breakInput}
          onChangeText={setBreakInput}
          keyboardType="decimal-pad"
          accessibilityLabel="Тривалість перерви у хвилинах"
        />

        <Button title="Застосувати час" onPress={applyTime} color="#345b9c" />

        <Text style={styles.hint}>
          Застосування часу зупиняє таймер і починає новий робочий цикл.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    backgroundColor: "#f5f2ed",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#242424",
    marginBottom: 24,
  },
  mode: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
    color: "#242424",
    marginVertical: 16,
    fontVariant: ["tabular-nums"],
  },
  status: {
    textAlign: "center",
    color: "#666666",
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  settings: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#242424",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#242424",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    color: "#242424",
    backgroundColor: "#ffffff",
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666666",
    marginTop: 12,
  },
});
