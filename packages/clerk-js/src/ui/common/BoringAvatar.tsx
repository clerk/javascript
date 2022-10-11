/**
    This module was extracted from the boring-avatars library (https://github.com/boringdesigners/boring-avatars)
    MIT License, Copyright (c) 2021 boringdesigners
 */

const ELEMENTS = 3;
const SIZE = 80;

export const hashCode = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const character = name.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getDigit = (number: number, ntn: number) => {
  return Math.floor((number / Math.pow(10, ntn)) % 10);
};

export const getUnit = (number: number, range: number, index?: number) => {
  const value = number % range;

  if (index && getDigit(number, index) % 2 === 0) {
    return -value;
  } else {
    return value;
  }
};

export const getRandomColor = (number: number, colors: string[], range: number) => {
  return colors[number % range];
};

function generateColors(name: string, colors: string[]) {
  const numFromName = hashCode(name);
  const range = colors && colors.length;

  const elementsProperties = Array.from({ length: ELEMENTS }, (_, i) => ({
    color: getRandomColor(numFromName + i, colors, range),
    translateX: getUnit(numFromName * (i + 1), SIZE / 10, 1),
    translateY: getUnit(numFromName * (i + 1), SIZE / 10, 2),
    scale: 1.2 + getUnit(numFromName * (i + 1), SIZE / 20) / 10,
    rotate: getUnit(numFromName * (i + 1), 360, 1),
  }));

  return elementsProperties;
}

type AvatarProps = {
  colors: string[];
  name: string;
  square: boolean;
  title: boolean;
  size: string;
};

const AvatarMarble = (props: AvatarProps) => {
  const properties = generateColors(props.name, props.colors);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill='none'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      width={props.size}
      height={props.size}
    >
      {props.title && <title>{props.name}</title>}
      <mask
        id='mask__marble'
        maskUnits='userSpaceOnUse'
        x={0}
        y={0}
        width={SIZE}
        height={SIZE}
      >
        <rect
          width={SIZE}
          height={SIZE}
          rx={props.square ? undefined : SIZE * 2}
          fill='#FFFFFF'
        />
      </mask>
      <g mask='url(#mask__marble)'>
        <rect
          width={SIZE}
          height={SIZE}
          fill={properties[0].color}
        />
        <path
          filter='url(#prefix__filter0_f)'
          d='M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z'
          fill={properties[1].color}
          transform={`translate(${properties[1].translateX} ${properties[1].translateY}) rotate(${
            properties[1].rotate
          } ${SIZE / 2} ${SIZE / 2}) scale(${properties[2].scale})`}
        />
        <path
          filter='url(#prefix__filter0_f)'
          style={{
            mixBlendMode: 'overlay',
          }}
          d='M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z'
          fill={properties[2].color}
          transform={`translate(${properties[2].translateX} ${properties[2].translateY}) rotate(${
            properties[2].rotate
          } ${SIZE / 2} ${SIZE / 2}) scale(${properties[2].scale})`}
        />
      </g>
      <defs>
        <filter
          id='prefix__filter0_f'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood
            floodOpacity={0}
            result='BackgroundImageFix'
          />
          <feBlend
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <feGaussianBlur
            stdDeviation={7}
            result='effect1_foregroundBlur'
          />
        </filter>
      </defs>
    </svg>
  );
};

export const BoringAvatar = ({
  colors = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
  name = '',
  square = false,
  title = false,
  size = '40px',
  ...props
}) => {
  const avatarProps = { colors, name, title, size, square, ...props };

  return <AvatarMarble {...avatarProps} />;
};
