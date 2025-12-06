import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f8f8f8'
    },
    header: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    warning: { 
        color: '#d9534f',
        backgroundColor: '#f2dede',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        textAlign: 'center',
    },
    loading: { 
        textAlign: 'center', 
        marginTop: 50,
        fontSize: 18,
        color: '#5bc0de',
    },
    list: { 
        flex: 1, 
    },
    chargeItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    chargeName: { 
        fontSize: 18, 
        fontWeight: '700',
        color: '#2c3e50',
    },
    chargePayer: { 
        fontSize: 14, 
        color: '#7f8c8d', 
        marginBottom: 8 
    },
    inputRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 5 
    },
    currency: { 
        fontSize: 18, 
        marginRight: 5,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        padding: 10,
        marginRight: 10,
        borderRadius: 6,
        backgroundColor: '#ecf0f1',
        fontSize: 16,
    },
});