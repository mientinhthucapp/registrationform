import { Button } from '@/components/ui/button';
import { COVER_URL } from '@/lib/formTypes';
import { MapPin, User, CalendarDays, ExternalLink } from 'lucide-react';
interface Props {
  onStart: () => void;
  isFull: boolean;
}
export default function CoverPage({
  onStart,
  isFull
}: Props) {
  return <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
        {/* Text */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
            Chương Trình Thiền Dã Ngoại/ Meditation Retreat
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Khóa thiền dã ngoại:
            <br />
            <span className='text-primary'>Thắp sáng ngôi đền bên trong</span>
          </h1>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <MapPin className="w-4 h-4 text-primary" />
              Melbourne — Camp Rumbug
            </p>
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <User className="w-4 h-4 text-primary" />
              do Thầy Minh Niệm trực tiếp hướng dẫn
            </p>
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <CalendarDays className="w-4 h-4 text-primary" />
              3 ngày 2 đêm: 25–27/09/2026
            </p>
          </div>

          <div className="border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground italic leading-relaxed text-left">
            Vui lòng đọc kỹ thông tin trước khi đăng ký. Việc đăng ký chỉ được xác nhận sau khi Ban Tổ Chức kiểm tra thông tin và xác nhận thanh toán.
          </div>

          {isFull ? <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold mb-1">Chương trình đã đủ số lượng đăng ký.</p>
              <p className="text-muted-foreground">
                Vui lòng liên hệ Ban Tổ Chức nếu quý vị muốn được ghi danh vào danh sách chờ.
              </p>
            </div> : <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
              <Button size="lg" onClick={onStart} className="text-base px-8">
                Bắt đầu đăng ký
              </Button>
              <a href='#' target="_blank" rel="noopener noreferrer" className='inline-flex items-center gap-1.5 hover:text-foreground transition-colors justify-center text-base font-extrabold text-accent-foreground'>
                Xem thêm thông tin về chương trình
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>}
        </div>

        {/* Cover image */}
        <div className="w-full max-w-xs md:max-w-sm flex-shrink-0">
          <img src={COVER_URL} alt="Thiền Retreat poster" className="w-full rounded-2xl shadow-lg object-cover" />
        </div>
      </div>;
}