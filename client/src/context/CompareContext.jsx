import { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = useCallback((phone) => {
    setCompareList(prev => {
      if (prev.length >= 3) return prev;
      if (prev.find(p => p._id === phone._id)) return prev;
      return [...prev, phone];
    });
  }, []);

  const removeFromCompare = useCallback((phoneId) => {
    setCompareList(prev => prev.filter(p => p._id !== phoneId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((phoneId) => {
    return compareList.some(p => p._id === phoneId);
  }, [compareList]);

  const canAddMore = compareList.length < 3;

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore,
      compareCount: compareList.length,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
