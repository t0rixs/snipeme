import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Google(){
  const supabase = createClient(
    'https://gicbfwkvmcsutapnjisi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpY2Jmd2t2bWNzdXRhcG5qaXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTI1MTQsImV4cCI6MjA3ODA4ODUxNH0.hZrRm0JtNSCfJ0CFWBvMTwUc8P9ooVMaRdMkWJheDB8'
  );
  
  useEffect(() => {
    document.title = 'Google認証画面';
  }, []);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '20px'
      }}>
        <main style={{
          width: '100%',
          maxWidth: '600px',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>
              Google認証
            </h2>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
            />
          </div>
        </main>
      </div>
    </>
  )
}

