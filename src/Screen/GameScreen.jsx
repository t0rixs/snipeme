import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Box from '../objects/box';
import ResetButton from '../objects/tx-reset';
import AmmoHUD from '../objects/AmmoHUD';
import MenuButton from '../objects/MenuButton';

// シーン内のコンポーネント（レイキャスト処理）
function Scene({ positions, colors, handleClick, onShot, shotLines, boxrotation, boxscale }) {
    const { camera, scene, raycaster, gl } = useThree();
  
    useEffect(() => {
      const handleCanvasClick = (event) => {
        // Canvas要素の境界を取得
        const rect = gl.domElement.getBoundingClientRect();
        
        // マウス位置を正規化座標系に変換 (-1 ~ +1)
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
        // レイキャスターを設定
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  
        // カメラの位置（ワールド座標）
        const origin = camera.position.clone();
  
        // 交差判定（全てのオブジェクトを取得）
        const intersects = raycaster.intersectObjects(scene.children, true);
  
        // 貫通するラインのポイント配列を作成
        const linePoints = [origin.toArray()];
        const hitNormals = [];
  
        if (intersects.length > 0) {
          // 全ての交差点を追加（貫通）
          intersects.forEach((hit) => {
            const point = hit.point;
            linePoints.push(point.toArray());
  
            // 法線を取得してワールド座標系に変換
            if (hit.face) {
              const normal = hit.face.normal.clone();
              const worldNormal = normal.transformDirection(hit.object.matrixWorld);
              hitNormals.push({
                position: point.toArray(),
                direction: worldNormal.toArray(),
              });
            }
          });
  
          // 最後の交差点から先へ延長
          const direction = raycaster.ray.direction.clone();
          const lastPoint = new THREE.Vector3().fromArray(linePoints[linePoints.length - 1]);
          const endPoint = lastPoint.clone().add(direction.multiplyScalar(50));
          linePoints.push(endPoint.toArray());
        } else {
          // 何にも当たらなかった場合、遠くの点を計算
          const direction = raycaster.ray.direction.clone();
          const endPoint = origin.clone().add(direction.multiplyScalar(100));
          linePoints.push(endPoint.toArray());
        }
  
        // ラインデータを送信
        onShot({
          id: Date.now(),
          points: linePoints,
          normals: hitNormals,
        });
      };
  
      gl.domElement.addEventListener('click', handleCanvasClick);
      return () => gl.domElement.removeEventListener('click', handleCanvasClick);
    }, [camera, scene, raycaster, gl, onShot]);
  
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {positions.map((position, index) => (
          <Box
            key={index}
            position={position}
            color={colors[index]}
            onClick={() => handleClick(index)}
            rotation={boxrotation}
            scale={boxscale}
          />
        ))}
        {/* ショットラインを表示 */}
        {shotLines.map((line) => (
          <group key={line.id}>
            {/* メインライン（貫通ライン）*/}
            <Line
              points={line.points}
              color="yellow"
              lineWidth={3}
            />
          </group>
        ))}
      </>
    );
  }
  
  export default function GameComponent({positions, baseshot, boxrotation, boxscale}) {

    const DRAG_THRESHOLD = 5; // ピクセル単位の閾値
  
    const [colors, setColors] = useState(
      positions.map(() => 'royalblue')
    );
  
    const [backgroundcolors, setBackgroundcolors] = useState('black');
    const [shotRemaining, setShotRemaining] = useState(baseshot);
    const [shotLines, setShotLines] = useState([]); // 撃ったラインを保存
    
    const pointerDownPos = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);
  
    useEffect(() => {
      if (colors.every((c) => c === 'red')) {
        // 成功：全て赤
        setBackgroundcolors('#c00000');
      } else if (shotRemaining === 0 && colors.some((c) => c !== 'red')) {
        // 失敗：弾切れで赤でないボックスが残っている
        setBackgroundcolors('royalblue');
      } else {
        // 通常状態
        setBackgroundcolors('black');
      }
    }, [colors, shotRemaining, baseshot]);
  
    // Rキーでリセット
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'r' || e.key === 'R') {
          resetColors();
          setShotRemaining(baseshot);
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [baseshot]);
  
    const handlePointerDown = (e) => {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      isDragging.current = false;
    };
  
    const handlePointerMove = (e) => {
      if (pointerDownPos.current.x === 0 && pointerDownPos.current.y === 0) return;
      
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > DRAG_THRESHOLD) {
        isDragging.current = true;
      }
    };
  
    const handleClick = (index) => {
      if (isDragging.current) return;
      if (shotRemaining <= 0) return;
  
      setColors((prev) => {
        const next = prev.map((c, i) => (i === index ? 'red' : c));
        return next;
      });
    };
  
    const clickShot = () => {
      if (isDragging.current) return;
      setShotRemaining((v) => Math.max(v - 1, 0));
    };
  
    const handleShot = (lineData) => {
      if (isDragging.current) return;
      if (shotRemaining <= 0) return;
      
      // ラインを追加（2秒後に消える）
      setShotLines((prev) => [...prev, lineData]);
      setTimeout(() => {
        setShotLines((prev) => prev.filter((line) => line.id !== lineData.id));
      }, 20000000);
    };
  
    const resetColors = () => {
      setColors(positions.map(() => 'royalblue'));
      setShotLines([]); // ラインもリセット
    };
  
    return (
      <div 
        style={{ width: '100vw', height: '100vh', background: '#111', position: 'relative' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <Canvas
          camera={{ position: [3, 3, 3], fov: 50 }}
          style={{ cursor: 'crosshair', background: backgroundcolors }}
          onClick={() => {clickShot()}}
        >
          <Scene 
            positions={positions}
            colors={colors}
            handleClick={handleClick}
            onShot={handleShot}
            shotLines={shotLines}
            boxrotation={boxrotation}
            boxscale={boxscale}
          />
          <OrbitControls
            enablePan={false}      // 移動を無効化
            enableZoom={false}     // 拡大縮小を無効化
           />
        </Canvas>
        {/* <ResetButton shotRemaining={shotRemaining} backgroundcolors={backgroundcolors}/> */}
        <MenuButton backgroundcolors={backgroundcolors}/>
        <AmmoHUD current={shotRemaining} max={baseshot} />
      </div>
    );
  }