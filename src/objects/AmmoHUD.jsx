// AmmoHUD.jsx
import AmmoDot from "./Ammodot.jsx";

export default function AmmoHUD({ current, max }) {
  const usedCount = max - current; // 使用済みの弾数
  
  return (
    <div style={{ 
      position: "absolute",
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex", 
      gap: 8,
      pointerEvents: "none", // クリックイベントを透過
      zIndex: 100
    }}>
      {Array.from({ length: max }).map((_, i) => (
        <AmmoDot key={i} used={i < usedCount} />
      ))}
    </div>
  );
}