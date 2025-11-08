import { useNavigate } from 'react-router-dom';

export default function MenuButton({ backgroundcolors }) {
    const navigate = useNavigate();
    
    const ArrowRightIcon = () => {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L20 12L12 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    }
    
    if (backgroundcolors === '#c00000') {
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
                onClick={() => navigate('/')}
            >
                <ArrowRightIcon />
            </button>
        )
    }
    return null; // 条件が満たされない場合はnullを返す
}