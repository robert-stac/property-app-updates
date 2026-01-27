import React, { useState } from "react";

interface Property {
  id: number;
  name: string;
  address: string;
  description: string;
}

interface Props {
  onAdd: (property: Property) => void;
}

const AddPropertyForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    const newProperty: Property = {
      id: Date.now(),
      name,
      address,
      description,
    };
    onAdd(newProperty);
    setName("");
    setAddress("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-6 py-4 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add Property</h2>

      <input
        type="text"
        placeholder="Property Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2 mb-3 w-full"
      />

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border rounded px-3 py-2 mb-3 w-full"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2 mb-3 w-full"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Property
      </button>
    </form>
  );
};

export default AddPropertyForm;
