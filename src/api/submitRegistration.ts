import { z } from 'zod';
import { createEndpoint, Registrations, Email } from 'zite-integrations-backend-sdk';

const LOGO_URL = 'https://images.fillout.com/orgid-702671/flowpublicid-default/widgetid-default/pUfxfV7UzhHdtW4wv6UAV9/pasted-image-1782913166317-o2awyrhs.png';
const ADMIN_EMAIL = 'bantochuc@mientinhthucmelbourne.org';
const EMAIL_SUBJECT = 'Xác nhận đã nhận đăng ký Khóa thiền dã ngoại "Thắp sáng ngôi đền bên trong" ở Camp Rumbug, Melbourne, 25–27/09/2026';

export default createEndpoint({
  description: 'Submit a retreat registration',
  inputSchema: z.object({
    email: z.string().email(),
    hoVaTen: z.string(),
    phapDanh: z.string().optional(),
    phoneViberOriginal: z.string(),
    phoneViberNormalised: z.string(),
    namSinh: z.string(),
    gioiTinh: z.string(),
    ngheNghiep: z.string().optional(),
    diaChi: z.string(),
    yeuCauHoTro: z.string().optional(),
    emergencyName: z.string(),
    emergencyPhoneOriginal: z.string(),
    emergencyPhoneNormalised: z.string(),
    emergencyRelationship: z.string(),
    emergencyAddress: z.string().optional(),
    healthConfirmed: z.boolean(),
    rulesConfirmed: z.boolean(),
    camping: z.string(),
    tShirt: z.string(),
    tShirtSize: z.string().optional(),
    paymentMethod: z.string(),
    paymentAmount: z.number(),
    tShirtFee: z.number(),
    baseFee: z.number().optional(),
    donationAmount: z.number().optional(),
    totalAmount: z.number().optional(),
    receiptUrl: z.string().optional(),
    additionalMessage: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string(),
    ticketNumber: z.string(),
    qrCodeUrl: z.string(),
  }),
  execute: async ({ input }) => {
    const isStripe = input.paymentMethod === 'stripe';
    const paymentStatus = isStripe ? 'Paid online' : 'Pending verification';

    // Generate ticket number: count existing + 1
    let totalCount = 0;
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const result = await Registrations.findAll({ offset, limit: 2000, fields: ['id'] });
      totalCount += result.records.length;
      hasMore = result.hasMore;
      offset += result.records.length;
    }
    const ticketNum = totalCount + 1;
    const ticketNumber = `TK-${String(ticketNum).padStart(3, '0')}`;

    // QR code URL
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(input.phoneViberNormalised)}&size=200`;

    const record = await Registrations.create({
      record: {
        email: input.email,
        hoVaTen: input.hoVaTen,
        phapDanh: input.phapDanh || undefined,
        phoneViber: input.phoneViberNormalised,
        mainPhoneOriginal: input.phoneViberOriginal,
        mainPhoneNormalised: input.phoneViberNormalised,
        namSinh: parseInt(input.namSinh),
        gioiTinh: input.gioiTinh,
        ngheNghiep: input.ngheNghiep || undefined,
        iaChi: input.diaChi,
        yeuCauHoTroAcBiet: input.yeuCauHoTro || undefined,
        emergencyContactName: input.emergencyName,
        emergencyContactPhone: input.emergencyPhoneNormalised,
        emergencyPhoneOriginal: input.emergencyPhoneOriginal,
        emergencyPhoneNormalised: input.emergencyPhoneNormalised,
        emergencyContactAddress: input.emergencyAddress || undefined,
        emergencyContactRelationship: input.emergencyRelationship,
        healthResponsibilityConfirmed: input.healthConfirmed,
        rulesConfirmed: input.rulesConfirmed,
        camping: input.camping,
        tShirt: input.tShirt,
        tShirtSize: input.tShirtSize || undefined,
        paymentMethod: isStripe ? 'Stripe' : 'Chuyển khoản ngân hàng',
        paymentAmount: input.paymentAmount,
        tShirtFee: input.tShirtFee,
        baseFee: input.baseFee,
        donationAmount: input.donationAmount,
        totalAmount: input.totalAmount,
        paymentStatus,
        receipt: input.receiptUrl ? [{ url: input.receiptUrl }] : undefined,
        additionalMessage: input.additionalMessage || undefined,
        adminStatus: 'New submission',
        ticketNumber,
        qrCodeUrl,
        confirmationEmailSent: true,
        qrTicketEmailSent: isStripe,
      },
    });

    const fmt = (n: number) => `$${n.toFixed(2)} AUD`;

    // ── Send participant email (content varies by payment method) ──
    if (isStripe) {
      await Email.send({
        to: input.email,
        subject: EMAIL_SUBJECT,
        logo: { url: LOGO_URL, width: 160, height: 50 },
        body: [
          {
            type: 'text',
            content: `Kính chào quý vị,\n\nThanh toán của quý vị đã được ghi nhận thành công. Đây là xác nhận chính thức cho việc đăng ký tham dự chương trình:\n\n<strong>Khóa thiền dã ngoại: Thắp sáng ngôi đền bên trong</strong>\nThời gian: 25–27/09/2026\nĐịa điểm: Camp Rumbug, Melbourne\nđược Thầy Minh Niệm trực tiếp hướng dẫn\n\nVui lòng giữ email này để sử dụng khi check-in vào ngày tham dự chương trình.\n\n<strong>Thông tin vé:</strong>\n• Họ và tên: ${input.hoVaTen}\n• Email: ${input.email}\n• Số điện thoại: ${input.phoneViberNormalised}\n• Mã vé: ${ticketNumber}`,
          },
          {
            type: 'image',
            src: qrCodeUrl,
            alt: 'QR Code vé tham dự',
            width: 200,
            height: 200,
            alignment: 'center',
          },
          { type: 'divider' },
          {
            type: 'text',
            content: `<strong>Tóm tắt đăng ký:</strong>\n• Họ và tên: ${input.hoVaTen}\n• Email: ${input.email}\n• Số điện thoại: ${input.phoneViberNormalised}\n• Hình thức nghỉ qua đêm: ${input.camping}\n• Đăng ký áo thun: ${input.tShirt}${input.tShirtSize ? ` — Size ${input.tShirtSize}` : ''}\n• Tổng phí đã thanh toán: ${fmt(input.paymentAmount)}\n• Phương thức thanh toán: Thanh toán online bằng thẻ qua Stripe\n• Trạng thái thanh toán: Đã thanh toán\n\nNếu cần thêm thông tin, quý vị có thể liên hệ:\n• Email: bantochuc@mientinhthucmelbourne.org\n• Phone/Viber: [INSERT CONTACT PHONE]\n\nKính chúc quý vị nhiều bình an và hẹn gặp lại trong chương trình.\n\nBan Tổ Chức`,
          },
        ],
      });
    } else {
      await Email.send({
        to: input.email,
        subject: EMAIL_SUBJECT,
        logo: { url: LOGO_URL, width: 160, height: 50 },
        body: [
          {
            type: 'text',
            content: `Kính chào quý vị,\n\nBan Tổ Chức đã nhận được thông tin đăng ký của quý vị cho chương trình:\n\n<strong>Khóa thiền dã ngoại: Thắp sáng ngôi đền bên trong</strong>\nThời gian: 25–27/09/2026\nĐịa điểm: Camp Rumbug, Melbourne\nđược Thầy Minh Niệm trực tiếp hướng dẫn\n\nQuý vị đã chọn hình thức thanh toán bằng chuyển khoản ngân hàng.\n\nThông tin đăng ký của quý vị hiện đang ở trạng thái:\n<strong>Đang chờ xác nhận thanh toán</strong>\n\nSau khi Ban Tổ Chức kiểm tra và xác nhận thanh toán, quý vị sẽ nhận được một email xác nhận chính thức kèm mã QR vé tham dự chương trình.\n\n<strong>Tóm tắt đăng ký:</strong>\n• Họ và tên: ${input.hoVaTen}\n• Email: ${input.email}\n• Số điện thoại: ${input.phoneViberNormalised}\n• Đăng ký áo thun: ${input.tShirt}${input.tShirtSize ? ` — Size ${input.tShirtSize}` : ''}\n• Tổng phí cần thanh toán: ${fmt(input.paymentAmount)}\n• Phương thức thanh toán: Chuyển khoản ngân hàng\n• Trạng thái thanh toán: Đang chờ xác nhận\n\nNếu quý vị đã chuyển khoản nhưng chưa tải biên nhận, xin vui lòng liên hệ Ban Tổ Chức để được hỗ trợ.\n\nNếu cần thêm thông tin, quý vị có thể liên hệ:\n• Email: bantochuc@mientinhthucmelbourne.org\n• Phone/Viber: [INSERT CONTACT PHONE]\n\nKính chúc quý vị nhiều bình an.\n\nBan Tổ Chức`,
          },
        ],
      });
    }

    // ── Admin notification email ──
    await Email.send({
      to: ADMIN_EMAIL,
      subject: `[Retreat] Đăng ký mới: ${input.hoVaTen} — ${ticketNumber}`,
      logo: { url: 'https://images.fillout.com/orgid-702671/flowpublicid-j7pdezg8fp/widgetid-default/bdzu8a1jTabUXonEo9TvzN/new_mttMB_log_vietnamse.png', width: 1920, height: 640 },
      body: [
        {
          type: 'text',
          content: `<strong>Đăng ký mới từ:</strong> ${input.hoVaTen}\n<strong>Mã vé:</strong> ${ticketNumber}\n\n• Email: ${input.email}\n• Phone (original): ${input.phoneViberOriginal}\n• Phone (normalised): ${input.phoneViberNormalised}\n• Năm sinh: ${input.namSinh}\n• Giới tính: ${input.gioiTinh}\n• Nghề nghiệp: ${input.ngheNghiep || '—'}\n• Địa chỉ: ${input.diaChi}\n• Yêu cầu hỗ trợ: ${input.yeuCauHoTro || '—'}\n\n<strong>Liên lạc khẩn cấp:</strong>\n• Tên: ${input.emergencyName}\n• SĐT (original): ${input.emergencyPhoneOriginal}\n• SĐT (normalised): ${input.emergencyPhoneNormalised}\n• Quan hệ: ${input.emergencyRelationship}\n• Địa chỉ: ${input.emergencyAddress || '—'}\n\n• Cắm trại: ${input.camping}\n• Áo thun: ${input.tShirt}${input.tShirtSize ? ` — Size ${input.tShirtSize}` : ''}\n\n<strong>Thanh toán:</strong>\n• Phí tham dự cơ bản: ${input.baseFee !== undefined ? fmt(input.baseFee) : '—'}\n• Tùy hỷ ủng hộ: ${input.donationAmount ? fmt(input.donationAmount) : '—'}\n• Tổng phí: ${fmt(input.paymentAmount)}\n• Phương thức: ${isStripe ? 'Stripe' : 'Chuyển khoản ngân hàng'}\n• Trạng thái: ${paymentStatus}\n• QR Code: ${qrCodeUrl}\n• Lời nhắn: ${input.additionalMessage || '—'}${input.receiptUrl ? `\n• Biên nhận: ${input.receiptUrl}` : ''}`,
        },
      ],
    });

    return { success: true, id: record.id, ticketNumber, qrCodeUrl };
  },
});
