// AmmoDot.jsx
import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

export default function AmmoDot({
  used,            // 使ったら true
  size = 12,       // 図形サイズ(px)
  rim = 2.3,         // 白い縁の太さ(px)
  duration = 1, // アニメ時間(秒)
}) {
  const R = size / 2;
  const holeR = used ? Math.max(0, R - rim) : 0; // 黒円の目標半径（=中心から広がる）
  const preferReduce = useReducedMotion();
  const maskId = useId(); // 一意なIDを生成

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {/* マスク定義：白い部分が表示、黒い部分が透明 */}
        <mask id={maskId}>
          {/* 全体を白（すべて表示） */}
          <rect width={size} height={size} fill="#fff" />
          
          {/* 中心から広がる黒（穴になる部分） */}
          <motion.circle
            cx={R}
            cy={R}
            initial={false}
            animate={{ r: holeR, opacity: used ? 1 : 0 }}
            transition={
              preferReduce ? { duration: 0 } :
              { duration, ease: [0.2, 0.8, 0.2, 1] }
            }
            fill="#000"
          />
        </mask>
      </defs>

      {/* ベース：白塗り（マスクを適用） */}
      <circle 
        cx={R} 
        cy={R} 
        r={R} 
        fill="#fff" 
        mask={`url(#${maskId})`}
      />

      {/* 外周の白い縁（常に表示） */}
      <circle
        cx={R}
        cy={R}
        r={R - rim / 2}
        fill="none"
        stroke="#fff"
        strokeWidth={rim}
      />
    </svg>
  );
}
