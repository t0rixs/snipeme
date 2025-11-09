import { useNavigate } from 'react-router-dom';
import StageButton from '../objects/StageButton';
import logo from '../assets/logo.png';
import stagesData from '../data/stages.json';

function HomeScreen() {
    const navigate = useNavigate();
    
    // JSONからステージ数を自動生成
    const stages = stagesData.stages.map((stage, index) => ({
        index: index,
        label: `${index + 1}`
    }));
    
    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <img 
                src={logo} 
                alt="Snipe me" 
                style={{ 
                    maxWidth: '400px', 
                    width: '80%',
                    height: 'auto',
                    marginBottom: '40px'
                }} 
            />
            
            <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                justifyContent: 'center',
                maxWidth: '600px'
            }}>
                {stages.map(stage => (
                    <StageButton 
                        key={stage.index}
                        stageIndex={stage.index}
                        label={stage.label}
                    />
                ))}
                <button 
                    onClick={() => navigate('/make')}
                    style={{
                        margin: '10px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#e67e22',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        minWidth: '120px',
                        fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#d35400';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e67e22';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    ステージ作成
                </button>
            </div>
        </div>
    )
}

export default HomeScreen;