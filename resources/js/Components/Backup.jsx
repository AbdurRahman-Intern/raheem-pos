import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function BackupManager() {
    // Access session flash feedback variables coming back from Laravel
    const { flash } = usePage().props;

    // Use the native Inertia form handling state engine
    const { data, setData, post, processing, reset } = useForm({
        backup_file: null,
    });

    // The explicit handler executing the file download
    const triggerExport = (e) => {
        e.preventDefault();
        window.location.href = route('backup.export');
    };

    // The explicit handler executing the file upload and restore routine
    const triggerImport = (e) => {
        e.preventDefault();

        if (confirm('Warning: This will completely replace your active application records. Proceed?')) {
            post(route('backup.import'), {
                forceFormData: true, // Crucial for Inertia to package raw files correctly
                onSuccess: () => reset(), // Empties out the file selector input box upon success
            });
        }
    };

    return (
        <div style={{ padding: '25px', fontFamily: 'sans-serif' }}>
            {/* System Status Feedback Banners */}
            {flash?.success && <div style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontWeight: 'bold' }}>✅ {flash.success}</div>}
            {flash?.error && <div style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontWeight: 'bold' }}>⚠️ {flash.error}</div>}

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '400px', backgroundColor: '#ffffff' }}>
                <h3 style={{ marginTop: 0 }}>System Data Manager</h3>

                {/* BUTTON 1: EXPORT */}
                <button
                    onClick={triggerExport}
                    style={{ background: '#28a745', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginBottom: '20px' }}
                >
                    Stream/Export Backup File
                </button>

                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

                {/* FORM 2: IMPORT/RESTORE */}
                <form onSubmit={triggerImport}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Select `.sqlite` file to restore:
                    </label>

                    <input
                        type="file"
                        accept=".sqlite"
                        onChange={(e) => setData('backup_file', e.target.files[0])} // Sets single raw file index stream
                        style={{ display: 'block', marginBottom: '15px', width: '100%' }}
                        required
                    />

                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            background: '#dc3545',
                            color: 'white',
                            padding: '12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            width: '100%',
                            fontWeight: 'bold'
                        }}
                    >
                        {processing ? 'Uploading Data File...' : '🔄 Upload & Overwrite Active Database'}
                    </button>
                </form>
            </div>
        </div>
    );
}
