import { useNavigate } from 'react-router-dom';
import stagesData from '../data/stages.json';

export default function NextButton({ backgroundcolors, stageIndex, isEditMode = false, onBackToEdit = null }) {
    const navigate = useNavigate();
    const TOTAL_STAGES = stagesData.stages.length; // JSONから総ステージ数を取得
    
    const ArrowRightIcon = () => {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L20 12L12 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    }
    
    if (backgroundcolors === '#c00000') {
        // 編集モードの場合は「編集に戻る」ボタン
        if (isEditMode && onBackToEdit) {
            return (
                <button 
                    style={{ 
                        color: 'white', 
                        position: 'absolute', 
                        bottom: '50%', 
                        right: 40,
                        background: 'rgba(52, 152, 219, 0.8)',
                        border: '2px solid white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                    onClick={onBackToEdit}
                >
                    編集に戻る
                </button>
            )
        }
        
        // 通常モードの場合
        const isLastStage = stageIndex >= TOTAL_STAGES - 1;
        
        return (
            <button 
                style={{ 
                    color: 'white', 
                    position: 'absolute', 
                    bottom: '50%', 
                    right: 40,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px'
                }}
                onClick={() => isLastStage ? navigate('/') : navigate(`/game/${stageIndex + 1}`)}
            >
                <ArrowRightIcon />
            </button>
        )
    }
    return null; // 条件が満たされない場合はnullを返す
}