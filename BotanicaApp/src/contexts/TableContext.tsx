import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TableContextType {
  refreshTables: () => void;
  tablesLastUpdate: number;
  isTablesLoading: boolean;
  setIsTablesLoading: (loading: boolean) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tablesLastUpdate, setTablesLastUpdate] = useState(Date.now());
  const [isTablesLoading, setIsTablesLoading] = useState(false);

  const refreshTables = () => {
    setTablesLastUpdate(Date.now());
  };

  return (
    <TableContext.Provider value={{ 
      refreshTables, 
      tablesLastUpdate, 
      isTablesLoading, 
      setIsTablesLoading 
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};