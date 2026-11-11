const svg = (body: string) => `url("data:image/svg+xml,${encodeURIComponent(body)}")`;

export const MOTTLE = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='m' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.011' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.35'/></filter><rect width='420' height='420' filter='url(#m)'/></svg>",
);
export const BLOOM = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='b' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.017' numOctaves='2' seed='23' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 1.7 0 0 -0.62'/></filter><rect width='420' height='420' filter='url(#b)'/></svg>",
);

export const SPECKS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='s' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='41' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0 0.3  0 0 0 9 -5.6'/></filter><rect width='260' height='260' filter='url(#s)'/></svg>",
);
export const CRAZE = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='turbulence' baseFrequency='0.035 0.05' numOctaves='2' seed='13' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.25  14 0 0 0 -0.55'/></filter><rect width='360' height='360' filter='url(#c)'/></svg>",
);
