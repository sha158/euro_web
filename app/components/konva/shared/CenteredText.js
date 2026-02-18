import React, { useRef, useEffect, useState } from 'react';
import { Text } from 'react-konva';

export default function CenteredText({
    x,
    y,
    text,
    fontSize = 11,
    fill = '#64748b',
    fontStyle = '600',
    fontFamily = 'Inter, sans-serif',
    isOutside = false,
    listening = false,
    opacity = 1,
}) {
    const ref = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (ref.current) {
            setOffset({
                x: ref.current.width() / 2,
                y: ref.current.height() / 2,
            });
        }
    }, [text, fontSize, fontFamily, fontStyle]);

    return (
        <Text
            ref={ref}
            text={String(text)}
            x={x}
            y={y}
            fontSize={fontSize}
            fill={fill}
            fontStyle={fontStyle}
            fontFamily={fontFamily}
            offsetX={offset.x}
            offsetY={offset.y}
            scaleX={isOutside ? -1 : 1}
            listening={listening}
            opacity={opacity}
        />
    );
}
