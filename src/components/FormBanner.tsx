import { MapPin, CalendarDays, User } from 'lucide-react';
import { BANNER_URL } from '@/lib/formTypes';

export default function FormBanner() {
  return (
    <div className="w-full relative overflow-hidden">
      <img
        src={BANNER_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07101f]/80 via-[#07101f]/78 to-[#07101f]/92" />
      <div className="relative flex flex-col items-center justify-center text-center px-4 py-8 sm:py-10">
        <p className="text-[#f8b77c] text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase">
          Chương trình thiền dã ngoại
        </p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-2">
          Đăng ký Khóa thiền dã ngoại
        </h2>
        <p className="text-[#d7ecff] text-sm sm:text-base font-medium mt-1 italic">
          "Thắp sáng ngôi đền bên trong"
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-4 text-white/85 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#f8b77c]" /> Camp Rumbug, Melbourne
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[#f8b77c]" /> 25–27.09.2026
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#f8b77c]" /> Thầy Minh Niệm trực tiếp hướng dẫn
          </span>
        </div>
      </div>
    </div>
  );
}
