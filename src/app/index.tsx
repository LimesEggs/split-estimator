import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function format(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms / 1000) % 60);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m > 0 ? `${String(m).padStart(1, "0")}:` : ""}${m > 0 || s > 0 ? `${String(s).padStart(2, "0")}.` : ""}${String(cs).padStart(2, "0")}`;
}

function findPace(ms: number, distance: number) {
  const s = Math.floor(ms / 1000);
  const speed = s / distance;
  const pace = Math.floor(speed * 1609);
  return pace;
}

const FAST_MS = 14 * 60 * 1000; // 14:00
const SLOW_MS = 20 * 60 * 1000; // 20:00

function estimateFinishMs(ms: number, distance: number) {
  return ms + (ms / distance) * (5000 - distance);
}

const CHECKPOINTS = [
  { label: "0.5 mi", meters: 800 },
  { label: "1 mi", meters: 1609 },
  { label: "2 mi", meters: 3218 },
  { label: "2.6 mi", meters: 4200 },
];

export default function HomeScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTime = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // clean up if the screen closes while running
  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function start() {
    if (isRunning) return;
    startTime.current = Date.now() - elapsed;
    timer.current = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 100);
    setIsRunning(true);
  }

  function stop() {
    if (!isRunning) return;
    if (timer.current) clearInterval(timer.current);
    setElapsed(Date.now() - startTime.current);
    setIsRunning(false);
  }

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setElapsed(0);
    setIsRunning(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{format(elapsed)}</Text>

      <View style={styles.row}>
        <Pressable
          style={[
            styles.button,
            isRunning ? styles.stopButton : styles.startButton,
          ]}
          onPress={isRunning ? stop : start}
        >
          <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.resetButton]} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.tableRow}>
          <Text style={[styles.headerText, styles.colDistance]}>Distance</Text>
          <Text style={[styles.headerText, styles.colPace]}>Pace / mi</Text>
          <Text style={[styles.headerText, styles.colEstimate]}>Est. 5K</Text>
        </View>

        {CHECKPOINTS.map((c, i) => {
          const est = estimateFinishMs(elapsed, c.meters);
          const outOfRange = est < FAST_MS || est > SLOW_MS;

          return (
            <View
              key={c.label}
              style={[
                styles.tableRow,
                i < CHECKPOINTS.length - 1 && styles.rowDivider,
              ]}
            >
              <Text style={[styles.distanceText, styles.colDistance]}>
                {c.label}
              </Text>
              <Text style={[styles.paceText, styles.colPace]}>
                {format(findPace(elapsed, c.meters) * 1000)}
              </Text>
              <Text
                style={[
                  styles.estimateText,
                  styles.colEstimate,
                  outOfRange && styles.dimmed,
                ]}
              >
                {format(est)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    gap: 32,
    backgroundColor: "#0f1115",
  },
  time: {
    fontSize: 72,
    fontWeight: "200",
    color: "white",
    fontVariant: ["tabular-nums"],
  },
  row: { flexDirection: "row", gap: 16 },
  button: {
    minWidth: 120,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 999,
  },
  startButton: { backgroundColor: "#22a559" },
  stopButton: { backgroundColor: "#d64545" },
  resetButton: { backgroundColor: "#2a2e37" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "600" },

  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#181b22",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2e37",
  },
  colDistance: { flex: 1 },
  colPace: { flex: 1, textAlign: "center" },
  colEstimate: { flex: 1.2, textAlign: "right" },
  headerText: {
    color: "#7d8594",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  distanceText: { color: "white", fontSize: 18, fontWeight: "600" },
  paceText: {
    color: "#b4bac5",
    fontSize: 18,
    fontVariant: ["tabular-nums"],
  },
  estimateText: {
    color: "#4ade80",
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  dimmed: { opacity: 0.3 },
});
