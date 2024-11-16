import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { db, Item, ItemType } from '../db/database';
import toast from 'react-hot-toast';

export default function ItemManager() {
  const [newItem, setNewItem] = useState({
    typeId: 0,
    name: '',
    price: 0,
    description: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const items = useLiveQuery(() => db.items.toArray());
  const itemTypes = useLiveQuery(() => db.itemTypes.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.items.update(editingId, newItem);
        toast.success('Item updated successfully');
      } else {
        await db.items.add(newItem);
        toast.success('Item added successfully');
      }
      setNewItem({ typeId: 0, name: '', price: 0, description: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Error saving item');
    }
  };

  const handleEdit = (item: Item) => {
    setNewItem(item);
    setEditingId(item.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await db.items.delete(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Error deleting item');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6">Items</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={newItem.typeId}
            onChange={(e) => setNewItem({ ...newItem, typeId: Number(e.target.value) })}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Type</option>
            {itemTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => item.id && handleDelete(item.id)}
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