import { useState, useEffect } from "react"; // DÜZELTİLDİ: useEffect eklendi
import { Link, useNavigate } from "react-router-dom"; // DÜZELTİLDİ: useNavigate eklendi
import axios from "axios";

// Komponentin adını dosya adıyla aynı yapıyoruz
function Genarator() { 
  const navigate = useNavigate(); // EKLENDİ: Yönlendirme için

  // State'ler
  const [prompt, setPrompt] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [controlnetScale, setControlnetScale] = useState(1.0);

  // EKLENDİ: Sayfa koruma bloğu. Token yoksa login sayfasına atar.
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/"); 
    }
  }, [navigate]);

  // Dosya yükleme fonksiyonu
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImage(file);
  };

  // DÜZELTİLDİ: Prompt Güzelleştirme Fonksiyonu (Yetkilendirme Eklendi)
  const handleBeautifyPrompt = async () => {
    if (!assistantPrompt) return;
    setIsBeautifying(true);
    setError("");
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Lütfen önce giriş yapın.");
      setIsBeautifying(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/beautify-prompt",
        { user_prompt: assistantPrompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssistantPrompt(response.data.beautified_prompt);
      setPrompt(response.data.beautified_prompt); // İyileştirme: Ana prompt'u da doldurur.
    } catch (err) {
      console.error("Error beautifying prompt:", err);
      setError("Prompt güzelleştirilirken bir hata oluştu.");
    }
    setIsBeautifying(false);
  };

  // DÜZELTİLDİ: Görsel Oluşturma Fonksiyonu (Yetkilendirme Eklendi)
  const handleGenerate = async () => {
    if (!prompt) {
      setError("Lütfen bir prompt girin.");
      return;
    }
    setIsGenerating(true);
    setError("");
    setImages([]);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Lütfen önce giriş yapın.");
      setIsGenerating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (uploadedImage) {
        formData.append("image", uploadedImage);
      }
      formData.append("controlnet_scale", controlnetScale);
      
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-image-local/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.images && response.data.images.length > 0) {
        setImages(response.data.images);
      } else {
        setError(response.data.error || "Backend'den görsel gelmedi.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Görsel oluşturulurken bir hata oluştu.");
    }
    setIsGenerating(false);
  };

  // Görseli İndirme Fonksiyonu
  const handleDownload = () => {
    if (images.length === 0) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${images[currentImageIndex]}`;
    link.download = 'generated-ad-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- JSX KISMI (DEĞİŞİKLİK YOK) ---
  return (
    <div className="min-h-screen bg-amber-100 text-black flex flex-col">

      {/* Header */}
      <header className="p-6 bg-amber-200 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-20 w-20 rounded-md" />
            <h1 className="text-2xl font-bold text-black-500">Your Brand Ad Generator!</h1>
          </div>
          <Link
            to="/training"
            className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg shadow text-black font-semibold transition"
          >
            ➕ Start New
          </Link>
        </div>
      </header>

      {/* Banner */}
      <section className="bg-indigo-400 text-white p-8 rounded-xl m-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-2">Feeling Hungry?</h2>
            <p className="text-sm leading-relaxed">
              In a world full of visual noise, crave-worthy campaigns make all the difference. Our AI-powered tool helps you generate tasty visuals for ads that leave customers wanting more.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-2">
            <img src="/images/look1.jpg" alt="Example 1" className="rounded-md" />
            <img src="/images/look2.jpg" alt="Example 2" className="rounded-md" />
            <img src="/images/look3.jpg" alt="Example 3" className="rounded-md" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-12">

        {/* Prompt Assistant */}
        <div className="bg-neutral-100 p-6 rounded-xl shadow-xl h-fit">
          <h2 className="text-xl font-bold mb-4">Prompt Assistant</h2>
          <textarea
            value={assistantPrompt}
            onChange={(e) => setAssistantPrompt(e.target.value)}
            placeholder="Enter a simple idea here..."
            className="w-full p-4 bg-white border border-gray-300 rounded-lg resize-none"
            rows={8}
          />
          <button
            onClick={handleBeautifyPrompt}
            disabled={isBeautifying || isGenerating}
            className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50"
          >
            {isBeautifying ? "Working..." : "✨ Beautify My Prompt with AI"}
          </button>
        </div>

        {/* Visual Generator */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Visual Generator</h2>
          <label className="block font-semibold mb-1">Your Idea*</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a donut on a table"
            className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
          />
          <label htmlFor="imageUpload" className="block font-semibold mb-1 cursor-pointer">
            Upload Image (for ControlNet)
          </label>
          <div
            onClick={() => document.getElementById('imageUpload').click()}
            className="w-full h-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 cursor-pointer hover:border-blue-500"
          >
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadedImage ? (
              <img src={URL.createObjectURL(uploadedImage)} alt="Preview" className="h-full object-contain rounded-lg p-1" />
            ) : (
              <span className="text-sm">Click or drag to upload image</span>
            )}
          </div>
          
          <div className="mt-4">
            <label htmlFor="controlnet-scale" className="block font-semibold mb-2">
              ControlNet Strength: <span className="font-normal text-gray-600">{controlnetScale.toFixed(2)}</span>
            </label>
            <input
              type="range"
              id="controlnet-scale"
              min="0.0"
              max="2.0"
              step="0.05"
              value={controlnetScale}
              onChange={(e) => setControlnetScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || isBeautifying}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>
          {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
        </div>

        {/* Result */}
        <div className="bg-white p-6 rounded-xl shadow-xl relative">
          <h2 className="text-2xl font-bold mb-4">Result</h2>
          {images.length > 0 ? (
            <>
              <img
                src={`data:image/png;base64,${images[0]}`}
                alt="Generated Result"
                className="rounded-lg shadow border border-gray-200 cursor-zoom-in"
                onClick={() => setShowZoom(true)}
              />
              <button
                onClick={handleDownload}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition"
              >
                Download Image
              </button>
            </>
          ) : (
            <p className="text-gray-400 italic">Your generated images will appear here.</p>
          )}
        </div>
      </main>

      {/* Zoom Modal */}
      {showZoom && images.length > 0 && (
        <div onClick={() => setShowZoom(false)} className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <img
            src={`data:image/png;base64,${images[currentImageIndex]}`}
            alt="Zoomed"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-black bg-white">
        &copy; 2025 Brand Ad Generator. All rights reserved.
      </footer>
    </div>
  );
}

export default Genarator;