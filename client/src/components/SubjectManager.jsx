import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const SubjectManager = ({ onSubjectsUpdated }) => {
    const [subjects, setSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/subjects/all');
            setSubjects(response.data.filter(s => s.name !== 'All')); 
            setLoading(false);
        } catch (error) {
            setMessage('❌ Failed to fetch subjects.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);


    const handleAdd = async (e) => {
        e.preventDefault();
        const name = newSubjectName.trim();
        if (name === '' || name.length < 2) {
            setMessage('❌ Subject name must be at least 2 characters.');
            return;
        }
        
        setIsSaving(true);
        setMessage('');

        try {
          
            await axios.post('/api/subjects/add', { name });
            setNewSubjectName('');
            setMessage(`✅ Subject "${name}" added successfully!`);
            fetchSubjects(); 
            if (onSubjectsUpdated) onSubjectsUpdated(); 

        } catch (error) {
            const errorMsg = error.response?.data?.message || '❌ Error adding subject (check server log).';
            setMessage(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete subject "${name}"? This will break content and quizzes related to it!`)) {
            return;
        }

        try {
            
            await axios.delete(`/api/subjects/${id}`);
            setMessage(`✅ Subject "${name}" deleted.`);
            
            
            fetchSubjects(); 
            if (onSubjectsUpdated) onSubjectsUpdated(); 

        } catch (error) {
            setMessage('❌ Error deleting subject.');
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Loading Subject Manager...</h3>;
    }

    return (
        <div className="subject-manager-container admin-tab-content-card">
          
            <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>1. Add New Subject Category</h3>
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <input 
                    type="text" 
                    value={newSubjectName} 
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="E.g., Machine Learning"
                    required 
                    disabled={isSaving}
                    style={{ flexGrow: 1, padding: '10px', borderRadius: '5px' }}
                />
                <button type="submit" className="approve-btn" disabled={isSaving}>
                    {isSaving ? 'Adding...' : 'Add Subject'}
                </button>
            </form>
            
           
            <h3 style={{ marginTop: '40px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                2. Current Live Subjects ({subjects.length})
            </h3>
            <p style={{marginBottom: '15px', color: '#6c757d'}}>Deleting a subject will cause related content/quizzes to fail if not edited.</p>
            
            <div className="subject-list-display">
                {subjects.map(sub => (
                    <div 
                        key={sub._id} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}
                    >
                        <span style={{ fontWeight: 600 }}>{sub.name}</span>
                        <button onClick={() => handleDelete(sub._id, sub.name)} className="reject-btn" style={{ padding: '4px 8px' }}>
                            🗑️ Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default SubjectManager;