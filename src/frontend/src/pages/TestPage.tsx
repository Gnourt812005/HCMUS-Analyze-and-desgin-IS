import { ApiClient } from '../api/ApiClient';

export const TestPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h1 className="text-3xl font-bold text-slate-800">Trang Test Middleware</h1>
      <p className="text-slate-500">Trang này dùng để test API `/auth/test` cần JWT Authenticaion</p>
      <button
        onClick={async () => {
          try {
            const res = await ApiClient.get<{ message: string, user: any }>('/auth/test');
            alert(`Thành công:\nMessage: ${res.message}\nUser: ${JSON.stringify(res.user)}`);
          } catch (error: any) {
            alert(`Thất bại: ${error.message}`);
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        Lấy Dữ Liệu Bảo Vệ
      </button>
    </div>
  );
};
