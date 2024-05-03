import React from 'react';
import { useQRCode } from 'next-qrcode';

const ShareModal = ({ accessCode, onClose }) => {
  // 현재 페이지 URL을 QR 코드로 생성하기 위해 사용
    const { Image } = useQRCode();
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white p-4 px-20 rounded-xl text-center" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-2">공유하기</h2>
        <div className="my-4 flex justify-center">
            <Image
            text={currentUrl}
            options={{
            type: 'image/jpeg',
            quality: 0.3,
            errorCorrectionLevel: 'M',
            margin: 3,
            scale: 4,
            width: 100,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
            }}
        />
        </div>
        <p>접근 코드</p>
        <p>{accessCode}</p>
        
        </div>
    </div>
    );
};

export default ShareModal;