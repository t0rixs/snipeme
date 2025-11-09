import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { useState, useRef } from 'react';
import Box from '../objects/box';
import GameScreen from './GameScreen';

function EditableBox({ position, rotation, boxType, isSelected, onSelect, onTransform }) {
  const meshRef = useRef();

  const getColor = (type) => {
    if (type === 'ref') return 'white';
    if (type === 'blc') return '#666666';
    if (type === 'bref') return 'white';
    if (type === 'bblc') return '#666666';
    if (type === 'prism') return 'white';
    if (type === 2) return 'purple';
    return 'royalblue';
  };

  const isWireframe = boxType === 'bref' || boxType === 'bblc';
  const isPrism = boxType === 'prism';

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={getColor(boxType)}
          transparent={isSelected || isPrism}
          opacity={isSelected ? 0.7 : isPrism ? 0.3 : 1}
          wireframe={isWireframe}
        />
      </mesh>
      {isSelected && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          onObjectChange={(e) => {
            if (meshRef.current) {
              onTransform({
                position: meshRef.current.position.toArray(),
                rotation: meshRef.current.rotation.toArray().slice(0, 3),
              });
            }
          }}
        />
      )}
    </group>
  );
}

function MakeScreen() {
  const [boxes, setBoxes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [baseshot, setBaseshot] = useState(1);
  const [cameraFov, setCameraFov] = useState(50);
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  const addBox = (type) => {
    const newBox = {
      id: Date.now(),
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      boxType: type,
    };
    setBoxes([...boxes, newBox]);
  };

  const removeSelectedBox = () => {
    if (selectedIndex !== null) {
      setBoxes(boxes.filter((_, i) => i !== selectedIndex));
      setSelectedIndex(null);
    }
  };

  const updateBox = (index, updates) => {
    setBoxes(
      boxes.map((box, i) => (i === index ? { ...box, ...updates } : box))
    );
  };

  const exportJSON = () => {
    const stageData = {
      id: 0,
      name: 'Custom Stage',
      positions: boxes.map((box) => box.position),
      baseshot: baseshot,
      boxrotation: [0, 0, 0],
      cameraFov: cameraFov,
      boxTypes: boxes.map((box) => box.boxType),
    };

    const jsonStr = JSON.stringify(stageData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stage.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  // テストプレイ中はGameScreenを表示
  if (isTestPlaying) {
    return (
      <GameScreen
        positions={boxes.map((box) => box.position)}
        baseshot={baseshot}
        boxrotation={[0, 0, 0]}
        cameraFov={cameraFov}
        boxTypes={boxes.map((box) => box.boxType)}
        stageIndex={-1}
        isEditMode={true}
        onBackToEdit={() => setIsTestPlaying(false)}
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 左側パネル */}
      <div
        style={{
          width: '300px',
          backgroundColor: '#2a2a2a',
          color: 'white',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>ステージエディタ</h2>

        {/* ブロック追加 */}
        <div style={{ marginBottom: '20px' }}>
          <h3>ブロックを追加</h3>
          <button
            style={{ ...buttonStyle, backgroundColor: 'royalblue' }}
            onClick={() => addBox(1)}
          >
            通常 (1発)
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: 'purple' }}
            onClick={() => addBox(2)}
          >
            強化 (2発)
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: 'white', color: 'black' }}
            onClick={() => addBox('ref')}
          >
            反射
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: '#666666' }}
            onClick={() => addBox('blc')}
          >
            停止
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
            onClick={() => addBox('bref')}
          >
            透過反射
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: '#666666', border: '1px solid #999' }}
            onClick={() => addBox('bblc')}
          >
            透過停止
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: 'rgba(255,255,255,0.5)', color: 'black', border: '2px solid #fff' }}
            onClick={() => addBox('prism')}
          >
            プリズム
          </button>
        </div>

        {/* 残弾数 */}
        <div style={{ marginBottom: '20px' }}>
          <h3>残弾数</h3>
          <input
            type="range"
            min="1"
            max="10"
            value={baseshot}
            onChange={(e) => setBaseshot(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <input
            type="number"
            value={baseshot}
            onChange={(e) => setBaseshot(parseInt(e.target.value))}
            style={{ width: '60px', marginLeft: '10px' }}
          />
        </div>

        {/* カメラズーム (FOV) */}
        <div style={{ marginBottom: '20px' }}>
          <h3>カメラズーム (FOV)</h3>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
            小さい値 = ズームイン、大きい値 = ズームアウト
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="1"
            value={cameraFov}
            onChange={(e) => setCameraFov(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <input
            type="number"
            value={cameraFov}
            step="1"
            min="10"
            max="120"
            onChange={(e) => setCameraFov(parseFloat(e.target.value))}
            style={{ width: '60px', marginLeft: '10px' }}
          />
        </div>

        {/* 選択中のボックスの位置調整 */}
        {selectedIndex !== null && boxes[selectedIndex] && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#3a3a3a', borderRadius: '4px' }}>
            <h3>選択中のブロック位置</h3>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '30px' }}>X: </label>
              <input
                type="number"
                step="0.1"
                value={boxes[selectedIndex].position[0]}
                onChange={(e) => {
                  const newPosition = [...boxes[selectedIndex].position];
                  newPosition[0] = parseFloat(e.target.value) || 0;
                  updateBox(selectedIndex, { position: newPosition });
                }}
                style={{ width: '80px', padding: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'inline-block', width: '30px' }}>Y: </label>
              <input
                type="number"
                step="0.1"
                value={boxes[selectedIndex].position[1]}
                onChange={(e) => {
                  const newPosition = [...boxes[selectedIndex].position];
                  newPosition[1] = parseFloat(e.target.value) || 0;
                  updateBox(selectedIndex, { position: newPosition });
                }}
                style={{ width: '80px', padding: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'inline-block', width: '30px' }}>Z: </label>
              <input
                type="number"
                step="0.1"
                value={boxes[selectedIndex].position[2]}
                onChange={(e) => {
                  const newPosition = [...boxes[selectedIndex].position];
                  newPosition[2] = parseFloat(e.target.value) || 0;
                  updateBox(selectedIndex, { position: newPosition });
                }}
                style={{ width: '80px', padding: '4px' }}
              />
            </div>
          </div>
        )}

        {/* ボックスリスト */}
        <div style={{ marginBottom: '20px' }}>
          <h3>配置済みブロック ({boxes.length})</h3>
          {boxes.map((box, index) => (
            <div
              key={box.id}
              style={{
                padding: '8px',
                margin: '4px 0',
                backgroundColor:
                  selectedIndex === index ? '#4a4a4a' : '#3a3a3a',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedIndex(index)}
            >
              <div>
                ブロック {index + 1} -{' '}
                {typeof box.boxType === 'number'
                  ? `${box.boxType}発`
                  : box.boxType === 'ref'
                  ? '反射'
                  : box.boxType === 'blc'
                  ? '停止'
                  : box.boxType === 'bref'
                  ? '透過反射'
                  : box.boxType === 'bblc'
                  ? '透過停止'
                  : box.boxType === 'prism'
                  ? 'プリズム'
                  : '不明'}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>
                位置: [{box.position.map((v) => v.toFixed(1)).join(', ')}]
              </div>
            </div>
          ))}
        </div>

        {/* 操作ボタン */}
        <div style={{ marginBottom: '20px' }}>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: '#3498db',
              width: '100%',
            }}
            onClick={() => setIsTestPlaying(true)}
            disabled={boxes.length === 0}
          >
            🎮 テストプレイ
          </button>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: '#e74c3c',
              width: '100%',
              marginTop: '10px',
            }}
            onClick={removeSelectedBox}
            disabled={selectedIndex === null}
          >
            選択中のブロックを削除
          </button>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: '#27ae60',
              width: '100%',
              marginTop: '10px',
            }}
            onClick={exportJSON}
            disabled={boxes.length === 0}
          >
            JSONをエクスポート
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>
          <p>💡 ヒント:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>ブロックをクリックして選択</li>
            <li>矢印をドラッグして移動</li>
            <li>マウスで視点を回転</li>
          </ul>
        </div>
      </div>

      {/* 右側3Dビュー */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [5, 5, 5], fov: cameraFov }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <gridHelper args={[10, 10]} />
          <axesHelper args={[5]} />

          {boxes.map((box, index) => (
            <EditableBox
              key={box.id}
              position={box.position}
              rotation={box.rotation}
              boxType={box.boxType}
              isSelected={selectedIndex === index}
              onSelect={() => setSelectedIndex(index)}
              onTransform={(updates) => updateBox(index, updates)}
            />
          ))}

          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}

export default MakeScreen;