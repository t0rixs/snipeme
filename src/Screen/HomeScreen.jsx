import StageButton from '../objects/StageButton';

function HomeScreen() {
    // ステージの定義（App.jsx のステージ数に合わせて自動生成）
    const stages = [
        { index: 0, label: 'Stage 1' },
        { index: 1, label: 'Stage 2' },
        { index: 2, label: 'Stage 3' }
    ];
    
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
            <h1 style={{ 
                color: 'white', 
                fontSize: '48px',
                marginBottom: '40px',
                fontWeight: 'bold'
            }}>
                Snipe me
            </h1>
            
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
            </div>
        </div>
    )
}

export default HomeScreen;