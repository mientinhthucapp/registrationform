import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import type { FormData } from '@/lib/formTypes';

interface Props {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function HealthPage({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.healthConfirmed) e.healthConfirmed = 'Vui lòng xác nhận để tiếp tục';
    if (!data.rulesConfirmed) e.rulesConfirmed = 'Vui lòng xác nhận để tiếp tục';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <ProgressBar step={2} total={4} />
      <h2 className="text-2xl font-bold text-foreground mb-4">Thông tin sức khỏe & xác nhận nội quy</h2>

      <div className="bg-muted/60 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed mb-6">
        Khóa thiền tại Camp Rumbug diễn ra ở khu vực thiên nhiên có nhiều đồi dốc, nên người tham gia cần có sức khỏe tương đối tốt để tham dự trọn vẹn chương trình.
<br />
Khi đăng ký, quý vị xác nhận mình đủ thể lực tham gia và sẽ tự chuẩn bị thuốc men cá nhân nếu cần.
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Nhu cầu hỗ trợ đặc biệt, nếu có.</Label>
          <Textarea
            rows={3}
            value={data.yeuCauHoTro}
            onChange={e => onChange({ yeuCauHoTro: e.target.value })}
            placeholder=""
          />
          <p className="text-xs text-muted-foreground">
            Ví dụ: khó khăn trong việc di chuyển, nhu cầu hỗ trợ về chỗ ngủ, ăn uống, sức khỏe, dị ứng, hoặc những điều Ban Tổ Chức cần lưu ý để hỗ trợ quý vị tốt hơn.
          </p>
        </div>

        {/* Health & rules confirmation section */}
        <div className="mt-3 pt-6 border-t border-[#eadfce] space-y-4">
          <h3 className="text-[17px] font-bold text-[#10284a]">Xác nhận sức khỏe và nội quy</h3>

          <div className="space-y-1">
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
              <Checkbox
                id="healthConfirmed"
                checked={data.healthConfirmed}
                onCheckedChange={v => onChange({ healthConfirmed: v === true })}
                className="mt-0.5"
              />
              <Label htmlFor="healthConfirmed" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Tôi xác nhận rằng tôi hoàn toàn tự chịu trách nhiệm về tình trạng sức khỏe cá nhân của mình khi tham gia chương trình. <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.healthConfirmed && <p className="text-xs text-destructive">{errors.healthConfirmed}</p>}
          </div>

          <div className="space-y-1">
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
              <Checkbox
                id="rulesConfirmed"
                checked={data.rulesConfirmed}
                onCheckedChange={v => onChange({ rulesConfirmed: v === true })}
                className="mt-0.5"
              />
              <Label htmlFor="rulesConfirmed" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Tôi xác nhận đã đọc kỹ thông tin chương trình, hiểu rõ Nội quy và đồng ý thực hiện đầy đủ các hướng dẫn, quy định trong suốt thời gian tham dự retreat. <span className="text-destructive">*</span>
              </Label>
            </div>
            <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-3">
              Xem đầy đủ Nội quy chương trình <ExternalLink className="w-3 h-3" />
            </a>
            {errors.rulesConfirmed && <p className="text-xs text-destructive">{errors.rulesConfirmed}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack}>← Quay lại</Button>
        <Button onClick={handleNext}>Tiếp tục</Button>
      </div>
    </div>
  );
}
