"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ShareModal from './ShareModal';
import axios from 'axios';

export default function QuizPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nickname, setNickname] = useState('');

  const [emojis, setEmojis] = useState([]);

  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [tooltip, setTooltip] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
    const handleMouseOver = (desc, event) => {
      setTooltip(desc);
      setTooltipPos({ x: event.clientX, y: event.clientY });
    };
  
    const handleMouseOut = () => {
      setTooltip('');
    };

  const renderEmojiById = (hintIdList) => {

    if (hintIdList.length === 0) return '';  // 힌트가 없으면 빈 문자열 반환
    return hintIdList.map(id => {
      const emoji = emojis.find(e => e.id === id);
      if (emoji) { 
        return (
        <span 
        key={id}
        onMouseOver={(event) => handleMouseOver(emoji.desc, event)}
        onMouseOut={handleMouseOut}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {emoji.emoji}
        </span>
      ); 
      }
        return '';
    });
  };

  useEffect(() => {
    async function loadEmojis() {
      const response = await axios.get('/emojis.json');
      setEmojis(response.data);
    }
    loadEmojis();
  }, []);

  useEffect(() => {
    if (nickname === '' || nickname === null) {
      setNickname('anonymous#');
    }
  }, [nickname]);

  const handleSubmit = async () => {
    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
      addUserToSuccess();
    } else {
      setErrorMessage('틀렸습니다. 다시 시도해주세요.');
    }
  };

  const addUserToSuccess = async () => {
    if (nickname==='anonymous#') return;

    try {
      const response = await axios.post('/success_user', {
        nickname,
        quizId: quiz.id
      });
      console.log('Player added to success:', response.data);
    } catch (error) {
      console.error('Error adding player to success:', error);
      setErrorMessage(error.response?.data?.message || 'Error adding player to success');
    }
  };

  const router = useRouter();

  // 모달 관련
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleExit = () => { 
    router.push('/');
  }

  const access_code = params.access_code;
  
  useEffect(() => {
    if (params.access_code) {
      axios.get(`/api/quizzes/by-access-code/${access_code}`)
        .then(response => {
          setQuiz(response.data);
          setLoading(false);
          setCorrectAnswer(response.data.answer);
        })
        .catch(err => {
          console.error('Failed to fetch quiz:', err);
          setError('Failed to load quiz');
          setLoading(false);
        });
    }
  }, [params]); // router.isReady를 의존성 배열에 추가합니다.

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!quiz) return <div>No quiz found.</div>;

  return (
  <div className='md:w-screen md:h-screen flex justify-center items-center'>
    <div className='bg-white rounded-xl flex-wrap min-w-[450px] max-w-[600px] px-10 py-10'>
        <div className='flex justify-between text-[1.5rem] font-black'>
          <div>{quiz?.author.map(author => author.nickname).join(', ')}의 퀴즈</div>
          <div className='flex gap-2'>
            <img onClick={handleOpenModal} className="w-7 cursor-pointer hover:scale-110" src="/share.svg"></img>
            <img onClick={handleExit} className="w-7 cursor-pointer hover:scale-110" src="/exit.svg"></img>
            {showModal && <ShareModal accessCode={access_code} onClose={handleCloseModal} />}  
          </div>
          </div>
        <div className='text-xs text-gray-600 mb-4'>{quiz?.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'Unknown'}</div>
      
      <div>
        {quiz.type === "3emoji" && 
          <div className='text-[5rem] text-center flex justify-center gap-4'>
            <span className='bg-hint1 p-5 rounded-2xl'>{renderEmojiById(quiz?.hint1) || ''}</span>
            <span className='bg-hint2 p-5 rounded-2xl'>{renderEmojiById(quiz?.hint2)  || ''}</span>
            <span className='bg-hint3 p-5 rounded-2xl'>{renderEmojiById(quiz?.hint3)  || ''}</span>
          </div>
        }
        {quiz.type === "4+emoji" && 
          <div className='text-[3rem] text-center flex-row justify-center'>
            <p className='bg-sub5 p-5 rounded-2xl'>{renderEmojiById(quiz?.hint1) || ''}</p>
            </div>
        }
        {quiz.type === "3hint" && 
          <div className='text-[3rem] text-center flex-row justify-center'>
            <p className='bg-hint1 p-5 my-2 rounded-2xl'>{renderEmojiById(quiz?.hint1) || ''}</p>
            <p className='bg-hint2 p-5 my-2 rounded-2xl'>{renderEmojiById(quiz?.hint2) || ''}</p>
            <p className='bg-hint3 p-5 my-2 rounded-2xl'>{renderEmojiById(quiz?.hint3) || ''}</p>
          </div>
        }
        {tooltip && (
          <div style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            backgroundColor: 'black',
            color: 'white',
            borderRadius: '4px',
            padding: '5px',
            zIndex: 1000
          }}>
            {tooltip}
          </div>  
        )}
      <div>
        {quiz?.hint_text && <p className='pt-4 text-center text-gray-400'>{quiz?.hint_text}</p>}
        </div>
      </div>
      <div className='flex-col justify-center pt-4'>
        <div className='flex justify-center'>
          
        </div>
      {!isCorrect ? (
      <>
        <div className='flex'>
          <div className='w-[70%] pr-2 pt-2'>
            <input 
                type="text" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className='border w-full border-gray-300 p-2 text-center rounded-full'
                placeholder="정답"
              />
          </div>
          <div className='flex-col w-[30%]'>
            <button onClick={handleSubmit} className='bg-sub2 w-full text-white py-2 mx-1 rounded-full my-2'>도전</button><br/>
          </div>
        </div>
        {errorMessage && <p className='text-center text-sub3'>{errorMessage}</p>}
      </>
      
      ) : (
        <>
          <p className='text-center text-sub2 font-bold text-xl'>정답입니다! </p>
          <p className='text-center text-sub2 font-bold mt-2'>정답 : {correctAnswer}</p>
        </>
      )}
      </div>
    </div>
  </div>
  );
}
