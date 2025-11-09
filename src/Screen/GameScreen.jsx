import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Box from '../objects/box';
import AmmoHUD from '../objects/AmmoHUD';
import NextButton from '../objects/NextButton';
import PauseMenu from '../objects/PauseMenu';

// シーン内のコンポーネント（レイキャスト処理）
function Scene({ positions, colors, onShot, shotLines, boxrotation, boxTypes }) {
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
        const initialOrigin = camera.position.clone();
        const initialDirection = raycaster.ray.direction.clone();
  
        // 全てのラインとヒット情報を収集
        const allLines = [];
        const allLineHits = []; // 各線が当たったブロックのリスト
        const passedBoxIndices = [];
        
        // 初期状態マップを作成（boxIndexをキーに、現在のboxTypeを値に）
        const initialBoxStates = new Map(
          boxTypes.map((type, index) => [index, type])
        );
        
        // 再帰的にレイを追跡する関数（boxStatesマップと、この線のヒットリストを追加）
        const traceRay = (origin, direction, depth, currentLinePoints, boxStates, lineHitIndices) => {
          if (depth > 12) return; // 最大深度
          
          raycaster.set(origin, direction);
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          if (intersects.length === 0) {
            // 何にも当たらなかった場合
            const endPoint = origin.clone().add(direction.clone().multiplyScalar(100));
            currentLinePoints.push(endPoint.toArray());
            allLines.push([...currentLinePoints]);
            allLineHits.push([...lineHitIndices]); // この線が当たったブロックを記録
            return;
          }
          
          const hit = intersects[0];
          const point = hit.point;
          const boxIndex = hit.object.userData?.index;
          
          // 重要: boxStatesマップから現在の状態を取得（動的に変化する）
          const boxType = boxIndex !== undefined 
            ? boxStates.get(boxIndex) 
            : hit.object.userData?.boxType;
  
          currentLinePoints.push(point.toArray());
          
          // 透過ブロック（bref, bblc）の処理
          const isPassThroughBlock = boxType === 'bref' || boxType === 'bblc';
          
          if (isPassThroughBlock) {
            if (boxIndex !== undefined) {
              passedBoxIndices.push(boxIndex);
              
              // 重要: 状態を更新（新しいMapを作成して状態遷移を記録）
              const newBoxStates = new Map(boxStates);
              if (boxType === 'bref') {
                newBoxStates.set(boxIndex, 'ref'); // 透明白 → 白
              } else if (boxType === 'bblc') {
                newBoxStates.set(boxIndex, 'blc'); // 透明灰 → 灰
              }
              
              const newOrigin = point.clone().add(direction.clone().multiplyScalar(0.01));
              // 更新された状態マップを渡す
              traceRay(newOrigin, direction, depth + 1, currentLinePoints, newBoxStates, lineHitIndices);
            } else {
              const newOrigin = point.clone().add(direction.clone().multiplyScalar(0.01));
              traceRay(newOrigin, direction, depth + 1, currentLinePoints, boxStates, lineHitIndices);
            }
            return;
          }
          
          // プリズムブロックの処理（反射と貫通の両方）
          if (boxType === 'prism') {
            if (hit.face) {
              const normal = hit.face.normal.clone();
              const worldNormal = normal.transformDirection(hit.object.matrixWorld);
              
              // 反射線を追跡（新しい線なので、現在のヒットリストをコピー）
              const incident = direction.clone();
              const reflectDir = incident.reflect(worldNormal);
              const reflectOrigin = point.clone().add(reflectDir.clone().multiplyScalar(0.01));
              traceRay(reflectOrigin, reflectDir, depth + 1, [...currentLinePoints], boxStates, [...lineHitIndices]);
              
              // 貫通線を追跡（新しい線なので、現在のヒットリストをコピー）
              const throughOrigin = point.clone().add(direction.clone().multiplyScalar(0.01));
              traceRay(throughOrigin, direction, depth + 1, [...currentLinePoints], boxStates, [...lineHitIndices]);
            }
            return;
          }
          
          // 通常ブロックのインデックスを記録
          if (boxIndex !== undefined && boxType !== 'ref' && boxType !== 'blc' && boxType !== 'bref' && boxType !== 'bblc' && boxType !== 'prism') {
            lineHitIndices.push(boxIndex); // この線のヒットリストに追加
          }
          
          if (hit.face) {
            const normal = hit.face.normal.clone();
            const worldNormal = normal.transformDirection(hit.object.matrixWorld);
            
            if (boxType === 'blc' || boxType === 'bblc') {
              // 停止ブロック
              allLines.push([...currentLinePoints]);
              allLineHits.push([...lineHitIndices]); // この線が当たったブロックを記録
            } else if (boxType === 'ref' || boxType === 'bref') {
              // 反射ブロック
              const incident = direction.clone();
              const reflectDir = incident.reflect(worldNormal);
              const newOrigin = point.clone().add(reflectDir.clone().multiplyScalar(0.01));
              traceRay(newOrigin, reflectDir, depth + 1, currentLinePoints, boxStates, lineHitIndices);
            } else {
              // 通常ブロック：貫通
              const newOrigin = point.clone().add(direction.clone().multiplyScalar(0.01));
              traceRay(newOrigin, direction, depth + 1, currentLinePoints, boxStates, lineHitIndices);
            }
          } else {
            allLines.push([...currentLinePoints]);
            allLineHits.push([...lineHitIndices]); // この線が当たったブロックを記録
          }
        };
        
        // 初期レイから追跡開始（初期状態マップと空のヒットリストを渡す）
        traceRay(initialOrigin, initialDirection, 0, [initialOrigin.toArray()], initialBoxStates, []);
  
        // ラインデータと当たったボックスのインデックスを送信
        onShot({
          id: Date.now(),
          lines: allLines, // 複数のライン
          lineHits: allLineHits, // 各線が当たったブロックのリスト
          passedBoxIndices: passedBoxIndices,
        });
      };
  
      gl.domElement.addEventListener('click', handleCanvasClick);
      return () => gl.domElement.removeEventListener('click', handleCanvasClick);
    }, [camera, scene, raycaster, gl, onShot, boxTypes]);
  
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {positions.map((position, index) => (
          <Box
            key={index}
            position={position}
            color={colors[index]}
            rotation={boxrotation}
            index={index}
            boxType={boxTypes[index]}
          />
        ))}
        {/* ショットラインを表示 */}
        {shotLines.map((shot) => (
          <group key={shot.id}>
            {shot.lines && shot.lines.map((linePoints, idx) => (
              <Line
                key={idx}
                points={linePoints}
                color="yellow"
                lineWidth={3}
              />
            ))}
          </group>
        ))}
      </>
    );
  }
  
export default function GameComponent({positions, baseshot, boxrotation, cameraFov = 50, boxTypes = [], stageIndex, isEditMode = false, onBackToEdit = null}) {

  const DRAG_THRESHOLD = 5; // ピクセル単位の閾値
  
  // デフォルトで全て1回（通常のbox）
  const initialTypes = boxTypes.length > 0 ? boxTypes : positions.map(() => 1);

  // ボックスタイプの状態管理（透過ブロックの遷移に使用）
  const [types, setTypes] = useState(initialTypes);

  // 各ボックスの残りヒット回数を管理（JSONの値をそのまま使用）
  const [remainingHits, setRemainingHits] = useState(
    initialTypes.map(type => typeof type === 'number' ? type : 0)
  );
  
  // 残りヒット回数とタイプから色を計算
  const getColor = (remaining, boxType) => {
    // ギミックブロック（色は固定、ヒットしても変わらない）
    if (boxType === 'ref') {
      return 'white'; // 反射ブロック
    } else if (boxType === 'blc') {
      return '#666666'; // 停止ブロック（灰色）
    } else if (boxType === 'bref') {
      return 'white'; // 透過反射ブロック（縁のみ）
    } else if (boxType === 'bblc') {
      return '#666666'; // 透過停止ブロック（縁のみ）
    } else if (boxType === 'prism') {
      return 'white'; // プリズムブロック（半透明白）
    }
    
    // 通常の破壊可能ブロック
    const maxHits = typeof boxType === 'number' ? boxType : 1;
    if (remaining === 0) {
      // 破壊完了
      return 'red';
    } else if (remaining === maxHits) {
      // 未ヒット
      return maxHits === 2 ? 'purple' : 'royalblue';
    } else {
      // ダメージ中（2回必要なboxの1回ヒット後）
      return 'royalblue';
    }
  };
  
  const colors = remainingHits.map((remaining, i) => getColor(remaining, types[i]));
  
  const [backgroundcolors, setBackgroundcolors] = useState('black');
  const [shotRemaining, setShotRemaining] = useState(baseshot);
  const [shotLines, setShotLines] = useState([]); // 撃ったラインを保存
  const [isPaused, setIsPaused] = useState(false); // ポーズメニューの表示状態
  
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  
  useEffect(() => {
    // ギミックでない通常ブロックのインデックスを取得
    const normalBoxIndices = types
      .map((type, i) => (
        type !== 'ref' && 
        type !== 'blc' && 
        type !== 'bref' && 
        type !== 'bblc' && 
        type !== 'prism' 
        ? i : -1
      ))
      .filter(i => i !== -1);
    
    // 通常ブロックが全て赤になったかチェック
    const allNormalBoxesDestroyed = normalBoxIndices.every(i => colors[i] === 'red');
    
    // 通常ブロックでまだ赤でないものがあるかチェック
    const hasUndestroyedNormalBoxes = normalBoxIndices.some(i => colors[i] !== 'red');
    
    if (normalBoxIndices.length > 0 && allNormalBoxesDestroyed) {
      // 成功：ギミックでないボックスが全て赤
      setBackgroundcolors('#c00000');
    } else if (shotRemaining === 0 && hasUndestroyedNormalBoxes) {
      // 失敗：弾切れで赤でないボックスが残っている
      setBackgroundcolors('royalblue');
    } else {
      // 通常状態
      setBackgroundcolors('black');
    }
  }, [colors, shotRemaining, types]);
  
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
  }, [baseshot, initialTypes]);

  // ESCキーでポーズメニュー
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Tab' ) {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  
  const clickShot = () => {
      if (isDragging.current) return;
      setShotRemaining((v) => Math.max(v - 1, 0));
    };
  
  const handleShot = (lineData) => {
    if (isDragging.current) return;
    if (shotRemaining <= 0) return;
    
    // 全ての線のヒットを1つの配列に集める
    const allHits = [];
    if (lineData.lineHits) {
      lineData.lineHits.forEach((lineHits) => {
        // この線が当たった全てのブロックをallHitsに追加
        allHits.push(...lineHits);
      });
    }
    
    // ラインを追加(無期限)
    setShotLines((prev) => [...prev, lineData]);
    
    // 透過ブロックの状態を遷移（カウンターを使わずに現在の状態から次の状態へ）
    if (lineData.passedBoxIndices && lineData.passedBoxIndices.length > 0) {
      setTypes((prev) => {
        const next = [...prev];
        lineData.passedBoxIndices.forEach((index) => {
          const currentType = next[index];
          // 透明白 → 白、透明灰 → 灰
          if (currentType === 'bref') {
            next[index] = 'ref';
          } else if (currentType === 'bblc') {
            next[index] = 'blc';
          }
        });
        return next;
      });
    }
    
    // 通常ブロックの状態を遷移（青→赤、紫→青）
    // 配列の各要素を順番に1つずつデクリメント
    if (allHits.length > 0) {
      setRemainingHits((prev) => {
        const next = [...prev];
        // 配列の各ヒットを順番に処理
        allHits.forEach((boxIndex) => {
          if (next[boxIndex] > 0) {
            next[boxIndex] -= 1;
          }
        });
        return next;
      });
    }
  };
  
  const resetColors = () => {
    setTypes(initialTypes); // boxTypeを初期状態に戻す
    setRemainingHits(initialTypes.map(type => typeof type === 'number' ? type : 0));
    setShotLines([]); // ラインもリセット
  };
  
    return (
      <div 
        style={{ width: '100vw', height: '100vh', background: '#111', position: 'relative' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <Canvas
          camera={{ position: [3, 3, 3], fov: cameraFov }}
          style={{ cursor: 'crosshair', background: backgroundcolors }}
          onClick={() => {clickShot()}}
        >
          <Scene 
            positions={positions}
            colors={colors}
            onShot={handleShot}
            shotLines={shotLines}
            boxrotation={boxrotation}
            boxTypes={types}
          />
          <OrbitControls
            enablePan={false}      // 移動を無効化
            enableZoom={false}     // 拡大縮小を無効化
           />
      </Canvas>
      {/* <ResetButton shotRemaining={shotRemaining} backgroundcolors={backgroundcolors}/> */}
      <NextButton 
        backgroundcolors={backgroundcolors} 
        stageIndex={stageIndex} 
        isEditMode={isEditMode}
        onBackToEdit={onBackToEdit}
      />
      {/* <MenuBackButton backgroundcolors={backgroundcolors}/> */}
      <AmmoHUD current={shotRemaining} max={baseshot} />
      <PauseMenu 
        isOpen={isPaused} 
        onClose={() => setIsPaused(false)} 
        isEditMode={isEditMode}
        onBackToEdit={onBackToEdit}
      />
    </div>
  );
}