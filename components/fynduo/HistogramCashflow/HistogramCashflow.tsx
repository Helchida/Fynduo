import { View, Text } from "react-native";
import { HistogramCashflowProps } from "./HistogramCashflow.type";
import { styles } from "./HistogramCashflow.style";

const HistogramCashflow : React.FC<HistogramCashflowProps>= ({
  month,
  year,
  total,
  totalRevenus,
  maxTotal,
  isSoloMode,
  isStacked,
}) =>  {

  const MAX_BAR_HEIGHT = 90;
  const depenseHeight = maxTotal > 0 ? (total / maxTotal) * MAX_BAR_HEIGHT : 0;
  const revenuHeight =
    maxTotal > 0 ? (totalRevenus / maxTotal) * MAX_BAR_HEIGHT : 0;

  const solde = totalRevenus - total;
  const soldeColor = solde > 0 ? "#27ae60" : solde < 0 ? "#e74c3c" : "#95a5a6";

  return (
    <View style={styles.historyColumn}>
      {isStacked && isSoloMode ? (
        <>
          <View
            style={{
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Text
              style={{ color: soldeColor, fontSize: 11, fontWeight: "900" }}
            >
              {solde >= 0 ? "+" : ""}
              {solde.toFixed(2)}€
            </Text>
          </View>

          <View
            style={{
              height: MAX_BAR_HEIGHT,
              width: 25,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(revenuHeight, 2),
                  backgroundColor: "#27a1d1",
                  width: 25,
                  opacity: 0.2,
                  position: "absolute",
                },
              ]}
            />
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(depenseHeight, 2),
                  backgroundColor: soldeColor,
                  width: 25,
                  opacity: 0.8,
                },
              ]}
            />
          </View>
        </>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}
          >
            {isSoloMode && (
              <View style={{ alignItems: "flex-end", width: 40 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#27a1d1",
                    fontSize: 9,
                    fontWeight: "800",
                    textAlign: "right",
                    minWidth: 65,
                    marginBottom: 4,
                    letterSpacing: -0.5
                  }}
                >
                  {totalRevenus > 0 ? `${totalRevenus.toFixed(1)}€` : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(revenuHeight, 2),
                      backgroundColor: "#27a1d1",
                      width: 20,
                    },
                  ]}
                />
              </View>
            )}

            <View style={{ alignItems: "flex-start", width: 40 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#27ae60",
                  fontSize: 9,
                  fontWeight: "800",
                  textAlign: "left",
                  minWidth: 65,
                  marginBottom: 4,
                  letterSpacing: -0.5
                }}
              >
                {total > 0 ? `${total.toFixed(1)}€` : ""}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(depenseHeight, 2),
                    backgroundColor: "#27ae60",
                    width: 20,
                  },
                ]}
              />
            </View>
          </View>
          {isSoloMode && (
            <View
              style={{
                width: 44,
                height: 2,
                backgroundColor: "#bdc3c7",
                marginTop: 6,
                borderRadius: 1,
              }}
            />
          )}
        </View>
      )}

      <Text style={[styles.historyMonthLabel, { marginTop: 8 }]}>{month}</Text>
      <Text style={styles.historyYearLabel}>{year}</Text>
    </View>
  );
};

export default HistogramCashflow;