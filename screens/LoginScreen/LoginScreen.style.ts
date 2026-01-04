import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f4f7f9",
    minHeight: "100vh" as any,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 400,
    height: 200,
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  button: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#3498db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  errorText: {
    color: "#721c24",
    fontSize: 14,
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "#d4edda",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    fontWeight: "500",
  },
  warningContainer: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#3498db",
    fontSize: 13,
    fontWeight: "500",
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#2c3e50",
    fontSize: 14,
  },
  registerLink: {
    color: "#3498db",
    fontWeight: "bold",
  },
});
