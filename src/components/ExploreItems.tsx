import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Folder, ChevronDown, ChevronRight, ShoppingBag, Send, Plus, Minus, X } from 'lucide-react';
import { db, ItemType, Item } from '../db/database';
import toast from 'react-hot-toast';

export default function ExploreItems() {
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
  const [showModal, setShowModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  const itemTypes = useLiveQuery(() => db.itemTypes.toArray());
  const items = useLiveQuery(() => db.items.toArray());

  const toggleType = (typeId: number) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    } else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  const openAddItemModal = (typeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTypeId(typeId);
    setShowModal(true);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId) return;

    try {
      await db.items.add({
        ...newItem,
        typeId: selectedTypeId,
        price: 0
      });
      toast.success('Item added successfully');
      setNewItem({ name: '', description: '' });
      setShowModal(false);
    } catch (error) {
      toast.error('Error adding item');
    }
  };

  const updateItemQuantity = (itemId: number, increment: boolean) => {
    const newSelected = new Map(selectedItems);
    const currentQuantity = newSelected.get(itemId) || 0;
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity <= 0) {
      newSelected.delete(itemId);
    } else {
      newSelected.set(itemId, newQuantity);
    }
    setSelectedItems(newSelected);
  };

  const submitOrder = () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }

    // Group items by type
    const groupedItems = new Map<number, { typeName: string; items: { name: string; quantity: number }[] }>();

    selectedItems.forEach((quantity, itemId) => {
      const item = items?.find(i => i.id === itemId);
      if (item) {
        const type = itemTypes?.find(t => t.id === item.typeId);
        if (type && type.id) {
          if (!groupedItems.has(type.id)) {
            groupedItems.set(type.id, { typeName: type.name, items: [] });
          }
          groupedItems.get(type.id)?.items.push({
            name: item.name,
            quantity
          });
        }
      }
    });

    const message = `قائمة المشتريات:\n\n${Array.from(groupedItems.values())
      .map(group => `${group.typeName}:\n${group.items
        .map(item => `${item.name}`)
        .join('\n')}`)
      .join('\n\n')}`;

    window.open(`https://api.whatsapp.com/send?phone=963944930258&text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag />
        Explore Items
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {itemTypes?.map((type) => (
              <div key={type.id} className="select-none">
                <div
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => type.id && toggleType(type.id)}
                >
                  {expandedTypes.has(type.id!) ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                  <Folder size={20} className="text-blue-500" />
                  <span>{type.name}</span>
                  <button
                    onClick={(e) => type.id && openAddItemModal(type.id, e)}
                    className="ml-auto p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {expandedTypes.has(type.id!) && (
                  <div className="ml-9 space-y-1">
                    {items
                      ?.filter(item => item.typeId === type.id)
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="flex items-center gap-2">
                            {selectedItems.has(item.id!) ? (
                              <>
                                <button
                                  onClick={() => updateItemQuantity(item.id!, false)}
                                  className="p-1 text-gray-600 hover:text-gray-800"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-8 text-center">
                                  {selectedItems.get(item.id!)}
                                </span>
                                <button
                                  onClick={() => updateItemQuantity(item.id!, true)}
                                  className="p-1 text-gray-600 hover:text-gray-800"
                                >
                                  <Plus size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => updateItemQuantity(item.id!, true)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Plus size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Selected Items</h3>
          {selectedItems.size === 0 ? (
            <p className="text-gray-500 text-center">No items selected</p>
          ) : (
            <div className="space-y-3">
              {Array.from(selectedItems.entries()).map(([itemId, quantity]) => {
                const item = items?.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="font-medium">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(itemId, false)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(itemId, true)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={submitOrder}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Order to WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Item</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}