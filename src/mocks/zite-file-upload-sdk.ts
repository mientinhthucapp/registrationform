export interface UploadFileParams {
  data: File;
  filename: string;
}

// Local stand-in for the proprietary `zite-file-upload-sdk` package. Returns a real
// local blob: URL so the receipt preview in PaymentPage works without a real upload.
export async function uploadFile({ data, filename }: UploadFileParams): Promise<{ fileUrl: string }> {
  console.log('[mock zite-file-upload-sdk] uploadFile called with:', filename);
  await new Promise(resolve => setTimeout(resolve, 500));
  const fileUrl = URL.createObjectURL(data);
  console.log('[mock zite-file-upload-sdk] resolved with local object URL (nothing was uploaded anywhere):', fileUrl);
  return { fileUrl };
}
