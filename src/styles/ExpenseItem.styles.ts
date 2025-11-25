import { StyleSheet } from 'react-native';
import { colors, sizes } from './theme.styles';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: sizes.itemHeight,
    paddingHorizontal: sizes.padding,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingVertical: 10
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  text: {
    fontSize: sizes.fontMd,
    color: colors.text
  },
  amount: {
    fontSize: sizes.fontMd,
    fontWeight: 'bold',
    color: colors.primary
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },

  deleteButton: {
    backgroundColor: '#e11d48',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 10,
    marginBottom: 10,
  },
});
