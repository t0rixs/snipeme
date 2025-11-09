import { useNavigate } from 'react-router-dom';

export default function PauseMenu({ isOpen, onClose, isEditMode = false, onBackToEdit = null }) {
    const navigate = useNavigate();
    
    if (!isOpen) return null;
    
    const handleBackdropClick = (e) => {
        // 背景をクリックした場合のみメニューを閉じる
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    const menuButtonStyle = {
        width: '100%',
        padding: '15px 30px',
        fontSize: '18px',
        fontWeight: '500',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        marginBottom: '15px',
        backdropFilter: 'blur(5px)'
    };
    
    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease'
            }}
            onClick={handleBackdropClick}
        >
            <div style={{
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                padding: '40px',
                borderRadius: '16px',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'slideIn 0.3s ease'
            }}>
                <h2 style={{
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                }}>
                    MENU
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button 
                        style={menuButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={onClose}
                    >
                        再開
                    </button>
                    
                    <button 
                        style={menuButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={() => window.location.reload()}
                    >
                        リスタート
                    </button>
                    
                    <button 
                        style={menuButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                        onClick={() => {
                            if (isEditMode && onBackToEdit) {
                                onBackToEdit();
                            } else {
                                navigate('/');
                            }
                        }}
                    >
                        {isEditMode ? '編集に戻る' : 'ステージ選択'}
                    </button>
                </div>
                
                <p style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '14px'
                }}>
                    Rキーでリセット
                </p>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

