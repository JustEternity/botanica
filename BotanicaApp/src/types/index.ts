export type Table = {
  id: string;
  number: number;
  isAvailable: boolean;
  position: { x: number; y: number };
};

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