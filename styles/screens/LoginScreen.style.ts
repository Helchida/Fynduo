import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f7f9',
        padding: 20,
    },

    headerContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },

    header: {
        fontSize: 34,
        fontWeight: '900',
        color: '#2c3e50',
        marginBottom: 10,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 18,
        color: '#7f8c8d',
        textAlign: 'center',
    },

    formContainer: {
        width: '100%',
        maxWidth: 320,
        gap: 15,
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#dfe4ea',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#2c3e50',
    },

    button: {
        marginTop: 10,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#3498db',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },

    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
