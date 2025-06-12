import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Training() {
  const [trainingType] = useState("food");
  const [trainingName, setTrainingName] = useState("");
  const [subject, setSubject] = useState("burger");
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const updated = [...images, ...files].slice(0, 30); // max 30 images
    setImages(updated);
  };

  const handleStartTraining = () => {
    if (images.length < 5) {
      alert("Please upload at least 5 images to start training.");
      return;
    }

    alert(`Training started with ${images.length} images.`);
    // Add actual training logic here
  };

  return (
    <div className="min-h-screen bg-amber-100 flex flex-col md:flex-row p-6">

      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-xl p-6 mb-6 md:mb-0 md:mr-6">
        <h2 className="text-xl font-bold mb-4 text-yellow-600">Training Options</h2>

        {/* Training Type */}
        <label className="block font-semibold mb-1">Training Type*</label>
        <select disabled className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
          <option>{trainingType}</option>
        </select>

        {/* Training Name */}
        <label className="block font-semibold mb-1">Training Name*</label>
        <input
          type="text"
          value={trainingName}
          onChange={(e) => setTrainingName(e.target.value)}
          placeholder="e.g. spicy-burger-v1"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        {/* Subject */}
        <label className="block font-semibold mb-1">Select Subject*</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
        >
          <option value="burger">Burger</option>
          <option value="pizza">Pizza</option>
          <option value="drink">Drink</option>
        </select>

        {/* Info Tips */}
        <div className="bg-neutral-100 p-3 rounded-lg text-sm text-gray-700 mb-4">
          <p className="font-semibold mb-2">🍔 How to get good results:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload 15–20 photos with varied lighting</li>
            <li>Use clear images (min 1024x1024px)</li>
            <li>Try different poses & backgrounds</li>
            <li>Use close-ups and zoomed-out shots</li>
          </ul>
        </div>

        {/* Image Upload */}
        <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="opacity-0 absolute w-full h-full cursor-pointer"
          />
          <p className="text-sm text-gray-500 text-center px-4">
            Drag & drop or click to upload images<br />
            <span className="text-xs">(max 30 images)</span>
          </p>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="flex-1 bg-white rounded-xl shadow-xl p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-600">Uploaded Images</h2>
          <span className="text-sm text-gray-500">
            {images.length}/30
          </span>
        </div>

        {images.length === 0 ? (
          <p className="text-gray-400 italic">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`Uploaded ${i}`}
                className="rounded-lg shadow h-32 object-cover"
              />
            ))}
          </div>
        )}

        {/* Start Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartTraining}
            disabled={images.length < 5}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold shadow transition ${
              images.length < 5
                ? "bg-yellow-200 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            ▶ Start Food Training
          </button>
        </div>
      </div>
    </div>
  );
}

export default Training;
