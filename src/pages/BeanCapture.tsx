import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bean } from '../types/Bean';

const BeanCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { beanId } = useParams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to access camera:', error);
        alert('カメラにアクセスできませんでした。');
        if (beanId) {
          navigate(`/beans/${beanId}`);
        } else {
          navigate('/beans');
        }
      }
    };

    initCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    analyzeImage(imageData);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const result: { bean?: Bean } = await response.json();
      if (result && result.bean) {
        // BeanFormにデータを送信
        navigate(`/beans/${beanId || 'new'}`, { state: { bean: result.bean } });
      } else {
        alert('解析結果を取得できませんでした。');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('解析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/beans/${beanId || 'new'}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ラベルを撮影して解析</h1>
      <div className="camera-section mb-4">
        <video ref={videoRef} autoPlay playsInline className="w-full bg-gray-300" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <div className="button-group space-y-4 space-x-4">
        <button
          onClick={handleCapture}
          disabled={isAnalyzing}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          {isAnalyzing ? '解析中...' : '撮影して解析'}
        </button>
        <button
          onClick={handleGoBack}
          className="bg-gray-500 text-white py-2 px-4 rounded-md"
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default BeanCapture;
