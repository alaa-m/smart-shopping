import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { db, ItemType } from '../db/database';
import toast from 'react-hot-toast';

export default function ItemTypeManager() {
  const [newType, setNewType] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const itemTypes = useLiveQuery(() => db.itemTypes.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.itemTypes.update(editingId, newType);
        toast.success('Item type updated successfully');
      } else {
        await db.itemTypes.add(newType);
        toast.success('Item type added successfully');
      }
      setNewType({ name: '', description: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Error saving item type');
    }
  };

  const handleEdit = (type: ItemType) => {
    setNewType({ name: type.name, description: type.description });
    setEditingId(type.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await db.itemTypes.delete(id);
      toast.success('Item type deleted successfully');
    } catch (error) {
      toast.error('Error deleting item type');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Item Types</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Type Name"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newType.description}
            onChange={(e) => setNewType({ ...newType, description: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            {editingId ? 'Update Type' : 'Add Type'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemTypes?.map((type) => (
          <div key={type.id} className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold">{type.name}</h3>
            <p className="text-gray-600 text-sm">{type.description}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(type)}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => type.id && handleDelete(type.id)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}