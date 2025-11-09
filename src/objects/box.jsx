

export default function Box({ position, color, onClick, rotation, index, boxType }) {
    // colorが'red'なら不透明度0.5、それ以外は1.0
    const isRed = color === 'red';
    let opacity = isRed ? 0.5 : 1.0;
    const actualColor = isRed ? 'red' : color;
    
    // 透過ブロック（bref, bblc）はwireframeで表示
    const isWireframe = boxType === 'bref' || boxType === 'bblc';
    
    // プリズムブロックは半透明
    if (boxType === 'prism') {
      opacity = 0.3;
    }
  
    return (
      <mesh 
        rotation={rotation} 
        position={position} 
        onClick={onClick}
        userData={{ index, boxType }} // インデックスとタイプを保存
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={actualColor} 
          transparent={true} 
          opacity={opacity}
          wireframe={isWireframe}
        />
      </mesh>
    );
  }
  