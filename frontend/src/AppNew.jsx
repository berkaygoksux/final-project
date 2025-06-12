import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://0.0.0.0:8000//generate", {
        prompt: prompt,
      });

      if (response.data.images) {
        setImages(response.data.images);
      } else {
        setError("No images returned from the server.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      setError("An error occurred while generating images.");
    }

    setLoading(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageSize = (index) => {
    switch (index) {
      case 0: return "h-[250px] w-[600px]";
      case 1: return "h-[250px] w-[300px]";
      case 2: return "h-[200px] w-[500px]";
      case 3: return "h-[450px] w-[850px]";
      default: return "h-[250px] w-[600px]";
    }
  };

  const getImageLabel = (index) => {
    switch (index) {
      case 0: return "Social Media Ad";
      case 1: return "Google Ad";
      case 2: return "Email Ad";
      case 3: return "Custom Ad";
      default: return "Ad Type";
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100'} flex flex-col transition-colors duration-500`}>
      <header className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} shadow-lg`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">Brand Ad Generator</span>
          <button onClick={toggleDarkMode} className="text-xl">{darkMode ? '🌞' : '🌙'}</button>
        </div>
      </header>

      <main className="flex-grow flex justify-center items-center py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 p-6 sm:px-12">
          {/* Form Section */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-8">Create Your Ad</h2>

            <textarea
              className="w-full p-4 mb-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              rows="4"
              placeholder="Describe the ad you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Ads"}
            </button>

            {error && <div className="text-red-500 mt-4">{error}</div>}
          </div>

          {/* Image Output Section */}
          <div className="flex flex-col items-center justify-start space-y-8 relative">
            {loading && (
              <div className="mt-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
              </div>
            )}

            {images.length > 0 && (
              <div className="relative flex flex-col items-center">
                <div className="absolute top-0 left-0 p-2 text-sm bg-blue-600 text-white rounded-lg">
                  {getImageLabel(currentImageIndex)}
                </div>
                <img
                  src={images[currentImageIndex]}
                  alt={`Generated Ad ${currentImageIndex}`}
                  className={`rounded-lg object-cover ${getImageSize(currentImageIndex)} max-w-full`}
                />
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4">
                  <button
                    onClick={handlePrevImage}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
                  >
                    &lt;
                  </button>
                </div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4">
                  <button
                    onClick={handleNextImage}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} py-12`}>
        <div className="max-w-7xl mx-auto text-center text-sm">
          &copy; 2025 Brand Ad Generator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
