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
        paddingBottom: 20,
    },
});