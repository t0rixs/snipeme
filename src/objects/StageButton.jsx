import { useNavigate } from 'react-router-dom';

export default function StageButton({ stageIndex, label, style = {} }) {
    const navigate = useNavigate();
    
    const defaultStyle = {
        margin: '10px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#4a90e2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        minWidth: '120px',
        fontWeight: '500',
        ...style
    };

    const handleMouseEnter = (e) => {
        e.target.style.backgroundColor = '#357abd';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    };

    const handleMouseLeave = (e) => {
        e.target.style.backgroundColor = style.backgroundColor || '#4a90e2';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <button 
            onClick={() => navigate(`/game/${stageIndex}`)} 
            style={defaultStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {label}
        </button>
    );
}

