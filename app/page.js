"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';
import axios from 'axios';

function getLocalStorageItem(key, initialValue) {
  if (typeof window !== 'undefined') {
    // localStorage에서 데이터를 가져옵니다.
    const storedItem = localStorage.getItem(key);
    return storedItem ? JSON.parse(storedItem) : initialValue;
  }
  return initialValue; // 서버 사이드에서 실행될 경우 초기 값 반환
}

function setLocalStorageItem(key, value) {
  if (typeof window !== 'undefined') {
    // localStorage에 데이터를 저장합니다.
    localStorage.setItem(key, JSON.stringify(value));
  }
}

async function generateHash(nickname) {
  const uniqueID = getLocalStorageItem('uniqueID', Math.floor(Math.random() * Date.now()).toString());
  setLocalStorageItem('uniqueID', uniqueID);

  if (typeof window !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(nickname + uniqueID);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const numericHash = parseInt(hashHex.substring(0, 8), 16) % 1000000;
    return numericHash.toString().padStart(6, '0');
  }
  return '000000'; // 서버 사이드에서 실행될 경우 기본 해시 반환
}


export default function Home() {
  const [nickname, setNickname] = useState(() => getLocalStorageItem('nickname', ''));
  const [hash, setHash] = useState('');
  const [uniqueNickname, setUniqueNickname] = useState(() => getLocalStorageItem('uniqueNickname', ''));
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleShowStats = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

    useEffect(() => {
        fetchRandomQuizzes();
    }, []);

    const fetchRandomQuizzes = async () => {
        try {
            const response = await axios.get('api/random-quizzes/');
            setQuizzes(response.data);
        } catch (error) {
            console.error('Error fetching random quizzes:', error);
        }
    };

  useEffect(() => {
    if (nickname === '') {
      setHash('000000');
    }
    if (nickname && typeof window !== 'undefined') {
      generateHash(nickname).then(newHash => {
        setHash(newHash);
        const newUniqueNickname = `${nickname}#${newHash}`;
        setUniqueNickname(newUniqueNickname);
        setLocalStorageItem('nickname', nickname);
        setLocalStorageItem('hash', newHash);
        setLocalStorageItem('uniqueNickname', newUniqueNickname);
      });
    }
  }, [nickname]);

  function handleJoinQuiz() {
    if (!accessCode.trim()) {
      setErrorMessage('접근 코드를 입력해주세요.');
      return;
    }
    if (nickname === "" || nickname === null) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }
    axios.get(`api/quizzes/by-access-code/${accessCode}`)
      .then(response => {
        if (response.data) {
          router.push(`/quiz/${accessCode}`);
        } else {
          setErrorMessage('접근 코드가 올바르지 않습니다.');
        }
      })
      .catch(error => {
        console.error('Error fetching quiz:', error);
        setErrorMessage('접근 코드가 올바르지 않습니다.');
      });
  }

  function handleCreateQuiz() {
    router.push('/quiz/create');
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleJoinQuiz();
    }
  }

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
        <div className='pb-10'>
          <div className='text-center pb-4'>
            <img src="logo2.svg" alt="logo" className='h-[10rem] mx-auto'/>
          </div>
          <div className='flex justify-center items-center h-[250px] gap-10'>
            <div onClick={handleCreateQuiz}  className='bg-white rounded-2xl p-10 w-[250px] h-full flex justify-center items-center cursor-pointer hover:bg-sub4'>
              <p className='text-xl font-bold'>퀴즈 만들기</p>
            </div>
            <div className='bg-white rounded-2xl p-10 w-[250px] h-full flex-row text-center justify-center items-center cursor-pointer hover:bg-sub4'>
                <p className='text-xl font-bold my-2'>퀴즈 참가하기</p>
                <input 
                  type="text" 
                  className='border w-[120px] border-gray-300 p-2 my-2 text-center rounded-full'
                  placeholder="코드 입력"
                  value={accessCode}
                  maxLength={7}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={handleKeyPress}
                /><br/>
                <button onClick={handleJoinQuiz} className='bg-sub2 py-2 px-4 rounded-full my-2'>입장</button>
                <p className='text-xs'>{errorMessage && <div>{errorMessage}</div>}</p>
            </div>
            <div>
              <p className='text-center font-bold text-sub1'>따끈따끈한 퀴즈들 🔥</p>
              {quizzes.map(quiz => (
                            <div className='bg-white rounded-xl px-4 py-2 my-2 cursor-pointer hover:bg-sub4' 
                              onClick={() => router.push(`/quiz/${quiz.access_code}`)}
                              key={quiz.id}>
                              <p><span className='font-bold'>{quiz.access_code}</span> <span className='text-sm text-gray-400'>by {quiz.author.map(a => a.nickname).join(', ')}</span></p>
                            </div>
                        ))}
            </div>
          </div>
          <div id="nickname" className='flex items-center justify-center mt-10'>
            <span className='mx-2 text-sub1 font-bold'>닉네임</span>
            <input
              type="text"
              className='bg-white rounded-l-full p-2 pl-4'
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div className='bg-white rounded-r-full text-sub1 p-2 pr-4'>{hash ? `#${hash}` : "#000000"}</div>
            {
            // <button onClick={handleShowStats} className='text-white bg-sub1 p-2 ml-4 rounded-full'>통계 보기</button>
            // {showModal && <StatisticsModal showModal={showModal} onClose={handleCloseModal} nickname={nickname} />}
            }
          </div>
      </div>
    </div>
  );
}
