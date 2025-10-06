import { useState, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useTranslation } from '../translationContext';
import UserNav from './UserNav';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const micIconRef = useRef<HTMLDivElement>(null);

  // WebSocket for AI backend



  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize WebSocket once
  if (!wsRef.current) {
    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    wsRef.current.onmessage = (event) => {
      // Handle transcription or messages here, e.g. append partial transcription
      console.log('Received:', event.data);
      setMessage((prev) => prev + event.data + ' ');
    };
    wsRef.current.onclose = () => console.log('WebSocket closed');
    wsRef.current.onerror = (e) => console.error('WebSocket error', e);
  }

  const startRecording = async () => {
    if (isRecording) return;
    setIsRecording(true);
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      fullBlob.arrayBuffer().then((buffer) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(buffer);
        }
      });
    };

    mediaRecorder.start();
    // Optional mic animation using gsap here
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    // Stop mic animation here if any
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
      formData.append("problemReport", message);
      formData.append("category", localStorage.getItem("selectedDepartment") || "");
      formData.append("Problem", localStorage.getItem("selectedType") || "");
      formData.append("SubProblem", localStorage.getItem("selectedSubtype") || "");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          formData.append("latitude", latitude.toString());
          formData.append("longitude", longitude.toString());


          selectedImages.forEach((image) => {
        formData.append("images", image);  
      });

      // TODO: Replace with your actual API endpoint
      const response = await axios.post('http://localhost:4000/api/complaints/createComplaint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      toast.success(response.data.message);
      navigate('/')
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

        },
        (err) => {
          console.log(err);
          alert("Please allow location access!");
        }
      );
      // from geolocation

      
    } catch (err: any) {
      if (err.response.data.error !== undefined) {
        toast.error(err.response.data.error)
        navigate("/");
      }
      else {
        toast.error(err.response.data.message)
      }
      alert(t('failedToSendComplaint'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen w-full bg-gradient-to-br mt-20 mb-10 from-blue-500 via-white to-blue-600 p-4">
        <div className="md:max-w-2xl md:mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0a3d91] mb-2">{t('fileComplaint')}</h1>
            <p className="text-gray-600">{t('complaintSubtitle')}</p>
          </div>

          {/* Main Complaint Form */}
          <div className="bg-white rounded-2xl shadow-xl md:p-6  p-4 mb-6">
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
              <div className="flex flex-wrap md:gap-3 gap-2">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="md:w-20 md:h-20 w-13 h-13 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full md:w-6 w-3 h-3 md:h-6 flex items-center justify-center text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedImages.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="md:w-20 md:h-20 w-13 h-13 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors duration-300"
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
            <div className="flex md:gap-4 gap-2">
              {/* Voice Input Button */}
              <button
                ref={micButtonRef}
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 flex items-center justify-center gap-2 md:py-3 py-2 px-3 md:px-6 rounded-xl font-semibold transition-all duration-300 ${isRecording
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-400 text-black hover:bg-gray-200'
                  }`}
              >
                <div ref={micIconRef} className="w-5 h-5">
                  {isRecording ? (
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2c0-.55.45-1 1-1s1 .45 1 1z" />
                      <path d="M12 20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z" />
                    </svg>
                  ) : (
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2c0-.55.45-1 1-1s1 .45 1 1z" />
                      <path d="M12 20c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z" />
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
                className={`flex-1 flex items-center justify-center gap-2 md:py-3 py-2 px-3 md:px-6 rounded-xl font-semibold transition-all duration-300 ${isSending || (!message.trim() && selectedImages.length === 0)
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

        </div>
      </div>
    </>
  );
}

export default Chat;