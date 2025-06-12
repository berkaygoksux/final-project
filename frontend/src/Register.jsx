import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate import edildi.

function Register() {
  const navigate = useNavigate(); // navigate tanımlandı.
  // DEĞİŞTİ: "email" state'i "username" olarak güncellendi.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // DEĞİŞTİ: Backend'e doğru anahtar ve değer gönderiliyor.
        body: JSON.stringify({ username: username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Kayıt başarısız oldu.");
      }

      const data = await res.json();
      // DEĞİŞTİ: Token, "accessToken" ismiyle kaydediliyor.
      localStorage.setItem("accessToken", data.access_token);
      setSuccess("Hesap oluşturuldu! Yönlendiriliyorsunuz...");

      // EKLENDİ: Başarılı kayıt sonrası 1.5 saniye bekleyip generator'a yönlendir.
      setTimeout(() => {
        navigate("/generator");
      }, 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-yellow-600 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          {/* DEĞİŞTİ: Etiket ve input alanı "Kullanıcı Adı" oldu. */}
          <label className="block text-gray-700 font-semibold mb-2">Kullanıcı Adı</label>
          <input
            type="text"
            placeholder="bir kullanıcı adı seçin"
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
          {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition shadow"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;