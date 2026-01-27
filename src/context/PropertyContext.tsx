import { createContext, useState } from "react";
import type { ReactNode } from "react";

export interface Property {
  id: number;
  name: string;
  address: string;
  description: string;
}

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Property) => void;
}

export const PropertyContext = createContext<PropertyContextType>({
  properties: [],
  addProperty: () => {},
});

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  const addProperty = (property: Property) => {
    setProperties((prev) => [...prev, property]);
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};
