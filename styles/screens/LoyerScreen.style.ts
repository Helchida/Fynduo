import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#fff' 
    },
    header: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 20,
        color: '#2c3e50',
    },
    label: { 
        fontSize: 16, 
        marginTop: 15, 
        marginBottom: 5, 
        fontWeight: '500' 
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      fontSize: 16,
      borderRadius: 5,
    },
    result: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2980b9'
    },
    buttonWrapper: {
        marginTop: 30,
    },
    loading: { 
        textAlign: 'center', 
        marginTop: 50 
    },
    permissionWarning: { 
        marginTop: 30, 
        color: 'red', 
        textAlign: 'center' 
    }
})