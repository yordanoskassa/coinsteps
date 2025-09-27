import React, { useMemo } from 'react';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';

type Point = { x: number; y: number };

interface Props {
  width?: number;
  height?: number;
  data: Point[];
  stroke?: string;
  fill?: string;
}

export default function MiniAreaChart({ width = 320, height = 160, data, stroke = '#7C5CFF', fill = 'rgba(124,92,255,0.25)' }: Props) {
  const { path, area } = useMemo(() => {
    if (data.length === 0) return { path: '', area: '' };
    const maxX = Math.max(...data.map((d) => d.x));
    const maxY = Math.max(...data.map((d) => d.y));
    const px = (x: number) => (x / (maxX || 1)) * (width - 20) + 10; // padding 10
    const py = (y: number) => height - (y / (maxY || 1)) * (height - 20) - 10; // padding 10

    const to = (p: Point) => `${px(p.x)},${py(p.y)}`;

    let d = `M ${to(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const p = data[i - 1];
      const c = data[i];
      // simple smoothing using midpoint
      const mx = (px(p.x) + px(c.x)) / 2;
      d += ` C ${mx},${py(p.y)} ${mx},${py(c.y)} ${px(c.x)},${py(c.y)}`;
    }

    let a = `${d} L ${px(data[data.length - 1].x)},${height - 10} L ${px(data[0].x)},${height - 10} Z`;
    return { path: d, area: a };
  }, [data, width, height]);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={fill} />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#fillGrad)" />
      <Path d={path} stroke={stroke} strokeWidth={2} fill="none" />
    </Svg>
  );
}
