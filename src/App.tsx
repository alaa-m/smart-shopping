import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ShoppingBag, Package, ShoppingCart as CartIcon, FolderTree } from 'lucide-react';
import ItemTypeManager from './components/ItemTypeManager';
import ItemManager from './components/ItemManager';
import ShoppingCart from './components/ShoppingCart';
import ExploreItems from './components/ExploreItems';

function App() {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShoppingBag className="text-blue-600" size={24} />
              <span className="ml-2 text-xl font-bold text-gray-800">Smart Shopping</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-gray-200 p-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === 'explore'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FolderTree size={20} />
              Explore
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === 'types'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package size={20} />
              Item Types
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === 'items'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingBag size={20} />
              Items
            </button>
          </div>
        </div>

        {activeTab === 'explore' && <ExploreItems />}
        {activeTab === 'types' && <ItemTypeManager />}
        {activeTab === 'items' && <ItemManager />}
      </main>
    </div>
  );
}

export default App;