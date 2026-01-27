import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Property {
  id: string;
  name: string;
  location: string;
  price: string;
  description: string;
  tenants: string[];
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<string[]>([]);
  const [newTenant, setNewTenant] = useState("");

  useEffect(() => {
    const properties: Property[] = JSON.parse(localStorage.getItem("properties") || "[]");
    const prop = properties.find((p) => p.id === id) || null;
    setProperty(prop);
    if (prop) setTenants(prop.tenants || []);
  }, [id]);

  const saveProperty = (updatedProperty: Property) => {
    const properties: Property[] = JSON.parse(localStorage.getItem("properties") || "[]");
    const index = properties.findIndex((p) => p.id === updatedProperty.id);
    if (index > -1) {
      properties[index] = updatedProperty;
      localStorage.setItem("properties", JSON.stringify(properties));
      setProperty(updatedProperty);
      setTenants(updatedProperty.tenants);
    }
  };

  const handleTenantAdd = () => {
    if (!newTenant.trim() || !property) return;
    const updatedProperty = { ...property, tenants: [...tenants, newTenant] };
    saveProperty(updatedProperty);
    setNewTenant("");
  };

  const handlePropertyEdit = (field: keyof Property, value: string) => {
    if (!property) return;
    const updatedProperty = { ...property, [field]: value };
    saveProperty(updatedProperty);
  };

  if (!property) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 pt-24">
        <p className="text-black text-xl">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-blue-500">
        <button
          onClick={() => navigate("/properties")}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-medium mb-6"
        >
          ← Back to Properties
        </button>

        <h1 className="text-3xl font-bold text-blue-700 mb-4">{property.name}</h1>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-black">Location:</label>
            <input
              type="text"
              value={property.location}
              onChange={(e) => handlePropertyEdit("location", e.target.value)}
              className="w-full px-4 py-2 border border-black rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white text-black"
            />
          </div>

          <div>
            <label className="font-semibold text-black">Price (UGX):</label>
            <input
              type="number"
              value={property.price}
              onChange={(e) => handlePropertyEdit("price", e.target.value)}
              className="w-full px-4 py-2 border border-black rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white text-black"
            />
          </div>

          <div>
            <label className="font-semibold text-black">Description:</label>
            <textarea
              value={property.description}
              onChange={(e) => handlePropertyEdit("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-black rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white text-black"
            />
          </div>
        </div>

        {/* Tenants */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-3">Tenants</h2>
          <div className="space-y-2">
            {tenants.length === 0 ? (
              <p className="text-black">No tenants added yet.</p>
            ) : (
              tenants.map((tenant, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded border border-black"
                >
                  <span className="text-black">{tenant}</span>
                </div>
              ))
            )}
          </div>

          {/* Add Tenant */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Tenant name"
              value={newTenant}
              onChange={(e) => setNewTenant(e.target.value)}
              className="flex-1 px-4 py-2 border border-black rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 bg-white text-black"
            />
            <button
              onClick={handleTenantAdd}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium transition"
            >
              Add Tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
