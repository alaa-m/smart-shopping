import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, ShoppingCart as CartIcon, Send, Plus, Minus, Trash2 } from 'lucide-react';
import { db, Item, CartItem } from '../db/database';
import toast from 'react-hot-toast';

export default function ShoppingCart() {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const items = useLiveQuery(() => 
    search
      ? db.items.where('name').startsWithIgnoreCase(search).toArray()
      : Promise.resolve([])
  );

  const cartItems = useLiveQuery(() => db.cartItems.toArray());

  const addToCart = async (item: Item) => {
    const existingItem = cartItems?.find(cartItem => cartItem.itemId === item.id);
    
    try {
      if (existingItem) {
        await db.cartItems.update(existingItem.id!, {
          quantity: existingItem.quantity + 1
        });
      } else {
        await db.cartItems.add({
          itemId: item.id!,
          name: item.name,
          price: item.price,
          quantity: 1
        });
      }
      toast.success('Item added to cart');
      setShowResults(false);
      setSearch('');
    } catch (error) {
      toast.error('Error adding item to cart');
    }
  };

  const updateQuantity = async (cartItem: CartItem, increment: boolean) => {
    try {
      const newQuantity = increment ? cartItem.quantity + 1 : cartItem.quantity - 1;
      if (newQuantity === 0) {
        await db.cartItems.delete(cartItem.id!);
      } else {
        await db.cartItems.update(cartItem.id!, { quantity: newQuantity });
      }
    } catch (error) {
      toast.error('Error updating quantity');
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await db.cartItems.delete(id);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  const submitToWhatsApp = () => {
    if (!cartItems?.length) {
      toast.error('Cart is empty');
      return;
    }

    const message = cartItems
      .map(item => `${item.quantity}x ${item.name}`)
      .join('\n');
    
    const finalMessage = `Shopping List:\n${message}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(finalMessage)}`);
  };

  const addNewItem = async () => {
    try {
      const item = {
        typeId: 1, // Default type
        name: search,
        price: 0,
        description: 'Custom added item'
      };
      const itemId = await db.items.add(item);
      await addToCart({ ...item, id: itemId });
      setSearch('');
      setShowResults(false);
    } catch (error) {
      toast.error('Error adding new item');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CartIcon />
        Shopping Cart
      </h2>

      <div className="relative mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              placeholder="Search items..."
              className="w-full p-2 pl-8 border rounded"
            />
            <Search className="absolute left-2 top-2.5 text-gray-400" size={20} />
          </div>
          {search && (
            <button
              onClick={addNewItem}
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New
            </button>
          )}
        </div>

        {showResults && items && items.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => addToCart(item)}
              >
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {cartItems?.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item, false)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item, true)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => item.id && removeFromCart(item.id)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {cartItems?.length === 0 && (
          <p className="text-center text-gray-500">Your cart is empty</p>
        )}

        {cartItems?.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={submitToWhatsApp}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Send size={20} />
              Send to WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}