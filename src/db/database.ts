import Dexie, { Table } from 'dexie';

export interface ItemType {
  id?: number;
  name: string;
  description: string;
}

export interface Item {
  id?: number;
  typeId: number;
  name: string;
  price: number;
  description: string;
}

export interface CartItem {
  id?: number;
  itemId: number;
  quantity: number;
  name: string;
  price: number;
}

export class ShoppingDatabase extends Dexie {
  itemTypes!: Table<ItemType>;
  items!: Table<Item>;
  cartItems!: Table<CartItem>;

  constructor() {
    super('ShoppingDB');
    this.version(1).stores({
      itemTypes: '++id, name',
      items: '++id, typeId, name',
      cartItems: '++id, itemId'
    });
  }
}

export const db = new ShoppingDatabase();