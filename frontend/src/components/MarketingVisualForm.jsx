import React, { useState } from 'react';
import axios from 'axios';

const MarketingVisualForm = () => {
  const [color, setColor] = useState('#ff5733'); // Default color
  const [font, setFont] = useState('Arial');
  const [logo, setLogo] = useState(null); // Logo for upload
  const [generatedImage, setGeneratedImage] = useState(null); // AI-generated image

  const handleColorChange = (e) => setColor(e.target.value);
  const handleFontChange = (e) => setFont(e.target.value);
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogo(url); // Set logo state
    }
  };

  const generateVisual = async () => {
    try {
      // Replace this with the actual API request to the GenAI service (like DALL·E)
      const response = await axios.post('YOUR_GENAI_API_URL', {
        prompt: `Create a marketing visual with color ${color}, font ${font}, and a logo`,
        // You can also pass other params like logo or background style here
      });

      setGeneratedImage(response.data.image_url); // Assuming the API returns the image URL
    } catch (error) {
      console.error('Error generating visual:', error);
    }
  };

  return (
    <div>
      
      {/* Color Picker */}
      <div>
        <label>Select Color: </label>
        <input type="color" value={color} onChange={handleColorChange} />
      </div>

      {/* Font Selector */}
      <div>
        <label>Select Font: </label>
        <select value={font} onChange={handleFontChange}>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
        </select>
      </div>

      {/* Logo Upload */}
      <div>
        <label>Upload Logo: </label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {logo && <img src={logo} alt="Logo Preview" style={{ width: '100px' }} />}
      </div>

      {/* Generate Button */}
      <div>
        <button onClick={generateVisual}>Generate Visual</button>
      </div>

      {/* Display Generated Image */}
      {generatedImage && <div><img src={generatedImage} alt="Generated Visual" /></div>}
    </div>
  );
};

export default MarketingVisualForm;