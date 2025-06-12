import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  // DEĞİŞTİ: "email" state'i "username" olarak güncellendi.
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          // DEĞİŞTİ: Backend'e doğru anahtar ve değer gönderiliyor.
          username: username, 
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Kullanıcı adı veya şifre hatalı.");
      }

      const data = await res.json();
      console.log("Giriş başarılı!", data);

      // DEĞİŞTİ: Token, "accessToken" ismiyle kaydediliyor.
      localStorage.setItem("accessToken", data.access_token);

      // Başarılı giriş sonrası /generator sayfasına yönlendir.
      navigate("/generator");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-amber-100">
      {/* Sol taraf (Görsel Alan) */}
      <div className="flex flex-col justify-center items-center bg-white p-10">
        <img src="/logo.jpg" alt="Logo" className="w-28 h-28 mb-6 rounded-md shadow-md" />
        <h2 className="text-3xl font-bold text-yellow-600 text-center">Your Brand Ad Generator!</h2>
        <img src="/images/look1.jpg" alt="Preview Visual" className="mt-10 w-full max-w-md rounded-lg shadow-xl" />
      </div>

      {/* Sağ Taraf (Login Formu) */}
      <div className="flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-yellow-600 text-center">Login</h2>

          <form onSubmit={handleSubmit}>
            {/* DEĞİŞTİ: Etiket ve input alanı "Kullanıcı Adı" oldu. */}
            <label className="block text-gray-700 font-semibold mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              placeholder="kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />

            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition shadow mb-4"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition shadow mb-4"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;