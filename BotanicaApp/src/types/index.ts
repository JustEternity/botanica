export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

export type MenuSection = {
  id: string;
  title: string;
  data: MenuItem[];
};

export interface Table {
  id: string;
  number: number;
  isAvailable: boolean;
  position: {
    x: number;
    y: number;
  };
  description?: string;
  maxPeople?: number;
}