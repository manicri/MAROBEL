import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: 'cabello' | 'unas' | 'estetica-facial';
}

interface SelectionContextType {
  selectedServices: ServiceItem[];
  addService: (service: ServiceItem) => void;
  removeService: (id: string) => void;
  total: number;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  const addService = (service: ServiceItem) => {
    setSelectedServices((prev) => {
      if (prev.find((s) => s.id === service.id)) return prev;
      return [...prev, service];
    });
  };

  const removeService = (id: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSelection = () => {
    setSelectedServices([]);
  };

  const total = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <SelectionContext.Provider value={{ selectedServices, addService, removeService, total, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
