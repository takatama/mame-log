import React, { useEffect, useRef, useState } from 'react';
import { NavigateOptions, useNavigate, useParams } from 'react-router-dom';
import { Bean } from '../types/Bean';

const BeanCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { beanId } = useParams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  const handleGoBack = (options?: NavigateOptions) => {
    const path = beanId ? `/beans/${beanId}/edit` : '/beans/new';
    navigate(path, options);
  };
  
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
      handleGoBack();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    initCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
  
    // ビデオフレームをキャプチャしてキャンバスに描画
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // キャプチャ後、ビデオを非表示にしてキャンバスを表示
    setIsCaptured(true);
  
    // キャプチャ後にAI解析を自動的に開始
    analyzeImage();
  };
  
  const analyzeImage = async () => {
    if (!canvasRef.current) return;

    setIsAnalyzing(true);
    const canvas = canvasRef.current;

    try {
      const imageData = canvas.toDataURL('image/png'); // 画像データを取得
      const response = await fetch('/api/users/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const { bean, is_coffee_label }: { bean?: Bean, is_coffee_label?: boolean } = await response.json();
      if (bean && is_coffee_label) {
          bean.photo_data_url = imageData;
          handleGoBack({ state: { bean } });
      } else {
        alert('解析結果を取得できませんでした。');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('解析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
      setIsCaptured(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ラベルを撮影して解析</h1>
      <div className="camera-section mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full bg-gray-300 ${isCaptured ? 'hidden' : ''}`}
        />
        <canvas
          ref={canvasRef}
          className={`w-full bg-gray-300 ${isCaptured ? '' : 'hidden'}`}
        />
      </div>
      <div className="button-group space-y-4 space-x-4">
        {!isCaptured && (
          <button
            onClick={handleCapture}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            撮影して解析
          </button>
        )}
        {isCaptured && (
          <button
            onClick={analyzeImage}
            disabled={isAnalyzing}
            className="bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {isAnalyzing ? '解析中...' : '解析を開始'}
          </button>
        )}
        <button
          onClick={() => handleGoBack()}
          className="bg-gray-500 text-white py-2 px-4 rounded-md"
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default BeanCapture;
