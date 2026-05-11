export const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-slate-50 font-inter text-sm text-slate-500 border-t border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <span className="text-xl font-black text-slate-900">HappyHome</span>
          <p className="leading-relaxed">HappyHome tự hào đem đến giải pháp tìm phòng trọ, căn hộ, ký túc xá an toàn và tiện lợi trên toàn quốc.</p>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900">Liên hệ</h4>
          <div className="flex flex-col gap-2">
            <span className="hover:text-blue-500 transition-all cursor-pointer">Hotline: 1900-1234</span>
            <span className="hover:text-blue-500 transition-all cursor-pointer">Email: contact@dormarch.vn</span>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900">Pháp lý</h4>
          <div className="flex flex-col gap-2">
            <a className="hover:text-blue-500 transition-all underline" href="#">Điều khoản dịch vụ</a>
            <a className="hover:text-blue-500 transition-all underline" href="#">Chính sách bảo mật</a>
            <p className="mt-4 text-xs">Mã số thuế: 0123456789 do Sở Kế hoạch và Đầu tư TPHCM cấp.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
