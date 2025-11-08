import { Routes, Route, useParams } from 'react-router-dom';
import GameScreen from './GameScreen';
import HomeScreen from './HomeScreen';

function GameScreenWrapper() {
  const { stage } = useParams();
  const stageIndex = parseInt(stage);
  
  const positions = [
    [[0,0,0]],
    [[1,1,1],[1,2,0],[3,1,0],[0,0,1]],
    [[0,0,0],[1,0,0],[0,1,0],[0,0,1]]
  ];

  const baseshot = [1,2,1];
  const boxrotation = [[0,0,0],[180,30,0],[0,60,90]];
  const boxscale = [1,1,1];
    
  // 座標を正規化する関数（各軸の中心が0になるように調整）
  const normalizePositions = (posArray) => {
    if (!posArray || posArray.length === 0) return posArray;
    
    // 各軸（x, y, z）の最小値と最大値を求める
    const xValues = posArray.map(pos => pos[0]);
    const yValues = posArray.map(pos => pos[1]);
    const zValues = posArray.map(pos => pos[2]);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    
    // 各軸の中心値を計算
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const zCenter = (zMin + zMax) / 2;
    
    // 中心が0になるように全ての座標を調整
    return posArray.map(pos => [
      pos[0] - xCenter,
      pos[1] - yCenter,
      pos[2] - zCenter
    ]);
  };
  
  return (
    <GameScreen 
      positions={normalizePositions(positions[stageIndex])} 
      baseshot={baseshot[stageIndex]} 
      boxrotation={boxrotation[stageIndex]} 
      boxscale={boxscale[stageIndex]} 
    />
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game/:stage" element={<GameScreenWrapper />} />
      </Routes>
    </div>
  );
}
