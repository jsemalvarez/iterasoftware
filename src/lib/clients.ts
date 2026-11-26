/**
 * Clientes que pasan en la cinta de la landing.
 * Los logos van en /public/clientes, con fondo transparente y su tamaño real en
 * `logo` (para reservar el espacio). Se pintan enteros en gris, sin importar sus
 * colores, porque solo se usa su silueta. Sin logo se muestra el nombre.
 */
export type Client = {
  name: string;
  sector: string;
  url: string;
  logo?: { src: string; width: number; height: number };
};

export const clients: Client[] = [
  {
    name: "Tecvol",
    sector: "Ingeniería electromecánica",
    url: "https://tecvol.com.ar/",
    logo: { src: "/clientes/tecvol.png", width: 1600, height: 379 },
  },
];
