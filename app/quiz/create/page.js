"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function getLocalStorageItem(key) {
  if (typeof window !== 'undefined') {
    const storedItem = localStorage.getItem(key);
    return storedItem ? JSON.parse(storedItem) : null;
  }
  return null;
}

export default function CreateQuiz() {
  const [type, setType] = useState('3emoji');
  const [author, setAuthor] = useState('');
  const [hintText, setHintText] = useState('');
  const [hints, setHints] = useState({ hint1: [], hint2: [], hint3: [] });
  const [emojis, setEmojis] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [answer, setAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [currentHint, setCurrentHint] = useState('hint1');
  
  const router = useRouter();

  const renderEmojiById = (hintIdList) => {
    if (hintIdList.length === 0) return '';  // 힌트가 없으면 빈 문자열 반환
    
    return hintIdList.map(id => {
      const emoji = emojis.find(e => e.id === id);
      return emoji ? emoji.emoji : '';  // 이모지가 있으면 반환, 없으면 빈 문자열 반환
    }).join('');  // 이모지 문자를 연결하여 반환
  };
  

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localUniqueNickname = getLocalStorageItem('uniqueNickname');
      if (localUniqueNickname) {
        setAuthor(localUniqueNickname);
      }
    }
  }, []);

  const quizTypes = [
    { label: '3 Emoji', value: '3emoji' },
    { label: '4+ Emoji', value: '4+emoji' },
    { label: '3 Hint', value: '3hint' }
  ];

  const handleGetBack = () => {
    window.history.back();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    event.preventDefault();

  const isHintsFilled = type === '3emoji' ? (hints.hint1 && hints.hint2 && hints.hint3) :
                        type === '4+emoji' ? hints.hint1 :
                        (hints.hint1 && hints.hint2 && hints.hint3); // '3hint' 타입일 경우
  
  if (!isHintsFilled) {
    setErrorMessage('모든 힌트 필드를 채워주세요.');
    return;
  }

  if (!answer) {
    setErrorMessage('정답을 입력해야 합니다.');
    return;
  }


    const quizData = {
    type,
    hint_text: hintText,
    hint1 : hints.hint1,
    hint2 : hints.hint2,
    hint3 : hints.hint3,
    answer,
    author_nickname: author,
  };


    try {
      const response = await axios.post('/api/quizzes/', quizData);
      if (response.status === 201) {
        alert('생성 완료');  // 사용자에게 성공 메시지 표시
        router.push(`/quiz/${response.data.access_code}`);  // 생성된 퀴즈로 리디렉션
      } else {
        throw new Error('퀴즈 생성 실패');
      }
    } catch (error) {
      console.error('퀴즈 생성 실패:', error);
      setErrorMessage(error.response?.data?.message || '퀴즈 생성 실패');
    }
  };

    useEffect(() => {
      setHints({ hint1: '', hint2: '', hint3: '' });
    }, [type]);

    useEffect(() => {
      async function loadEmojis() {
        const response = await axios.get('/emojis.json');
        setEmojis(response.data);
      }
      loadEmojis();
    }, []);

    const [words, setWords] = useState([]);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await axios.get('/words.json');
        const allWords = response.data;
        const randomWords = getRandomWords(allWords, 5);
        setWords(randomWords);
      } catch (error) {
        console.error('Failed to load words:', error);
      }
    };

    loadWords();
  }, []);

  const getRandomWords = (words, count) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const openModal = (hintKey) => {
    setCurrentHint(hintKey);
    setShowModal(true);
  };

  const selectEmoji = (emojiId) => {
    setHints(prevHints => {
      const newHints = { ...prevHints };
      if (type === '3emoji') {
        newHints[currentHint] = [prevHints[currentHint], emojiId];
      } else {
        newHints[currentHint] = [...prevHints[currentHint], emojiId];
      }
    return newHints;
  });
  };

  const setAnswerBySuggestion = (suggestion) => () => {
    setAnswer(suggestion);
  }

  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
      <div className='flex justify-center items-center'>
      <form onSubmit={handleFormSubmit}>
        <div className='bg-white mx-4 rounded-xl p-6 min-h-[540px] flex flex-col justify-between'>
          <div>
            <p className='text-center text-2xl font-black pb-2'>퀴즈 만들기</p>
            <p className='text-center text-sm text-gray-400 pb-3'>{author && <span>작성자 : {author}</span>} </p>
          
            <div className="flex justify-center space-x-4 mb-4">
              {quizTypes.map((qt) => (
                <button
                  key={qt.value}
                  type="button"
                  onClick={() => setType(qt.value)}
                  className={type === qt.value ? "bg-main py-2 px-4 border-main border-2 rounded-full text-white" : "border-main border-2 py-2 px-4 rounded-full"}
                >
                  {qt.label}
                </button>
              ))}
            </div>

            <div className='flex-row justify-center text-center'>
              <hr className='my-4 border-main'/>
              {
                type === '3emoji' && [1, 2, 3].map(n => (
                  <input
                    className={`border-2 rounded-2xl p-1 px-2 m-1 mb-4 text-center text-4xl w-[80px] h-[80px] cursor-pointer ${currentHint === `hint${n}` ? 'border-sub2' : 'border-main'}`}
                    key={n}
                    type="text"
                    value={renderEmojiById(hints[`hint${n}`] || [])}
                    readOnly
                    onClick={() => openModal(`hint${n}`)}
                  />
                ))
              }
            </div>

            {type === '4+emoji' && (
              <input 
                className={`border-2 rounded-2xl p-1 px-2 m-1 mb-4 text-2xl w-[300px] ${currentHint === `hint1`? 'border-sub2' : 'border-main'}`} 
                type="text" 
                value={renderEmojiById(hints.hint1) || []} 
                readOnly 
                onClick={() => openModal('hint1')} />
            )}

            {type === '3hint' && [1, 2, 3].map(n => (
              <div key={n} className='flex-col'>
                <input 
                  className={`border-2 rounded-2xl p-1 px-2 m-1 mb-4 text-2xl w-[300px] ${currentHint === `hint${n}`? 'border-sub2' : 'border-main'}`} 
                  key={n} 
                  type="text" 
                  value={renderEmojiById(hints[`hint${n}`] || [])}
                  readOnly 
                  onClick={() => openModal(`hint${n}`)} />
              </div>
            ))}
              <div>
                <label>
                  <div className='flex items-center'>
                    <div className='w-[80px]'>글 힌트 </div>
                    <input className="border-main border-2 rounded-full p-1 px-2 m-1 text-sm h-[40px] w-full" placeholder="짧은 문장으로 힌트를 주세요" type="text" value={hintText} onChange={e => setHintText(e.target.value)} />
                  </div>
                </label>
              </div>
              <label>
                <div className='flex items-center'>
                  <div className='w-[80px]'>정답 </div>
                  <input className="border-main border-2 rounded-full p-1 px-2 m-1 h-[40px] w-full" placeholder="정답을 입력하세요" type="text" value={answer} onChange={e => setAnswer(e.target.value)} />
                </div>
              </label>
            </div>
          <div>
            <div className='text-center p-2 flex gap-2 justify-center'>
              <button onClick={handleGetBack} className='bg-gray-400 py-2 px-4 rounded-full text-white' type="submit">돌아가기</button>
              <button className='bg-sub2 py-2 px-4 rounded-full text-white' type="submit">만들기</button>
            </div>
            {successMessage && <p>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
        </div>
      </form>
      <div className="bg-white rounded-xl p-4 w-[600px] h-[540px] overflow-scroll">
        {emojis.map(emoji => (
        <button className="bg-white border-sub1 m-1 border-2 rounded-xl w-[95px] h-[95px]" key={emoji.no} onClick={() => selectEmoji(emoji.id)}>
          <p className='text-3xl'>{emoji.emoji}</p>
          <p className='text-[0.7rem]'>{emoji.desc}</p>
          </button>
        ))}
      </div>
    </div>
    <div className='mt-4'>
      이런 문제는 어때요? {words.map(word => (
        <span
        onClick={setAnswerBySuggestion(`${word.content}`)} 
        className='bg-white p-2 m-2 rounded-xl hover:bg-sub4 cursor-pointer' 
        key={word.id}>
          {word.content}
        </span>
      ))}
    </div>
    </div>
  );
}
