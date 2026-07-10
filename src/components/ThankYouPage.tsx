import { useState, useEffect } from 'react';
import { CheckCircle2, Mail, Phone, ExternalLink, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/CustomButton';
import { EVENT_CONFIG } from '@/lib/formTypes';
import { getViberGroupUrl } from 'zite-endpoints-sdk';

interface Props {
  paymentMethod: string;
  fullName: string;
  email: string;
  ticketNumber: string;
  qrCodeUrl: string;
  registrationId: string;
  onNewRegistration: () => void;
}

export default function ThankYouPage({ paymentMethod, fullName, email, ticketNumber, qrCodeUrl, registrationId, onNewRegistration }: Props) {
  const isStripe = paymentMethod === 'stripe';
  const [viberUrl, setViberUrl] = useState<string | null>(null);

  // Only fetch Viber group URL for confirmed Stripe payments
  useEffect(() => {
    if (isStripe && registrationId) {
      getViberGroupUrl({ registrationId })
        .then(r => { if (r.url) setViberUrl(r.url); })
        .catch(() => {});
    }
  }, [isStripe, registrationId]);

  return (
    <div className="text-center space-y-6 py-4 sm:py-8">
      <div className="flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Cảm ơn quý vị!</h2>

      {isStripe ? (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thanh toán của quý vị đã được ghi nhận thành công.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đây là xác nhận chính thức cho việc đăng ký tham dự chương trình{' '}
            <strong className="text-foreground">Thiền dã ngoại: Thắp sáng ngôi đền bên trong</strong>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Email xác nhận đã được gửi đến địa chỉ email quý vị đã cung cấp. Email này cũng có kèm thông tin vé và mã QR để check-in khi đến chương trình.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quý vị nên chụp màn hình mã QR bên dưới để tiện sử dụng khi check-in.
          </p>

          {/* QR Code Ticket */}
          <div className="inline-block bg-card border border-border rounded-xl p-6 space-y-3">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code vé tham dự" width={200} height={200} className="mx-auto rounded-lg" />
            )}
            <p className="font-semibold text-foreground text-sm">{fullName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <p className="text-sm font-mono text-primary font-semibold">{ticketNumber}</p>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ban Tổ Chức đã nhận được thông tin đăng ký của quý vị.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quý vị đã chọn hình thức thanh toán bằng chuyển khoản ngân hàng. Email xác nhận thanh toán đã được gửi đến địa chỉ email quý vị đã cung cấp.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sau khi Ban Tổ Chức nhận được thanh toán của quý vị, chúng con sẽ gửi thêm một email xác nhận đăng ký chính thức kèm mã QR vé tham dự chương trình.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Xin quý vị vui lòng kiểm tra email, kể cả thư mục Spam/Junk nếu chưa thấy email xác nhận.
          </p>
        </>
      )}

      {/* Action links */}
      <div className="space-y-3 pt-2">
        {viberUrl && (
          <a
            href={viberUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto border border-primary/30 bg-primary/5 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Tham gia nhóm Viber của chương trình
          </a>
        )}
        {viberUrl && (
          <p className="text-xs text-muted-foreground italic">Dành cho người tham gia đã hoàn tất thanh toán.</p>
        )}

        <a
          href={EVENT_CONFIG.landingPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Xem thêm thông tin về chương trình
        </a>

        <button
          onClick={onNewRegistration}
          className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thực hiện đăng ký mới
        </button>
      </div>

      <div className="bg-muted/60 rounded-xl p-5 space-y-2 text-sm text-muted-foreground inline-block text-left">
        <p className="font-medium text-foreground mb-2">Nếu cần hỗ trợ thêm, quý vị có thể liên hệ Ban Tổ Chức qua:</p>
        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> bantochuc@mientinhthucmelbourne.org</p>
        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> 0489 906 880</p>
      </div>

      <p className="text-sm italic text-muted-foreground">
        Kính chúc quý vị nhiều bình an, tỉnh thức và hẹn gặp lại trong chương trình.
      </p>
    </div>
  );
}
