import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function StatisticsModal({ showModal, onClose, nickname }) {
    const [successQuizzes, setSuccessQuizzes] = useState([]);
    const [createdQuizzes, setCreatedQuizzes] = useState([]);

    useEffect(() => {
        if (nickname) {
        fetchStatistics(nickname);
        }
    }, [nickname]);

    const fetchStatistics = async (nickname) => {
        try {
        const responseSuccess = await api.get(`/player-statistics/${nickname}`);
        setSuccessQuizzes(responseSuccess.data);
        const responseCreated = await api.get(`/api/created-quizzes/${nickname}`);
        setCreatedQuizzes(responseCreated.data);
        } catch (error) {
        console.error("Error fetching quizzes:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white p-4 px-20 rounded-xl text-center" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div className='p-2'>
                <h3>성공한 퀴즈들</h3>
                <ul>
                    {successQuizzes.map(quiz => <li key={quiz.id}>{quiz.question}</li>)}
                </ul>
                </div>
                <div className='p-2'>
                <h3>만든 퀴즈들</h3>
                <ul>
                    {createdQuizzes.map(quiz => <li key={quiz.id}>{quiz.question}</li>)}
                </ul>
                </div>
            </div>
            </div>
        </div>
    );
}

export default StatisticsModal;
