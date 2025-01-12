import React from 'react';

const TermsAgreement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">利用規約に同意してください</h1>
        <div className="terms mb-4 p-4 border border-gray-300 rounded-lg overflow-y-auto max-h-48 bg-gray-50">
          <p className="text-gray-700 font-semibold mb-2">利用規約</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            本サービスをご利用いただくには、以下の利用規約に同意する必要があります。
            <br /><br />
            1. 本サービスは、個人情報を保護するために適切な措置を講じています。
            <br />
            2. サービス利用中に生成されたデータは、法律に基づき適切に管理されます。
            <br />
            3. サービスの不正利用は禁止されています。
            <br />
            4. 本サービスの内容は予告なく変更される場合があります。
          </p>
        </div>
        <form action="/api/users" method="POST">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            同意して進む
          </button>
        </form>
      </div>
    </div>
  );
};

export default TermsAgreement;
