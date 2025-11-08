

export default function Box({ position, color, onClick ,rotation, scale}) {
    // colorが'red'なら不透明度0.5、それ以外は1.0
    const isRed = color === 'red';
    const opacity = isRed ? 0.5 : 1.0;
    const actualColor = isRed ? 'red' : color;
  
    return (
      <mesh rotation={rotation} position={position} onClick={onClick}>
        <boxGeometry args={[scale, scale, scale]} />
        <meshStandardMaterial 
          color={actualColor} 
          transparent={true} 
          opacity={opacity} 
        />
      </mesh>
    );
  }
  