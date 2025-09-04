import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useTranslation } from './translationContext';

function Chat() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const {t} = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const micIconRef = useRef<HTMLDivElement>(null);

  // Voice recognition setup
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
      };
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
      
      // Start mic animation
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(micIconRef.current, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: "none"
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      
      // Stop mic animation
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.killTweensOf(micIconRef.current);
      gsap.set(micIconRef.current, { rotation: 0 });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (selectedImages.length + imageFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
    
    // Create preview URLs
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim() && selectedImages.length === 0) {
      alert('Please enter a message or select images');
      return;
    }

    setIsSending(true);
    
    // Send button animation
    gsap.to(sendButtonRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      const formData = new FormData();
      formData.append('message', message);
      selectedImages.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      // TODO: Replace with your actual API endpoint
      const response = await axios.post('YOUR_API_ENDPOINT_HERE', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success animation
      setShowSuccess(true);
      gsap.to('.success-message', {
        opacity: 1,
        y: -20,
        duration: 0.5,
        ease: "back.out(1.7)"
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setMessage('');
        setSelectedImages([]);
        setImagePreview([]);
        setShowSuccess(false);
        gsap.set('.success-message', { opacity: 0, y: 0 });
      }, 2000);

    } catch (error) {
      console.error('Error sending complaint:', error);
      alert(t('failedToSendComplaint'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a3d91] mb-2">{t('fileComplaint')}</h1>
          <p className="text-gray-600">{t('complaintSubtitle')}</p>
        </div>

        {/* Main Complaint Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('describeComplaint')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('complaintPlaceholder')}
              className="w-full h-32 p-4 border-2 text-black border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none transition-colors duration-300"
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('attachPhotos')}
            </label>
            <div className="flex flex-wrap gap-3">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedImages.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors duration-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('photoNote')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* Voice Input Button */}
            <button
              ref={micButtonRef}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-white hover:bg-gray-200'
              }`}
            >
              <div ref={micIconRef} className="w-5 h-5">
                {isRecording ? (
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2c0-.55.45-1 1-1s1 .45 1 1z"/>
                    <path d="M12 20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z"/>
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2c0-.55.45-1 1-1s1 .45 1 1z"/>
                    <path d="M12 20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z"/>
                  </svg>
                )}
              </div>
              {isRecording ? t('stopRecording') : t('voiceInput')}
            </button>

            {/* Send Button */}
            <button
              ref={sendButtonRef}
              onClick={handleSubmit}
              disabled={isSending || (!message.trim() && selectedImages.length === 0)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isSending || (!message.trim() && selectedImages.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#0a3d91] text-white hover:bg-[#082a6b] shadow-lg hover:shadow-xl'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('sending')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {t('sendComplaint')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 opacity-0">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('successMessage')}
            </div>
          </div>
        )}

        {/* Voice Recording Overlay */}
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 opacity-0 pointer-events-none"
        >
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2c0-.55.45-1 1-1s1 .45 1 1z"/>
                <path d="M12 20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('recording')}</h3>
            <p className="text-gray-600">{t('recordingNote')}</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;