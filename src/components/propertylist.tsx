import React from "react";

interface Property {
  id: number;
  name: string;
  address: string;
  description: string;
}

interface Props {
  properties: Property[];
}

const PropertyList: React.FC<Props> = ({ properties }) => {
  if (properties.length === 0)
    return <p className="text-gray-500">No properties added yet.</p>;

  return (
    <div className="grid gap-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="border rounded p-4 bg-white shadow-sm"
        >
          <h3 className="text-lg font-semibold">{property.name}</h3>
          <p className="text-gray-600">{property.address}</p>
          {property.description && (
            <p className="text-gray-500 mt-2">{property.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
