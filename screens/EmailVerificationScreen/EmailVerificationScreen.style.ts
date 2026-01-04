import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f4f7f9",
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
  successContainer: {
    alignItems: "center",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#27ae60",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 40,
    color: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  waitingContainer: {
    alignItems: "center",
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 30,
    marginBottom: 15,
    textAlign: "center",
  },
  waitingDescription: {
    fontSize: 15,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emailText: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
  actionsContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    marginTop: 40,
    paddingTop: 20,
  },
  resendButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  resendButtonEnabled: {
    backgroundColor: "#3498db",
  },
  resendButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  resendButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  logoutButtonText: {
    color: "#3498db",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
