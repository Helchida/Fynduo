import { useContext } from 'react';
import { ComptesContext } from '../context/ComptesContext';
export const useComptes = () => {
    const context = useContext(ComptesContext);
    if (context === undefined) {
        throw new Error('useComptes doit être utilisé dans un ComptesProvider');
    }
    return context;
};