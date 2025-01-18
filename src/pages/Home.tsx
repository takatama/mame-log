import React from 'react';
import { signIn } from '@hono/auth-js/react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6">豆ログへようこそ</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        あなたのコーヒー体験を記録し、最高の一杯を見つけるお手伝いをします。
      </p>
      {/* https://tailwindflex.com/@shakti/google-login-signup-button */}
      <div className="flex items-center justify-centers dark:bg-gray-800">
        <button onClick={() => signIn('google')} className="px-4 py-2 border flex gap-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">
          <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
          <span>Googleでサインイン</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
