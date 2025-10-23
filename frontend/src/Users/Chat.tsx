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
  const [isUrgent, setIsUrgent] = useState(false);

  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const [message, setMessage] = useState('');

  
  

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
      formData.append('urgent', isUrgent.toString());
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
            <div className="flex items-center mb-4">
  <input
    type="checkbox"
    id="urgentCheckbox"
    checked={isUrgent}
    onChange={() => setIsUrgent(prev => !prev)}
    className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
  />
  <label
    htmlFor="urgentCheckbox"
    className="ml-2 text-sm font-medium text-black cursor-pointer"
  >
    Mark as Urgent
  </label>
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