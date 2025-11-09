import { useNavigate } from 'react-router-dom';

export function MenuBackButton({ backgroundcolors }) {
    const navigate = useNavigate();
    
    const ArrowLeftIcon = () => {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L12 12L20 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    }
    
    if (backgroundcolors !== '#c00000') {
        return (
            <button 
                style={{ 
                    color: 'white', 
                    position: 'absolute', 
                    bottom: '50%', 
                    left: 40,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px'
                }}
                onClick={() => navigate('/')}
            >
                <ArrowLeftIcon />
            </button>
        )
    }
    return null; // 条件が満たされない場合はnullを返す
}
